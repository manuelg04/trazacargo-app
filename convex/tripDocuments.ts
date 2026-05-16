import { query } from './_generated/server';
import { v } from 'convex/values';
import { documentStatusValidator, documentTypeValidator, uploadedByTypeValidator } from './schema';
import { assertDispatcherCanAccessTrip, assertDriverCanAccessTrip, requireDispatcherOrAdminProfile, requireDriverProfile } from './lib/permissions';

const tripDocumentReturn = v.object({
  _id: v.id('tripDocuments'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  documentType: documentTypeValidator,
  displayName: v.string(),
  fileName: v.string(),
  uploadedByType: uploadedByTypeValidator,
  status: documentStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

export const listByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);

    return await ctx.db
      .query('tripDocuments')
      .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', args.tripId))
      .order('asc')
      .collect();
  },
});

export const listByTripForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);

    return await ctx.db
      .query('tripDocuments')
      .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', args.tripId))
      .order('asc')
      .collect();
  },
});
