import { v } from 'convex/values';
import { Doc, Id } from './_generated/dataModel';
import { MutationCtx, QueryCtx, query } from './_generated/server';
import {
  documentDirectionValidator,
  documentReviewEventTypeValidator,
  documentTypeValidator,
  userRoleValidator,
} from './schema';
import {
  assertDispatcherCanAccessTrip,
  assertDriverCanAccessTrip,
  requireDispatcherOrAdminProfile,
  requireDriverProfile,
} from './lib/permissions';

type ReviewEventCtx = QueryCtx | MutationCtx;

const reviewEventReturn = v.object({
  _id: v.id('tripDocumentReviewEvents'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  requirementId: v.optional(v.id('tripDocumentRequirements')),
  documentId: v.optional(v.id('tripDocuments')),
  actorRole: userRoleValidator,
  eventType: documentReviewEventTypeValidator,
  note: v.optional(v.string()),
  createdAt: v.number(),
  requirement: v.union(
    v.null(),
    v.object({
      _id: v.id('tripDocumentRequirements'),
      displayName: v.string(),
      documentType: documentTypeValidator,
      direction: documentDirectionValidator,
    }),
  ),
  document: v.union(
    v.null(),
    v.object({
      _id: v.id('tripDocuments'),
      displayName: v.string(),
      documentType: documentTypeValidator,
      direction: v.optional(documentDirectionValidator),
    }),
  ),
});

export const listReviewEventsByTripForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(reviewEventReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    return await listSerializedReviewEventsByTrip(ctx, args.tripId);
  },
});

export const listReviewEventsByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(reviewEventReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);
    return await listSerializedReviewEventsByTrip(ctx, args.tripId);
  },
});

export async function createTripDocumentReviewEvent(
  ctx: MutationCtx,
  input: {
    companyId: Id<'companies'>;
    tripId: Id<'trips'>;
    requirementId?: Id<'tripDocumentRequirements'>;
    documentId?: Id<'tripDocuments'>;
    actorUserId?: Id<'users'>;
    actorRole: Doc<'userProfiles'>['role'];
    eventType: Doc<'tripDocumentReviewEvents'>['eventType'];
    note?: string;
    createdAt?: number;
  },
) {
  return await ctx.db.insert('tripDocumentReviewEvents', {
    companyId: input.companyId,
    tripId: input.tripId,
    requirementId: input.requirementId,
    documentId: input.documentId,
    actorUserId: input.actorUserId,
    actorRole: input.actorRole,
    eventType: input.eventType,
    note: input.note,
    createdAt: input.createdAt ?? Date.now(),
  });
}

async function listSerializedReviewEventsByTrip(ctx: ReviewEventCtx, tripId: Id<'trips'>) {
  const events = await ctx.db
    .query('tripDocumentReviewEvents')
    .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', tripId))
    .order('desc')
    .collect();

  return await Promise.all(events.map((event) => serializeReviewEvent(ctx, event)));
}

async function serializeReviewEvent(ctx: ReviewEventCtx, event: Doc<'tripDocumentReviewEvents'>) {
  const requirement = event.requirementId ? await ctx.db.get(event.requirementId) : null;
  const document = event.documentId ? await ctx.db.get(event.documentId) : null;

  return {
    _id: event._id,
    _creationTime: event._creationTime,
    companyId: event.companyId,
    tripId: event.tripId,
    requirementId: event.requirementId,
    documentId: event.documentId,
    actorRole: event.actorRole,
    eventType: event.eventType,
    note: event.note,
    createdAt: event.createdAt,
    requirement:
      requirement && requirement.companyId === event.companyId
        ? {
            _id: requirement._id,
            displayName: requirement.displayName,
            documentType: requirement.documentType,
            direction: requirement.direction,
          }
        : null,
    document:
      document && document.companyId === event.companyId
        ? {
            _id: document._id,
            displayName: document.displayName,
            documentType: document.documentType,
            direction: document.direction,
          }
        : null,
  };
}
