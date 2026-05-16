import { ConvexError, v } from 'convex/values';
import { MutationCtx, mutation, query } from './_generated/server';
import { Doc, Id } from './_generated/dataModel';
import {
  companyStatusValidator,
  driverStatusValidator,
  offerStatusValidator,
  tripEventTypeValidator,
  tripStatusValidator,
} from './schema';
import { listTripDocumentsWithUrls, tripDocumentWithUrlReturn } from './lib/documents';
import {
  assertDispatcherCanAccessTrip,
  assertDriverBelongsToCompany,
  assertDriverCanAccessTrip,
  requireDispatcherOrAdminProfile,
  requireDriverProfile,
} from './lib/permissions';

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

const driverReturn = v.object({
  _id: v.id('drivers'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  fullName: v.string(),
  phone: v.string(),
  documentNumber: v.string(),
  status: driverStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
});

const offerWithDriverReturn = v.object({
  _id: v.id('tripOffers'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  driverId: v.id('drivers'),
  status: offerStatusValidator,
  createdAt: v.number(),
  updatedAt: v.number(),
  driver: driverReturn,
});

const dispatcherTripReturn = v.object({
  ...tripFields,
  assignedDriver: v.union(v.null(), driverReturn),
  acceptedDriver: v.union(v.null(), driverReturn),
  offerCount: v.number(),
  pendingOfferCount: v.number(),
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
    documents: v.array(tripDocumentWithUrlReturn),
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

    const documents = await listTripDocumentsWithUrls(ctx, args.tripId);
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
      if (offer && offer.status !== 'ACCEPTED') {
        await ctx.db.patch(offer._id, {
          status: 'ACCEPTED',
          updatedAt: now,
        });
      }

      if (trip.status !== 'ACCEPTED' || trip.acceptedByDriverId !== driverId || trip.assignedDriverId !== driverId) {
        await ctx.db.patch(args.tripId, {
          status: 'ACCEPTED',
          acceptedByDriverId: driverId,
          assignedDriverId: driverId,
          updatedAt: now,
        });
      }

      await ensureTripAcceptedEvent(ctx, trip.companyId, args.tripId, driverId, now);

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

    if (trip.acceptedByDriverId) {
      throw new ConvexError('Este viaje ya fue aceptado por otro conductor.');
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

    const tripOffers = await ctx.db
      .query('tripOffers')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .collect();

    for (const tripOffer of tripOffers) {
      if (tripOffer._id !== offer._id && tripOffer.status === 'PENDING') {
        await ctx.db.patch(tripOffer._id, {
          status: 'CANCELLED',
          updatedAt: now,
        });
      }
    }

    await ensureTripAcceptedEvent(ctx, trip.companyId, args.tripId, driverId, now);

    return null;
  },
});

export const getDashboardStatsForCurrentCompany = query({
  args: {},
  returns: v.object({
    totalTrips: v.number(),
    offeredTrips: v.number(),
    acceptedTrips: v.number(),
    inTransitTrips: v.number(),
    closedTrips: v.number(),
    activeDrivers: v.number(),
    pendingOffers: v.number(),
  }),
  handler: async (ctx) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const trips = await ctx.db
      .query('trips')
      .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
      .collect();
    const activeDrivers = await ctx.db
      .query('drivers')
      .withIndex('by_company_and_status', (q) => q.eq('companyId', profile.companyId).eq('status', 'ACTIVE'))
      .collect();
    const pendingOffers = await ctx.db
      .query('tripOffers')
      .withIndex('by_company_and_status', (q) => q.eq('companyId', profile.companyId).eq('status', 'PENDING'))
      .collect();
    const inTransitStatuses = new Set([
      'IN_LOADING',
      'LOADED',
      'IN_TRANSIT',
      'IN_UNLOADING',
      'UNLOADED',
      'DOCUMENTS_PENDING',
      'DOCUMENTS_SUBMITTED',
      'DOCUMENTS_APPROVED',
    ]);

    return {
      totalTrips: trips.length,
      offeredTrips: trips.filter((trip) => trip.status === 'OFFERED').length,
      acceptedTrips: trips.filter((trip) => trip.status === 'ACCEPTED').length,
      inTransitTrips: trips.filter((trip) => inTransitStatuses.has(trip.status)).length,
      closedTrips: trips.filter((trip) => trip.status === 'CLOSED').length,
      activeDrivers: activeDrivers.length,
      pendingOffers: pendingOffers.length,
    };
  },
});

export const listForCurrentCompany = query({
  args: {
    status: v.optional(tripStatusValidator),
  },
  returns: v.array(dispatcherTripReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const status = args.status;
    const trips = status
      ? await ctx.db
          .query('trips')
          .withIndex('by_company_and_status', (q) => q.eq('companyId', profile.companyId).eq('status', status))
          .collect()
      : await ctx.db
          .query('trips')
          .withIndex('by_company', (q) => q.eq('companyId', profile.companyId))
          .collect();
    const results: (Doc<'trips'> & {
      assignedDriver: Doc<'drivers'> | null;
      acceptedDriver: Doc<'drivers'> | null;
      offerCount: number;
      pendingOfferCount: number;
    })[] = [];

    for (const trip of trips) {
      const assignedDriver = trip.assignedDriverId ? await ctx.db.get(trip.assignedDriverId) : null;
      const acceptedDriver = trip.acceptedByDriverId ? await ctx.db.get(trip.acceptedByDriverId) : null;
      const offers = await ctx.db
        .query('tripOffers')
        .withIndex('by_trip', (q) => q.eq('tripId', trip._id))
        .collect();

      results.push({
        ...trip,
        assignedDriver,
        acceptedDriver,
        offerCount: offers.length,
        pendingOfferCount: offers.filter((offer) => offer.status === 'PENDING').length,
      });
    }

    return results.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getDetailForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.object({
    trip: v.object(tripFields),
    company: companyReturn,
    assignedDriver: v.union(v.null(), driverReturn),
    acceptedDriver: v.union(v.null(), driverReturn),
    offers: v.array(offerWithDriverReturn),
    documents: v.array(tripDocumentWithUrlReturn),
    events: v.array(tripEventReturn),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    const company = await ctx.db.get(trip.companyId);

    if (!company) {
      throw new ConvexError('La empresa no está disponible.');
    }

    const assignedDriver = trip.assignedDriverId ? await ctx.db.get(trip.assignedDriverId) : null;
    const acceptedDriver = trip.acceptedByDriverId ? await ctx.db.get(trip.acceptedByDriverId) : null;
    const tripOffers = await ctx.db
      .query('tripOffers')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .collect();
    const offers: (Doc<'tripOffers'> & { driver: Doc<'drivers'> })[] = [];

    for (const offer of tripOffers) {
      const driver = await ctx.db.get(offer.driverId);

      if (driver && driver.companyId === profile.companyId) {
        offers.push({ ...offer, driver });
      }
    }

    const documents = await listTripDocumentsWithUrls(ctx, args.tripId);
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
      assignedDriver,
      acceptedDriver,
      offers: offers.sort((a, b) => b.createdAt - a.createdAt),
      documents,
      events: eventsWithDrivers,
    };
  },
});

export const createForDispatcher = mutation({
  args: {
    originCity: v.string(),
    destinationCity: v.string(),
    routeLabel: v.optional(v.string()),
    pickupAt: v.string(),
    deliveryEta: v.optional(v.string()),
    cargoDescription: v.string(),
    freightValue: v.optional(v.string()),
    advanceValue: v.optional(v.string()),
    observations: v.optional(v.string()),
  },
  returns: v.object(tripFields),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const now = Date.now();
    const originCity = args.originCity.trim();
    const destinationCity = args.destinationCity.trim();
    const cargoDescription = args.cargoDescription.trim();
    const routeLabel = args.routeLabel?.trim() || `${originCity} - ${destinationCity}`;
    const observations = args.observations?.trim() || undefined;
    const pickupAt = parseRequiredDate(args.pickupAt, 'Ingresa una fecha de cargue válida.');
    const deliveryEta = parseOptionalDate(args.deliveryEta, 'Ingresa una ETA de entrega válida.');
    const freightValue = parseOptionalMoney(args.freightValue, 'Ingresa un valor de flete válido.');
    const advanceValue = parseOptionalMoney(args.advanceValue, 'Ingresa un anticipo válido.');

    if (!originCity || !destinationCity || !cargoDescription) {
      throw new ConvexError('Completa origen, destino y descripción de carga.');
    }

    const tripId = await ctx.db.insert('trips', {
      companyId: profile.companyId,
      originCity,
      destinationCity,
      routeLabel,
      pickupAt,
      deliveryEta,
      cargoDescription,
      freightValue,
      advanceValue,
      status: 'DRAFT',
      observations,
      createdAt: now,
      updatedAt: now,
    });
    const trip = await ctx.db.get(tripId);

    if (!trip) {
      throw new ConvexError('No se pudo crear el viaje.');
    }

    return trip;
  },
});

export const offerToDriversForDispatcher = mutation({
  args: {
    tripId: v.id('trips'),
    driverIds: v.array(v.id('drivers')),
  },
  returns: v.object({
    createdCount: v.number(),
    skippedCount: v.number(),
  }),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);

    if (args.driverIds.length === 0) {
      throw new ConvexError('Selecciona al menos un conductor.');
    }

    if (trip.status === 'CLOSED' || trip.status === 'CANCELLED') {
      throw new ConvexError('No se puede ofertar un viaje cerrado o cancelado.');
    }

    if (trip.acceptedByDriverId) {
      throw new ConvexError('Este viaje ya tiene conductor aceptado.');
    }

    const now = Date.now();
    const uniqueDriverIds = Array.from(new Set(args.driverIds));
    let createdCount = 0;
    let skippedCount = 0;

    for (const driverId of uniqueDriverIds) {
      await assertDriverBelongsToCompany(ctx, driverId, profile.companyId);

      const existingOffer = await ctx.db
        .query('tripOffers')
        .withIndex('by_trip_and_driver', (q) => q.eq('tripId', args.tripId).eq('driverId', driverId))
        .first();

      if (existingOffer) {
        skippedCount += 1;
      } else {
        await ctx.db.insert('tripOffers', {
          companyId: profile.companyId,
          tripId: args.tripId,
          driverId,
          status: 'PENDING',
          createdAt: now,
          updatedAt: now,
        });
        createdCount += 1;
      }
    }

    if (trip.status !== 'OFFERED') {
      await ctx.db.patch(args.tripId, {
        status: 'OFFERED',
        updatedAt: now,
      });
    }

    return { createdCount, skippedCount };
  },
});

export const cancelTripForDispatcher = mutation({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);

    if (trip.status === 'CLOSED') {
      throw new ConvexError('No se puede cancelar un viaje cerrado.');
    }

    if (trip.status === 'CANCELLED') {
      return null;
    }

    const now = Date.now();
    const offers = await ctx.db
      .query('tripOffers')
      .withIndex('by_trip', (q) => q.eq('tripId', args.tripId))
      .collect();

    for (const offer of offers) {
      if (offer.status === 'PENDING') {
        await ctx.db.patch(offer._id, {
          status: 'CANCELLED',
          updatedAt: now,
        });
      }
    }

    await ctx.db.patch(args.tripId, {
      status: 'CANCELLED',
      updatedAt: now,
    });

    return null;
  },
});

async function ensureTripAcceptedEvent(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  driverId: Id<'drivers'>,
  now: number,
) {
  const existingEvent = await ctx.db
    .query('tripEvents')
    .withIndex('by_trip_and_type', (q) => q.eq('tripId', tripId).eq('eventType', 'TRIP_ACCEPTED'))
    .first();

  if (existingEvent) {
    return;
  }

  await ctx.db.insert('tripEvents', {
    companyId,
    tripId,
    driverId,
    eventType: 'TRIP_ACCEPTED',
    note: 'Viaje aceptado desde la app.',
    occurredAt: now,
    createdAt: now,
  });
}

function parseRequiredDate(value: string, message: string) {
  const timestamp = Date.parse(value.trim());

  if (!Number.isFinite(timestamp)) {
    throw new ConvexError(message);
  }

  return timestamp;
}

function parseOptionalDate(value: string | undefined, message: string) {
  if (!value?.trim()) {
    return undefined;
  }

  return parseRequiredDate(value, message);
}

function parseOptionalMoney(value: string | undefined, message: string) {
  if (!value?.trim()) {
    return undefined;
  }

  const normalizedValue = value.replace(/[^\d]/g, '');

  if (!normalizedValue) {
    throw new ConvexError(message);
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw new ConvexError(message);
  }

  return parsedValue;
}
