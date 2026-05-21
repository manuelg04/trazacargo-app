import { ConvexError, v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { MutationCtx, QueryCtx, internalMutation, mutation, query } from './_generated/server';
import {
  documentDirectionValidator,
  documentRequirementStatusValidator,
  documentTypeValidator,
} from './schema';
import {
  assertCompanyDocumentType,
  assertDriverDocumentType,
  assertRequiredText,
  serializeTripDocument,
  tripDocumentWithUrlReturn,
} from './lib/documents';
import {
  assertDispatcherCanAccessTrip,
  assertDriverCanAccessTrip,
  assertSameCompany,
  requireDispatcherOrAdminProfile,
  requireDriverProfile,
} from './lib/permissions';
import { createTripDocumentReviewEvent } from './tripDocumentReviewEvents';
import {
  defaultCompanyDocumentRequirementTemplates,
  listActiveTemplatesForCompany,
} from './companyDocumentRequirementTemplates';
import { queuePushNotification } from './pushNotifications';
import {
  DOCUMENT_DUE_SOON_WINDOW_MS,
  getResponsibleDriverIdForDeadline,
  shouldNotifyDocumentDueSoon,
  shouldNotifyDocumentOverdue,
} from './lib/documentDeadlineNotifications';

type RequirementCtx = QueryCtx | MutationCtx;
type RequirementDirection = Doc<'tripDocumentRequirements'>['direction'];
type RequirementStatus = Doc<'tripDocumentRequirements'>['status'];
type RequirementDocumentType = Doc<'tripDocumentRequirements'>['documentType'];

const requirementFields = {
  _id: v.id('tripDocumentRequirements'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  direction: documentDirectionValidator,
  documentType: documentTypeValidator,
  displayName: v.string(),
  required: v.boolean(),
  status: documentRequirementStatusValidator,
  dueAt: v.optional(v.number()),
  latestDocumentId: v.optional(v.id('tripDocuments')),
  satisfiedByDocumentId: v.optional(v.id('tripDocuments')),
  waivedByUserId: v.optional(v.id('users')),
  waivedAt: v.optional(v.number()),
  waiverReason: v.optional(v.string()),
  createdByUserId: v.optional(v.id('users')),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const documentSummaryReturn = v.object({
  totalRequired: v.number(),
  pendingRequired: v.number(),
  inReviewRequired: v.number(),
  rejectedRequired: v.number(),
  satisfiedRequired: v.number(),
  waivedRequired: v.number(),
  isComplete: v.boolean(),
  hasRejected: v.boolean(),
  hasPending: v.boolean(),
  hasInReview: v.boolean(),
});

export const documentRequirementWithDocumentsReturn = v.object({
  ...requirementFields,
  latestDocument: v.union(v.null(), tripDocumentWithUrlReturn),
  satisfiedByDocument: v.union(v.null(), tripDocumentWithUrlReturn),
});

export const listByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(documentRequirementWithDocumentsReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);
    return await listSerializedRequirementsByTrip(ctx, args.tripId);
  },
});

export const listByTripForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(documentRequirementWithDocumentsReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    return await listSerializedRequirementsByTrip(ctx, args.tripId);
  },
});

export const createForTripByDispatcher = mutation({
  args: {
    tripId: v.id('trips'),
    direction: documentDirectionValidator,
    documentType: documentTypeValidator,
    displayName: v.string(),
    required: v.boolean(),
    dueAt: v.optional(v.union(v.number(), v.string())),
  },
  returns: documentRequirementWithDocumentsReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para el requisito.');
    const dueAt = parseOptionalDueAt(args.dueAt);
    assertDocumentTypeForDirection(args.direction, args.documentType);
    await assertNoActiveRequirementDuplicate(ctx, trip.companyId, args.tripId, args.direction, args.documentType);
    const now = Date.now();
    const requirementId = await ctx.db.insert('tripDocumentRequirements', {
      companyId: trip.companyId,
      tripId: args.tripId,
      direction: args.direction,
      documentType: args.documentType,
      displayName,
      required: args.required,
      status: 'PENDING',
      dueAt,
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });
    const requirement = await ctx.db.get(requirementId);

    if (!requirement) {
      throw new ConvexError('No se pudo crear el requisito.');
    }

    return await serializeRequirement(ctx, requirement);
  },
});

export const waiveForTripByDispatcher = mutation({
  args: {
    requirementId: v.id('tripDocumentRequirements'),
    waiverReason: v.string(),
  },
  returns: documentRequirementWithDocumentsReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const requirement = await getRequirementForDispatcher(ctx, args.requirementId, profile.companyId);
    const waiverReason = assertRequiredText(args.waiverReason, 'Ingresa el motivo de exención.');
    const now = Date.now();
    const beforeSummary = await computeTripDocumentSummary(ctx, requirement.tripId);

    await ctx.db.patch(requirement._id, {
      status: 'WAIVED',
      waivedByUserId: userId,
      waivedAt: now,
      waiverReason,
      updatedAt: now,
    });
    await createTripDocumentReviewEvent(ctx, {
      companyId: requirement.companyId,
      tripId: requirement.tripId,
      requirementId: requirement._id,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'REQUIREMENT_WAIVED',
      note: waiverReason,
      createdAt: now,
    });

    const afterSummary = await computeTripDocumentSummary(ctx, requirement.tripId);

    if (!beforeSummary.isComplete && afterSummary.isComplete) {
      await queuePushNotification(ctx, {
        kind: 'documentation_complete',
        companyId: requirement.companyId,
        tripId: requirement.tripId,
        target: 'dispatcher_admins',
      });
    }

    const updatedRequirement = await ctx.db.get(requirement._id);

    if (!updatedRequirement) {
      throw new ConvexError('No se pudo actualizar el requisito.');
    }

    return await serializeRequirement(ctx, updatedRequirement);
  },
});

export const reactivateForTripByDispatcher = mutation({
  args: {
    requirementId: v.id('tripDocumentRequirements'),
  },
  returns: documentRequirementWithDocumentsReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const requirement = await getRequirementForDispatcher(ctx, args.requirementId, profile.companyId);
    const now = Date.now();
    const status = await resolveRequirementStatusFromLatestDocument(ctx, requirement);

    await ctx.db.patch(requirement._id, {
      status,
      waivedByUserId: undefined,
      waivedAt: undefined,
      waiverReason: undefined,
      updatedAt: now,
    });
    await createTripDocumentReviewEvent(ctx, {
      companyId: requirement.companyId,
      tripId: requirement.tripId,
      requirementId: requirement._id,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'REQUIREMENT_REACTIVATED',
      createdAt: now,
    });

    const updatedRequirement = await ctx.db.get(requirement._id);

    if (!updatedRequirement) {
      throw new ConvexError('No se pudo reactivar el requisito.');
    }

    return await serializeRequirement(ctx, updatedRequirement);
  },
});

export const updateRequirementDueDateByDispatcher = mutation({
  args: {
    requirementId: v.id('tripDocumentRequirements'),
    dueAt: v.optional(v.union(v.number(), v.string())),
  },
  returns: documentRequirementWithDocumentsReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const requirement = await getRequirementForDispatcher(ctx, args.requirementId, profile.companyId);
    const now = Date.now();
    const dueAt = parseOptionalDueAt(args.dueAt);

    await ctx.db.patch(requirement._id, {
      dueAt,
      updatedAt: now,
    });
    await createTripDocumentReviewEvent(ctx, {
      companyId: requirement.companyId,
      tripId: requirement.tripId,
      requirementId: requirement._id,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'REQUIREMENT_DUE_DATE_UPDATED',
      note: dueAt === undefined ? 'Fecha límite limpiada.' : 'Fecha límite actualizada.',
      createdAt: now,
    });

    const updatedRequirement = await ctx.db.get(requirement._id);

    if (!updatedRequirement) {
      throw new ConvexError('No se pudo actualizar la fecha límite.');
    }

    return await serializeRequirement(ctx, updatedRequirement);
  },
});

export const getDocumentSummaryForTrip = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: documentSummaryReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    return await computeTripDocumentSummary(ctx, args.tripId);
  },
});

export const queueDocumentDeadlineNotifications = internalMutation({
  args: {},
  returns: v.object({
    dueSoonQueued: v.number(),
    overdueDriverQueued: v.number(),
    overdueStaffQueued: v.number(),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    const dueSoonRequirements = await listRequirementsWithDueAtBetween(ctx, now, now + DOCUMENT_DUE_SOON_WINDOW_MS);
    const overdueRequirements = await listRequirementsWithDueAtBetween(ctx, undefined, now);
    let dueSoonQueued = 0;
    let overdueDriverQueued = 0;
    let overdueStaffQueued = 0;

    for (const requirement of dueSoonRequirements) {
      const trip = await ctx.db.get(requirement.tripId);

      if (!trip || !shouldNotifyDocumentDueSoon(requirement, trip, now)) {
        continue;
      }

      const driverId = getResponsibleDriverIdForDeadline(trip) as Id<'drivers'> | undefined;

      if (!driverId || requirement.dueAt === undefined) {
        continue;
      }

      const eventId = await queuePushNotification(ctx, {
        kind: 'document_due_soon',
        companyId: requirement.companyId,
        tripId: requirement.tripId,
        driverIds: [driverId],
        driverId,
        requirementId: requirement._id,
        deadlineAt: requirement.dueAt,
        notificationAudience: 'driver',
        ignoreAnyExistingEvent: true,
        target: 'drivers',
      });

      if (eventId) {
        dueSoonQueued += 1;
      }
    }

    for (const requirement of overdueRequirements) {
      const trip = await ctx.db.get(requirement.tripId);

      if (!trip || !shouldNotifyDocumentOverdue(requirement, trip, now)) {
        continue;
      }

      const driverId = getResponsibleDriverIdForDeadline(trip) as Id<'drivers'> | undefined;

      if (!driverId || requirement.dueAt === undefined) {
        continue;
      }

      const driverEventId = await queuePushNotification(ctx, {
        kind: 'document_overdue',
        companyId: requirement.companyId,
        tripId: requirement.tripId,
        driverIds: [driverId],
        driverId,
        requirementId: requirement._id,
        deadlineAt: requirement.dueAt,
        notificationAudience: 'driver',
        ignoreAnyExistingEvent: true,
        target: 'drivers',
      });

      if (driverEventId) {
        overdueDriverQueued += 1;
      }

      const staffEventId = await queuePushNotification(ctx, {
        kind: 'document_overdue',
        companyId: requirement.companyId,
        tripId: requirement.tripId,
        requirementId: requirement._id,
        deadlineAt: requirement.dueAt,
        notificationAudience: 'staff',
        ignoreAnyExistingEvent: true,
        target: 'dispatcher_admins',
      });

      if (staffEventId) {
        overdueStaffQueued += 1;
      }
    }

    return { dueSoonQueued, overdueDriverQueued, overdueStaffQueued };
  },
});

export async function listSerializedRequirementsByTrip(ctx: RequirementCtx, tripId: Id<'trips'>) {
  const requirements = await listRequirementsByTrip(ctx, tripId);
  return await Promise.all(requirements.map((requirement) => serializeRequirement(ctx, requirement)));
}

export async function listRequirementsByTrip(ctx: RequirementCtx, tripId: Id<'trips'>) {
  const requirements = await ctx.db
    .query('tripDocumentRequirements')
    .withIndex('by_trip', (q) => q.eq('tripId', tripId))
    .collect();

  return requirements.sort((a, b) => {
    if (a.direction !== b.direction) {
      return a.direction === 'COMPANY_TO_DRIVER' ? -1 : 1;
    }

    if (a.required !== b.required) {
      return a.required ? -1 : 1;
    }

    return a.createdAt - b.createdAt;
  });
}

export async function serializeRequirement(ctx: RequirementCtx, requirement: Doc<'tripDocumentRequirements'>) {
  const latestDocument = requirement.latestDocumentId ? await ctx.db.get(requirement.latestDocumentId) : null;
  const satisfiedByDocument = requirement.satisfiedByDocumentId ? await ctx.db.get(requirement.satisfiedByDocumentId) : null;

  return {
    ...requirement,
    latestDocument: latestDocument ? await serializeTripDocument(ctx, latestDocument) : null,
    satisfiedByDocument: satisfiedByDocument ? await serializeTripDocument(ctx, satisfiedByDocument) : null,
  };
}

export async function computeTripDocumentSummary(ctx: RequirementCtx, tripId: Id<'trips'>) {
  const requirements = await listRequirementsByTrip(ctx, tripId);
  return summarizeRequirements(requirements);
}

export function summarizeRequirements(requirements: Doc<'tripDocumentRequirements'>[]) {
  const requiredRequirements = requirements.filter((requirement) => requirement.required);
  const pendingRequired = countByStatus(requiredRequirements, 'PENDING');
  const inReviewRequired = countByStatus(requiredRequirements, 'IN_REVIEW');
  const rejectedRequired = countByStatus(requiredRequirements, 'REJECTED');
  const satisfiedRequired = countByStatus(requiredRequirements, 'SATISFIED');
  const waivedRequired = countByStatus(requiredRequirements, 'WAIVED');

  return {
    totalRequired: requiredRequirements.length,
    pendingRequired,
    inReviewRequired,
    rejectedRequired,
    satisfiedRequired,
    waivedRequired,
    isComplete:
      requiredRequirements.length > 0 &&
      requiredRequirements.every((requirement) => requirement.status === 'SATISFIED' || requirement.status === 'WAIVED'),
    hasRejected: rejectedRequired > 0,
    hasPending: pendingRequired > 0,
    hasInReview: inReviewRequired > 0,
  };
}

export async function createDefaultRequirementsForTrip(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  createdByUserId: Id<'users'> | undefined,
  now = Date.now(),
) {
  const trip = await ctx.db.get(tripId);

  if (!trip) {
    throw new ConvexError('El viaje no existe.');
  }

  const activeTemplates = await listActiveTemplatesForCompany(ctx, companyId);
  const requirements = activeTemplates.length > 0 ? activeTemplates : defaultCompanyDocumentRequirementTemplates;
  const dueBaseAt = trip.pickupAt ?? now;
  let createdCount = 0;

  for (const requirement of requirements) {
    const existing = await findExistingRequirementForTemplate(
      ctx,
      companyId,
      tripId,
      requirement.direction,
      requirement.documentType,
      requirement.displayName,
    );

    if (existing) {
      continue;
    }

    const dueAt =
      'defaultDueOffsetHours' in requirement && requirement.defaultDueOffsetHours !== undefined
        ? dueBaseAt + requirement.defaultDueOffsetHours * 60 * 60 * 1000
        : undefined;

    await ctx.db.insert('tripDocumentRequirements', {
      companyId,
      tripId,
      direction: requirement.direction,
      documentType: requirement.documentType,
      displayName: requirement.displayName,
      required: requirement.required,
      status: 'PENDING',
      dueAt,
      createdByUserId,
      createdAt: now,
      updatedAt: now,
    });
    createdCount += 1;
  }

  return createdCount;
}

export async function validateRequirementForDocument(
  ctx: MutationCtx,
  input: {
    requirementId: Id<'tripDocumentRequirements'>;
    trip: Doc<'trips'>;
    direction: RequirementDirection;
    documentType: RequirementDocumentType;
  },
) {
  const requirement = await ctx.db.get(input.requirementId);

  if (!requirement) {
    throw new ConvexError('El requisito documental no existe.');
  }

  assertSameCompany(requirement.companyId, input.trip.companyId);

  if (requirement.tripId !== input.trip._id) {
    throw new ConvexError('El requisito no pertenece a este viaje.');
  }

  if (requirement.direction !== input.direction) {
    throw new ConvexError('El requisito no corresponde a este flujo documental.');
  }

  if (requirement.documentType !== input.documentType) {
    throw new ConvexError('El tipo de documento no coincide con el requisito.');
  }

  if (requirement.status === 'WAIVED') {
    throw new ConvexError('Reactiva el requisito antes de asociar un documento.');
  }

  return requirement;
}

export async function updateRequirementAfterDocumentCreated(
  ctx: MutationCtx,
  requirementId: Id<'tripDocumentRequirements'>,
  documentId: Id<'tripDocuments'>,
  direction: RequirementDirection,
  now = Date.now(),
) {
  const nextStatus: RequirementStatus = direction === 'COMPANY_TO_DRIVER' ? 'SATISFIED' : 'IN_REVIEW';
  const patch =
    direction === 'COMPANY_TO_DRIVER'
      ? {
          status: nextStatus,
          latestDocumentId: documentId,
          satisfiedByDocumentId: documentId,
          waivedByUserId: undefined,
          waivedAt: undefined,
          waiverReason: undefined,
          updatedAt: now,
        }
      : {
          status: nextStatus,
          latestDocumentId: documentId,
          satisfiedByDocumentId: undefined,
          waivedByUserId: undefined,
          waivedAt: undefined,
          waiverReason: undefined,
          updatedAt: now,
        };

  await ctx.db.patch(requirementId, patch);
}

export async function updateRequirementAfterDocumentApproved(
  ctx: MutationCtx,
  requirementId: Id<'tripDocumentRequirements'>,
  documentId: Id<'tripDocuments'>,
  now = Date.now(),
) {
  await ctx.db.patch(requirementId, {
    status: 'SATISFIED',
    latestDocumentId: documentId,
    satisfiedByDocumentId: documentId,
    updatedAt: now,
  });
}

export async function updateRequirementAfterDocumentRejected(
  ctx: MutationCtx,
  requirementId: Id<'tripDocumentRequirements'>,
  documentId: Id<'tripDocuments'>,
  now = Date.now(),
) {
  await ctx.db.patch(requirementId, {
    status: 'REJECTED',
    latestDocumentId: documentId,
    updatedAt: now,
  });
}

function countByStatus(requirements: Doc<'tripDocumentRequirements'>[], status: RequirementStatus) {
  return requirements.filter((requirement) => requirement.status === status).length;
}

async function getRequirementForDispatcher(
  ctx: MutationCtx,
  requirementId: Id<'tripDocumentRequirements'>,
  companyId: Id<'companies'>,
) {
  const requirement = await ctx.db.get(requirementId);

  if (!requirement) {
    throw new ConvexError('El requisito documental no existe.');
  }

  assertSameCompany(requirement.companyId, companyId);
  const trip = await ctx.db.get(requirement.tripId);

  if (!trip) {
    throw new ConvexError('El viaje no existe.');
  }

  assertSameCompany(trip.companyId, companyId);
  return requirement;
}

async function assertNoActiveRequirementDuplicate(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  direction: RequirementDirection,
  documentType: RequirementDocumentType,
) {
  const existing = await findActiveRequirement(ctx, companyId, tripId, direction, documentType);

  if (existing) {
    throw new ConvexError('Ya existe un requisito activo con este tipo de documento.');
  }
}

async function findActiveRequirement(
  ctx: RequirementCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  direction: RequirementDirection,
  documentType: RequirementDocumentType,
) {
  const requirements = await ctx.db
    .query('tripDocumentRequirements')
    .withIndex('by_trip_and_direction', (q) => q.eq('tripId', tripId).eq('direction', direction))
    .collect();

  return requirements.find(
    (requirement) =>
      requirement.companyId === companyId &&
      requirement.documentType === documentType &&
      requirement.status !== 'WAIVED',
  );
}

async function listRequirementsWithDueAtBetween(ctx: MutationCtx, from: number | undefined, to: number) {
  const statuses: RequirementStatus[] = ['PENDING', 'REJECTED'];
  const requirements: Doc<'tripDocumentRequirements'>[] = [];

  for (const status of statuses) {
    const query = ctx.db
      .query('tripDocumentRequirements')
      .withIndex('by_status_and_dueAt', (q) => {
        const statusQuery = q.eq('status', status);
        return from === undefined ? statusQuery.lte('dueAt', to) : statusQuery.gte('dueAt', from).lte('dueAt', to);
      });

    requirements.push(...(await query.collect()));
  }

  return requirements;
}

async function findExistingRequirementForTemplate(
  ctx: RequirementCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  direction: RequirementDirection,
  documentType: RequirementDocumentType,
  displayName: string,
) {
  const requirements = await ctx.db
    .query('tripDocumentRequirements')
    .withIndex('by_trip_and_direction', (q) => q.eq('tripId', tripId).eq('direction', direction))
    .collect();
  const normalizedName = displayName.trim().toLocaleLowerCase();

  return requirements.find(
    (requirement) =>
      requirement.companyId === companyId &&
      requirement.documentType === documentType &&
      requirement.displayName.trim().toLocaleLowerCase() === normalizedName,
  );
}

function assertDocumentTypeForDirection(direction: RequirementDirection, documentType: RequirementDocumentType) {
  if (direction === 'COMPANY_TO_DRIVER') {
    assertCompanyDocumentType(documentType);
    return;
  }

  assertDriverDocumentType(documentType);
}

function parseOptionalDueAt(value: string | number | undefined) {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new ConvexError('Ingresa una fecha límite válida.');
    }

    return value;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const timestamp = Date.parse(trimmedValue);

  if (!Number.isFinite(timestamp)) {
    throw new ConvexError('Ingresa una fecha límite válida.');
  }

  return timestamp;
}

async function resolveRequirementStatusFromLatestDocument(
  ctx: MutationCtx,
  requirement: Doc<'tripDocumentRequirements'>,
) {
  const latestDocument = requirement.latestDocumentId
    ? await ctx.db.get(requirement.latestDocumentId)
    : await findLatestDocumentForRequirement(ctx, requirement._id);

  if (!latestDocument || latestDocument.status === 'ARCHIVED') {
    return 'PENDING';
  }

  if (requirement.direction === 'COMPANY_TO_DRIVER') {
    return 'SATISFIED';
  }

  if (latestDocument.status === 'APPROVED') {
    return 'SATISFIED';
  }

  if (latestDocument.status === 'REJECTED') {
    return 'REJECTED';
  }

  if (latestDocument.status === 'SUBMITTED' || latestDocument.status === 'PENDING') {
    return 'IN_REVIEW';
  }

  return 'PENDING';
}

async function findLatestDocumentForRequirement(ctx: MutationCtx, requirementId: Id<'tripDocumentRequirements'>) {
  const documents = await ctx.db
    .query('tripDocuments')
    .withIndex('by_requirement', (q) => q.eq('requirementId', requirementId))
    .collect();

  return documents.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
}
