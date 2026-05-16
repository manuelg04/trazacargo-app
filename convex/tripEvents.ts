import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { tripEventTypeValidator } from './schema';
import { Doc } from './_generated/dataModel';
import { assertDriverCanAccessTrip, requireDriverProfile } from './lib/auth';

const tripEventReturn = v.object({
  _id: v.id('tripEvents'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  driverId: v.optional(v.id('drivers')),
  eventType: tripEventTypeValidator,
  note: v.optional(v.string()),
  latitude: v.optional(v.number()),
  longitude: v.optional(v.number()),
  occurredAt: v.number(),
  createdAt: v.number(),
  driverName: v.optional(v.string()),
});

type TripEventType =
  | 'TRIP_ACCEPTED'
  | 'ARRIVED_TO_LOADING'
  | 'LOADED'
  | 'STARTED_ROUTE'
  | 'ARRIVED_TO_UNLOADING'
  | 'UNLOADED'
  | 'DOCUMENTS_SUBMITTED'
  | 'ISSUE_REPORTED';

type TripStatus =
  | 'DRAFT'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'IN_LOADING'
  | 'LOADED'
  | 'IN_TRANSIT'
  | 'IN_UNLOADING'
  | 'UNLOADED'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_SUBMITTED'
  | 'DOCUMENTS_APPROVED'
  | 'CLOSED'
  | 'CANCELLED';

export const createForCurrentDriver = mutation({
  args: {
    tripId: v.id('trips'),
    eventType: tripEventTypeValidator,
    note: v.optional(v.string()),
  },
  returns: v.id('tripEvents'),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    const { trip, belongsToDriver, driverId } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);

    if (!belongsToDriver) {
      throw new ConvexError('Debes aceptar el viaje antes de registrar eventos.');
    }

    const now = Date.now();
    const eventId = await ctx.db.insert('tripEvents', {
      companyId: trip.companyId,
      tripId: args.tripId,
      driverId,
      eventType: args.eventType,
      note: args.note,
      occurredAt: now,
      createdAt: now,
    });
    const nextStatus = getNextStatus(args.eventType);

    if (nextStatus) {
      await ctx.db.patch(args.tripId, {
        status: nextStatus,
        updatedAt: now,
      });
    }

    return eventId;
  },
});

export const listByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripEventReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);

    const events = await ctx.db
      .query('tripEvents')
      .withIndex('by_trip_and_occurred_at', (q) => q.eq('tripId', args.tripId))
      .order('desc')
      .collect();
    const results: (Doc<'tripEvents'> & { driverName?: string })[] = [];

    for (const event of events) {
      const driver = event.driverId ? await ctx.db.get(event.driverId) : null;
      results.push({
        ...event,
        driverName: driver?.fullName,
      });
    }

    return results;
  },
});

function getNextStatus(eventType: TripEventType): TripStatus | null {
  if (eventType === 'ARRIVED_TO_LOADING') {
    return 'IN_LOADING';
  }

  if (eventType === 'LOADED') {
    return 'LOADED';
  }

  if (eventType === 'STARTED_ROUTE') {
    return 'IN_TRANSIT';
  }

  if (eventType === 'ARRIVED_TO_UNLOADING') {
    return 'IN_UNLOADING';
  }

  if (eventType === 'UNLOADED') {
    return 'UNLOADED';
  }

  if (eventType === 'DOCUMENTS_SUBMITTED') {
    return 'DOCUMENTS_SUBMITTED';
  }

  return null;
}
