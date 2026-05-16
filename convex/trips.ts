import { ConvexError, v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import {
  companyStatusValidator,
  documentStatusValidator,
  documentTypeValidator,
  offerStatusValidator,
  tripEventTypeValidator,
  tripStatusValidator,
  uploadedByTypeValidator,
} from './schema';
import { assertDriverCanAccessTrip, requireDriverProfile } from './lib/auth';

const companyReturn = v.object({
  _id: v.id('companies'),
  _creationTime: v.number(),
  name: v.string(),
  city: v.string(),
  status: companyStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const tripFields = {
  _id: v.id('trips'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  originCity: v.string(),
  destinationCity: v.string(),
  routeLabel: v.string(),
  pickupAt: v.number(),
  deliveryEta: v.optional(v.number()),
  cargoDescription: v.string(),
  freightValue: v.optional(v.number()),
  advanceValue: v.optional(v.number()),
  assignedDriverId: v.optional(v.id('drivers')),
  acceptedByDriverId: v.optional(v.id('drivers')),
  status: tripStatusValidator,
  observations: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
};

const tripWithCompanyReturn = v.object({
  ...tripFields,
  company: companyReturn,
});

const availableTripReturn = v.object({
  ...tripFields,
  company: companyReturn,
  offerStatus: offerStatusValidator,
});

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

export const listAvailableForCurrentDriver = query({
  args: {},
  returns: v.array(availableTripReturn),
  handler: async (ctx) => {
    const { profile, driverId } = await requireDriverProfile(ctx);
    const offers = await ctx.db
      .query('tripOffers')
      .withIndex('by_driver_and_status', (q) => q.eq('driverId', driverId).eq('status', 'PENDING'))
      .collect();
    const results: (Doc<'trips'> & { company: Doc<'companies'>; offerStatus: Doc<'tripOffers'>['status'] })[] = [];

    for (const offer of offers) {
      if (offer.companyId !== profile.companyId) {
        continue;
      }

      const trip = await ctx.db.get(offer.tripId);

      if (!trip || trip.companyId !== profile.companyId || trip.status !== 'OFFERED') {
        continue;
      }

      const company = await ctx.db.get(trip.companyId);

      if (company) {
        results.push({
          ...trip,
          company,
          offerStatus: offer.status,
        });
      }
    }

    return results.sort((a, b) => a.pickupAt - b.pickupAt);
  },
});

export const listMineForCurrentDriver = query({
  args: {},
  returns: v.array(tripWithCompanyReturn),
  handler: async (ctx) => {
    const { profile, driverId } = await requireDriverProfile(ctx);
    const acceptedTrips = await ctx.db
      .query('trips')
      .withIndex('by_accepted_driver', (q) => q.eq('acceptedByDriverId', driverId))
      .collect();
    const assignedTrips = await ctx.db
      .query('trips')
      .withIndex('by_assigned_driver', (q) => q.eq('assignedDriverId', driverId))
      .collect();
    const tripsById = new Map<Id<'trips'>, Doc<'trips'>>();

    for (const trip of acceptedTrips) {
      if (trip.companyId === profile.companyId) {
        tripsById.set(trip._id, trip);
      }
    }

    for (const trip of assignedTrips) {
      if (trip.companyId === profile.companyId) {
        tripsById.set(trip._id, trip);
      }
    }

    const results: (Doc<'trips'> & { company: Doc<'companies'> })[] = [];

    for (const trip of tripsById.values()) {
      const company = await ctx.db.get(trip.companyId);

      if (company) {
        results.push({ ...trip, company });
      }
    }

    return results.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const getDetailForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.object({
    trip: v.object(tripFields),
    company: companyReturn,
    documents: v.array(tripDocumentReturn),
    events: v.array(tripEventReturn),
    access: v.object({
      hasPendingOffer: v.boolean(),
      belongsToDriver: v.boolean(),
    }),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    const { trip, offer, belongsToDriver } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);
    const company = await ctx.db.get(trip.companyId);

    if (!company) {
      throw new ConvexError('No tienes acceso a este viaje.');
    }

    const documents = await ctx.db
      .query('tripDocuments')
      .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', args.tripId))
      .order('asc')
      .collect();
    const events = await ctx.db
      .query('tripEvents')
      .withIndex('by_trip_and_occurred_at', (q) => q.eq('tripId', args.tripId))
      .order('desc')
      .collect();
    const eventsWithDrivers: (Doc<'tripEvents'> & { driverName?: string })[] = [];

    for (const event of events) {
      const driver = event.driverId ? await ctx.db.get(event.driverId) : null;
      eventsWithDrivers.push({
        ...event,
        driverName: driver?.fullName,
      });
    }

    return {
      trip,
      company,
      documents,
      events: eventsWithDrivers,
      access: {
        hasPendingOffer: offer?.status === 'PENDING' && trip.status === 'OFFERED',
        belongsToDriver,
      },
    };
  },
});

export const acceptOfferForCurrentDriver = mutation({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile, driverId } = await requireDriverProfile(ctx);
    const trip = await ctx.db.get(args.tripId);

    if (!trip || trip.companyId !== profile.companyId) {
      throw new ConvexError('No tienes acceso a este viaje.');
    }

    const offer = await ctx.db
      .query('tripOffers')
      .withIndex('by_trip_and_driver', (q) => q.eq('tripId', args.tripId).eq('driverId', driverId))
      .first();
    const alreadyAcceptedByDriver = trip.acceptedByDriverId === driverId || trip.assignedDriverId === driverId;
    const now = Date.now();

    if (alreadyAcceptedByDriver) {
      if (offer && offer.status === 'PENDING') {
        await ctx.db.patch(offer._id, {
          status: 'ACCEPTED',
          updatedAt: now,
        });
      }

      return null;
    }

    if (!offer || offer.companyId !== profile.companyId) {
      throw new ConvexError('No hay una oferta disponible para tu conductor.');
    }

    if (offer.status === 'ACCEPTED') {
      return null;
    }

    if (offer.status !== 'PENDING') {
      throw new ConvexError('La oferta ya no está disponible.');
    }

    if (trip.status !== 'OFFERED') {
      throw new ConvexError('Este viaje ya no está disponible.');
    }

    await ctx.db.patch(offer._id, {
      status: 'ACCEPTED',
      updatedAt: now,
    });
    await ctx.db.patch(args.tripId, {
      status: 'ACCEPTED',
      acceptedByDriverId: driverId,
      assignedDriverId: driverId,
      updatedAt: now,
    });

    await ctx.db.insert('tripEvents', {
      companyId: trip.companyId,
      tripId: args.tripId,
      driverId,
      eventType: 'TRIP_ACCEPTED',
      note: 'Viaje aceptado desde la app.',
      occurredAt: now,
      createdAt: now,
    });

    return null;
  },
});
