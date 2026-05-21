import { ConvexError, v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { MutationCtx, mutation, query } from './_generated/server';
import { documentDirectionValidator, documentTypeValidator } from './schema';
import {
  assertAllowedFileMetadata,
  assertCompanyDocumentType,
  assertDriverDocumentType,
  assertRequiredText,
  listTripDocumentsWithUrls,
  normalizeDocumentDirection,
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
import {
  computeTripDocumentSummary,
  updateRequirementAfterDocumentApproved,
  updateRequirementAfterDocumentCreated,
  updateRequirementAfterDocumentRejected,
  validateRequirementForDocument,
} from './tripDocumentRequirements';
import { createTripDocumentReviewEvent } from './tripDocumentReviewEvents';
import { queuePushNotification } from './pushNotifications';

export const generateUploadUrlForCurrentUser = mutation({
  args: {
    tripId: v.id('trips'),
    direction: documentDirectionValidator,
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (args.direction === 'COMPANY_TO_DRIVER') {
      const { profile } = await requireDispatcherOrAdminProfile(ctx);
      await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    } else {
      const { profile } = await requireDriverProfile(ctx);
      const { belongsToDriver } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);

      if (!belongsToDriver) {
        throw new ConvexError('Solo puedes subir documentos de viajes aceptados o asignados.');
      }
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const createCompanyDocumentForTrip = mutation({
  args: {
    tripId: v.id('trips'),
    documentType: documentTypeValidator,
    displayName: v.string(),
    storageId: v.id('_storage'),
    originalFileName: v.string(),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    requirementId: v.optional(v.id('tripDocumentRequirements')),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para el documento.');
    const originalFileName = assertRequiredText(args.originalFileName, 'El archivo debe tener nombre.');
    const now = Date.now();

    assertCompanyDocumentType(args.documentType);
    assertAllowedFileMetadata(args.mimeType, args.sizeBytes);

    if (args.requirementId) {
      await validateRequirementForDocument(ctx, {
        requirementId: args.requirementId,
        trip,
        direction: 'COMPANY_TO_DRIVER',
        documentType: args.documentType,
      });
    }

    const documentId = await ctx.db.insert('tripDocuments', {
      companyId: trip.companyId,
      tripId: args.tripId,
      requirementId: args.requirementId,
      documentType: args.documentType,
      direction: 'COMPANY_TO_DRIVER',
      displayName,
      fileName: originalFileName,
      originalFileName,
      storageId: args.storageId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadedByUserId: userId,
      uploadedByType: profile.role,
      status: 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
    });

    if (args.requirementId) {
      await updateRequirementAfterDocumentCreated(ctx, args.requirementId, documentId, 'COMPANY_TO_DRIVER', now);
    }
    await createTripDocumentReviewEvent(ctx, {
      companyId: trip.companyId,
      tripId: args.tripId,
      requirementId: args.requirementId,
      documentId,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'DOCUMENT_SUBMITTED',
      createdAt: now,
    });

    const document = await ctx.db.get(documentId);

    if (!document) {
      throw new ConvexError('No se pudo guardar el documento.');
    }

    const driverId = trip.acceptedByDriverId ?? trip.assignedDriverId;

    if (driverId) {
      await queuePushNotification(ctx, {
        kind: 'company_document_available',
        companyId: trip.companyId,
        tripId: args.tripId,
        driverIds: [driverId],
        driverId,
        documentId,
        requirementId: args.requirementId,
        target: 'drivers',
      });
    }

    return await serializeTripDocument(ctx, document);
  },
});

export const createDriverDocumentForTrip = mutation({
  args: {
    tripId: v.id('trips'),
    documentType: documentTypeValidator,
    displayName: v.string(),
    storageId: v.id('_storage'),
    originalFileName: v.string(),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    parentDocumentId: v.optional(v.id('tripDocuments')),
    requirementId: v.optional(v.id('tripDocumentRequirements')),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile, driverId } = await requireDriverProfile(ctx);
    const { trip, belongsToDriver } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para el documento.');
    const originalFileName = assertRequiredText(args.originalFileName, 'El archivo debe tener nombre.');
    const now = Date.now();

    assertDriverDocumentType(args.documentType);
    assertAllowedFileMetadata(args.mimeType, args.sizeBytes);

    if (!belongsToDriver) {
      throw new ConvexError('Solo puedes subir documentos de viajes aceptados o asignados.');
    }

    let resolvedRequirementId = args.requirementId;
    let matchedRequirementStatus: 'PENDING' | 'IN_REVIEW' | 'SATISFIED' | 'REJECTED' | 'WAIVED' | undefined;

    if (args.parentDocumentId) {
      const parentDocument = await ctx.db.get(args.parentDocumentId);

      if (
        !parentDocument ||
        parentDocument.tripId !== args.tripId ||
        parentDocument.companyId !== trip.companyId ||
        parentDocument.status !== 'REJECTED' ||
        normalizeDocumentDirection(parentDocument) !== 'DRIVER_TO_COMPANY'
      ) {
        throw new ConvexError('No se puede reenviar este documento.');
      }

      if (parentDocument.requirementId) {
        if (resolvedRequirementId && resolvedRequirementId !== parentDocument.requirementId) {
          throw new ConvexError('El requisito no coincide con el documento rechazado.');
        }

        resolvedRequirementId = parentDocument.requirementId;
      }
    }

    if (resolvedRequirementId) {
      const requirement = await validateRequirementForDocument(ctx, {
        requirementId: resolvedRequirementId,
        trip,
        direction: 'DRIVER_TO_COMPANY',
        documentType: args.documentType,
      });
      matchedRequirementStatus = requirement.status;
    }

    const documentId = await ctx.db.insert('tripDocuments', {
      companyId: trip.companyId,
      tripId: args.tripId,
      requirementId: resolvedRequirementId,
      documentType: args.documentType,
      direction: 'DRIVER_TO_COMPANY',
      displayName,
      fileName: originalFileName,
      originalFileName,
      storageId: args.storageId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadedByUserId: userId,
      uploadedByType: 'DRIVER',
      status: 'SUBMITTED',
      parentDocumentId: args.parentDocumentId,
      createdAt: now,
      updatedAt: now,
    });

    if (resolvedRequirementId) {
      await updateRequirementAfterDocumentCreated(ctx, resolvedRequirementId, documentId, 'DRIVER_TO_COMPANY', now);
    }
    await createTripDocumentReviewEvent(ctx, {
      companyId: trip.companyId,
      tripId: args.tripId,
      requirementId: resolvedRequirementId,
      documentId,
      actorUserId: userId,
      actorRole: 'DRIVER',
      eventType: args.parentDocumentId || matchedRequirementStatus === 'REJECTED' ? 'DOCUMENT_RESUBMITTED' : 'DOCUMENT_SUBMITTED',
      createdAt: now,
    });
    await queuePushNotification(ctx, {
      kind: 'driver_document_uploaded',
      companyId: trip.companyId,
      tripId: args.tripId,
      driverId,
      documentId,
      requirementId: resolvedRequirementId,
      target: 'dispatcher_admins',
    });

    const document = await ctx.db.get(documentId);

    if (!document) {
      throw new ConvexError('No se pudo guardar el documento.');
    }

    return await serializeTripDocument(ctx, document);
  },
});

export const listByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentWithUrlReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);

    return await listTripDocumentsWithUrls(ctx, args.tripId);
  },
});

export const listByTripForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentWithUrlReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);

    return await listTripDocumentsWithUrls(ctx, args.tripId);
  },
});

export const approveDriverDocument = mutation({
  args: {
    documentId: v.id('tripDocuments'),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const document = await getDispatcherDocument(ctx, args.documentId, profile.companyId);

    if (normalizeDocumentDirection(document) !== 'DRIVER_TO_COMPANY') {
      throw new ConvexError('Solo puedes aprobar documentos enviados por el conductor.');
    }

    const now = Date.now();
    const beforeSummary = await computeTripDocumentSummary(ctx, document.tripId);

    await ctx.db.patch(args.documentId, {
      status: 'APPROVED',
      rejectionReason: undefined,
      reviewedByUserId: userId,
      reviewedAt: now,
      updatedAt: now,
    });

    if (document.requirementId) {
      await updateRequirementAfterDocumentApproved(ctx, document.requirementId, args.documentId, now);
    }
    await createTripDocumentReviewEvent(ctx, {
      companyId: document.companyId,
      tripId: document.tripId,
      requirementId: document.requirementId,
      documentId: args.documentId,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'DOCUMENT_APPROVED',
      createdAt: now,
    });

    const trip = await ctx.db.get(document.tripId);
    const driverId = trip?.acceptedByDriverId ?? trip?.assignedDriverId;

    if (driverId) {
      await queuePushNotification(ctx, {
        kind: 'document_reviewed',
        companyId: document.companyId,
        tripId: document.tripId,
        driverIds: [driverId],
        driverId,
        documentId: args.documentId,
        requirementId: document.requirementId,
        reviewStatus: 'APPROVED',
        target: 'drivers',
      });
    }

    const afterSummary = await computeTripDocumentSummary(ctx, document.tripId);

    if (!beforeSummary.isComplete && afterSummary.isComplete) {
      await queuePushNotification(ctx, {
        kind: 'documentation_complete',
        companyId: document.companyId,
        tripId: document.tripId,
        target: 'dispatcher_admins',
      });
    }

    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo actualizar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

export const rejectDriverDocument = mutation({
  args: {
    documentId: v.id('tripDocuments'),
    rejectionReason: v.string(),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const document = await getDispatcherDocument(ctx, args.documentId, profile.companyId);
    const rejectionReason = assertRequiredText(args.rejectionReason, 'Ingresa el motivo de rechazo.');

    if (normalizeDocumentDirection(document) !== 'DRIVER_TO_COMPANY') {
      throw new ConvexError('Solo puedes rechazar documentos enviados por el conductor.');
    }

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: 'REJECTED',
      rejectionReason,
      reviewedByUserId: userId,
      reviewedAt: now,
      updatedAt: now,
    });

    if (document.requirementId) {
      await updateRequirementAfterDocumentRejected(ctx, document.requirementId, args.documentId, now);
    }
    await createTripDocumentReviewEvent(ctx, {
      companyId: document.companyId,
      tripId: document.tripId,
      requirementId: document.requirementId,
      documentId: args.documentId,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'DOCUMENT_REJECTED',
      note: rejectionReason,
      createdAt: now,
    });

    const trip = await ctx.db.get(document.tripId);
    const driverId = trip?.acceptedByDriverId ?? trip?.assignedDriverId;

    if (driverId) {
      await queuePushNotification(ctx, {
        kind: 'document_reviewed',
        companyId: document.companyId,
        tripId: document.tripId,
        driverIds: [driverId],
        driverId,
        documentId: args.documentId,
        requirementId: document.requirementId,
        reviewStatus: 'REJECTED',
        target: 'drivers',
      });
    }

    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo actualizar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

export const archiveDocumentForDispatcher = mutation({
  args: {
    documentId: v.id('tripDocuments'),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const document = await getDispatcherDocument(ctx, args.documentId, profile.companyId);

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: 'ARCHIVED',
      updatedAt: now,
    });
    await createTripDocumentReviewEvent(ctx, {
      companyId: document.companyId,
      tripId: document.tripId,
      requirementId: document.requirementId,
      documentId: args.documentId,
      actorUserId: userId,
      actorRole: profile.role,
      eventType: 'DOCUMENT_ARCHIVED',
      createdAt: now,
    });
    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo archivar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

async function getDispatcherDocument(ctx: MutationCtx, documentId: Id<'tripDocuments'>, companyId: Id<'companies'>) {
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new ConvexError('El documento no existe.');
  }

  assertSameCompany(document.companyId, companyId);

  const trip = await ctx.db.get(document.tripId);

  if (!trip) {
    throw new ConvexError('El viaje no existe.');
  }

  assertSameCompany(trip.companyId, companyId);

  return document;
}
