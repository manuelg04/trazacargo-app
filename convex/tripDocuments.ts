import { query } from './_generated/server';
import { v } from 'convex/values';
import { documentStatusValidator, documentTypeValidator, uploadedByTypeValidator } from './schema';

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

export const listByTrip = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentReturn),
  handler: async (ctx, args) => {
    return await ctx.db
      .query('tripDocuments')
      .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', args.tripId))
      .order('asc')
      .collect();
  },
});
