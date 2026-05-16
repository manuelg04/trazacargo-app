import { Id } from './_generated/dataModel';
import { mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';
import { accessCodeStatusValidator, userRoleValidator } from './schema';

const demoCompanyName = 'Transportes Demo Bucaramanga';

const demoDrivers = [
  {
    fullName: 'Carlos Rueda',
    phone: '3001234567',
    documentNumber: '1098765432',
    accessCode: 'TC-CARLOS-2026',
  },
  {
    fullName: 'Julian Mendoza',
    phone: '3107654321',
    documentNumber: '1023456789',
    accessCode: 'TC-JULIAN-2026',
  },
] as const;

const demoDispatcherAccessCode = 'TC-DESPACHO-2026';
const demoAdminAccessCode = 'TC-ADMIN-2026';

const demoAccessCodeReturn = v.object({
  code: v.string(),
  status: accessCodeStatusValidator,
  role: userRoleValidator,
  driverName: v.optional(v.string()),
  companyName: v.string(),
});

export const seedDemoData = mutation({
  args: {},
  returns: v.object({
    created: v.boolean(),
    companyId: v.id('companies'),
    accessCodes: v.array(demoAccessCodeReturn),
  }),
  handler: async (ctx) => {
    const now = Date.now();
    let created = false;
    const companyResult = await getOrCreateDemoCompany(ctx, now);
    const companyId = companyResult.companyId;
    created = created || companyResult.created;

    const firstDriverResult = await getOrCreateDemoDriver(ctx, companyId, demoDrivers[0], now);
    const secondDriverResult = await getOrCreateDemoDriver(ctx, companyId, demoDrivers[1], now);
    created = created || firstDriverResult.created || secondDriverResult.created;

    const vehicleCreated = await ensureDemoVehicle(ctx, companyId, firstDriverResult.driverId, now);
    created = created || vehicleCreated;

    const offeredTripResult = await getOrCreateDemoTrip(ctx, {
      companyId,
      originCity: 'Bucaramanga',
      destinationCity: 'Barranquilla',
      routeLabel: 'Bucaramanga - Barranquilla',
      pickupAt: now + 1000 * 60 * 60 * 8,
      deliveryEta: now + 1000 * 60 * 60 * 36,
      cargoDescription: 'Alimentos secos paletizados',
      freightValue: 4200000,
      advanceValue: 1200000,
      status: 'OFFERED',
      observations: 'Presentarse con carpa en buen estado.',
      now,
    });
    const acceptedTripResult = await getOrCreateDemoTrip(ctx, {
      companyId,
      originCity: 'Girón',
      destinationCity: 'Cartagena',
      routeLabel: 'Girón - Cartagena',
      pickupAt: now - 1000 * 60 * 60 * 3,
      deliveryEta: now + 1000 * 60 * 60 * 28,
      cargoDescription: 'Material industrial empacado',
      freightValue: 3900000,
      advanceValue: 1000000,
      assignedDriverId: firstDriverResult.driverId,
      acceptedByDriverId: firstDriverResult.driverId,
      status: 'ACCEPTED',
      observations: 'Confirmar ingreso por portería principal.',
      now,
    });
    const secondDriverTripResult = await getOrCreateDemoTrip(ctx, {
      companyId,
      originCity: 'Bucaramanga',
      destinationCity: 'Bogotá',
      routeLabel: 'Bucaramanga - Bogotá',
      pickupAt: now + 1000 * 60 * 60 * 14,
      deliveryEta: now + 1000 * 60 * 60 * 30,
      cargoDescription: 'Insumos de construcción',
      freightValue: 2600000,
      advanceValue: 750000,
      status: 'OFFERED',
      observations: 'Carga con cita previa en zona industrial.',
      now,
    });
    created = created || offeredTripResult.created || acceptedTripResult.created || secondDriverTripResult.created;

    created =
      (await ensureTripOffer(ctx, companyId, offeredTripResult.tripId, firstDriverResult.driverId, 'PENDING', now)) ||
      created;
    created =
      (await ensureTripOffer(ctx, companyId, acceptedTripResult.tripId, firstDriverResult.driverId, 'ACCEPTED', now)) ||
      created;
    created =
      (await ensureTripOffer(ctx, companyId, secondDriverTripResult.tripId, secondDriverResult.driverId, 'PENDING', now)) ||
      created;

    created = (await createDemoDocuments(ctx, companyId, offeredTripResult.tripId, now)) || created;
    created = (await createDemoDocuments(ctx, companyId, acceptedTripResult.tripId, now)) || created;
    created = (await createDemoDocuments(ctx, companyId, secondDriverTripResult.tripId, now)) || created;
    created = (await ensureAcceptedEvent(ctx, companyId, acceptedTripResult.tripId, firstDriverResult.driverId, now)) || created;

    const firstCode = await ensureDemoAccessCode(ctx, {
      companyId,
      driverId: firstDriverResult.driverId,
      role: 'DRIVER',
      code: demoDrivers[0].accessCode,
      now,
    });
    const secondCode = await ensureDemoAccessCode(ctx, {
      companyId,
      driverId: secondDriverResult.driverId,
      role: 'DRIVER',
      code: demoDrivers[1].accessCode,
      now,
    });
    const dispatcherCode = await ensureDemoAccessCode(ctx, {
      companyId,
      role: 'DISPATCHER',
      code: demoDispatcherAccessCode,
      now,
    });
    const adminCode = await ensureDemoAccessCode(ctx, {
      companyId,
      role: 'ADMIN',
      code: demoAdminAccessCode,
      now,
    });
    created = created || firstCode.created || secondCode.created || dispatcherCode.created || adminCode.created;

    return {
      created,
      companyId,
      accessCodes: [
        {
          code: firstCode.accessCode.code,
          status: firstCode.accessCode.status,
          role: firstCode.accessCode.role,
          driverName: demoDrivers[0].fullName,
          companyName: demoCompanyName,
        },
        {
          code: secondCode.accessCode.code,
          status: secondCode.accessCode.status,
          role: secondCode.accessCode.role,
          driverName: demoDrivers[1].fullName,
          companyName: demoCompanyName,
        },
        {
          code: dispatcherCode.accessCode.code,
          status: dispatcherCode.accessCode.status,
          role: dispatcherCode.accessCode.role,
          companyName: demoCompanyName,
        },
        {
          code: adminCode.accessCode.code,
          status: adminCode.accessCode.status,
          role: adminCode.accessCode.role,
          companyName: demoCompanyName,
        },
      ],
    };
  },
});

export const clearDemoData = mutation({
  args: {},
  returns: v.object({
    deletedCompanies: v.number(),
    deletedProfiles: v.number(),
    deletedAccessCodes: v.number(),
  }),
  handler: async (ctx) => {
    const companies = await ctx.db
      .query('companies')
      .withIndex('by_name', (q) => q.eq('name', demoCompanyName))
      .collect();
    let deletedProfiles = 0;
    let deletedAccessCodes = 0;

    for (const company of companies) {
      const profiles = await ctx.db
        .query('userProfiles')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const accessCodes = await ctx.db
        .query('accessCodes')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const documents = await ctx.db
        .query('tripDocuments')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const events = await ctx.db
        .query('tripEvents')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const offers = await ctx.db
        .query('tripOffers')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const trips = await ctx.db
        .query('trips')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const vehicles = await ctx.db
        .query('vehicles')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();
      const drivers = await ctx.db
        .query('drivers')
        .withIndex('by_company', (q) => q.eq('companyId', company._id))
        .collect();

      for (const profile of profiles) {
        await ctx.db.delete(profile._id);
        deletedProfiles += 1;
      }

      for (const accessCode of accessCodes) {
        await ctx.db.delete(accessCode._id);
        deletedAccessCodes += 1;
      }

      for (const document of documents) {
        await ctx.db.delete(document._id);
      }

      for (const event of events) {
        await ctx.db.delete(event._id);
      }

      for (const offer of offers) {
        await ctx.db.delete(offer._id);
      }

      for (const trip of trips) {
        await ctx.db.delete(trip._id);
      }

      for (const vehicle of vehicles) {
        await ctx.db.delete(vehicle._id);
      }

      for (const driver of drivers) {
        await ctx.db.delete(driver._id);
      }

      await ctx.db.delete(company._id);
    }

    return { deletedCompanies: companies.length, deletedProfiles, deletedAccessCodes };
  },
});

async function getOrCreateDemoCompany(ctx: MutationCtx, now: number) {
  const existingCompany = await ctx.db
    .query('companies')
    .withIndex('by_name', (q) => q.eq('name', demoCompanyName))
    .first();

  if (existingCompany) {
    return { companyId: existingCompany._id, created: false };
  }

  const companyId = await ctx.db.insert('companies', {
    name: demoCompanyName,
    city: 'Bucaramanga',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  });

  return { companyId, created: true };
}

async function getOrCreateDemoDriver(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  driver: (typeof demoDrivers)[number],
  now: number,
) {
  const drivers = await ctx.db
    .query('drivers')
    .withIndex('by_company', (q) => q.eq('companyId', companyId))
    .collect();
  const existingDriver = drivers.find((candidate) => candidate.documentNumber === driver.documentNumber);

  if (existingDriver) {
    return { driverId: existingDriver._id, created: false };
  }

  const driverId = await ctx.db.insert('drivers', {
    companyId,
    fullName: driver.fullName,
    phone: driver.phone,
    documentNumber: driver.documentNumber,
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  });

  return { driverId, created: true };
}

async function ensureDemoVehicle(ctx: MutationCtx, companyId: Id<'companies'>, driverId: Id<'drivers'>, now: number) {
  const vehicles = await ctx.db
    .query('vehicles')
    .withIndex('by_company', (q) => q.eq('companyId', companyId))
    .collect();
  const existingVehicle = vehicles.find((vehicle) => vehicle.plate === 'SXB482');

  if (existingVehicle) {
    return false;
  }

  await ctx.db.insert('vehicles', {
    companyId,
    driverId,
    plate: 'SXB482',
    vehicleType: 'Tractomula',
    status: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
  });

  return true;
}

type DemoTripInput = {
  companyId: Id<'companies'>;
  originCity: string;
  destinationCity: string;
  routeLabel: string;
  pickupAt: number;
  deliveryEta: number;
  cargoDescription: string;
  freightValue: number;
  advanceValue: number;
  assignedDriverId?: Id<'drivers'>;
  acceptedByDriverId?: Id<'drivers'>;
  status: 'OFFERED' | 'ACCEPTED';
  observations: string;
  now: number;
};

async function getOrCreateDemoTrip(ctx: MutationCtx, input: DemoTripInput) {
  const trips = await ctx.db
    .query('trips')
    .withIndex('by_company', (q) => q.eq('companyId', input.companyId))
    .collect();
  const existingTrip = trips.find(
    (trip) => trip.routeLabel === input.routeLabel && trip.cargoDescription === input.cargoDescription,
  );

  if (existingTrip) {
    return { tripId: existingTrip._id, created: false };
  }

  const tripId = await ctx.db.insert('trips', {
    companyId: input.companyId,
    originCity: input.originCity,
    destinationCity: input.destinationCity,
    routeLabel: input.routeLabel,
    pickupAt: input.pickupAt,
    deliveryEta: input.deliveryEta,
    cargoDescription: input.cargoDescription,
    freightValue: input.freightValue,
    advanceValue: input.advanceValue,
    assignedDriverId: input.assignedDriverId,
    acceptedByDriverId: input.acceptedByDriverId,
    status: input.status,
    observations: input.observations,
    createdAt: input.now,
    updatedAt: input.now,
  });

  return { tripId, created: true };
}

async function ensureTripOffer(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  driverId: Id<'drivers'>,
  status: 'PENDING' | 'ACCEPTED',
  now: number,
) {
  const existingOffer = await ctx.db
    .query('tripOffers')
    .withIndex('by_trip_and_driver', (q) => q.eq('tripId', tripId).eq('driverId', driverId))
    .first();

  if (existingOffer) {
    return false;
  }

  await ctx.db.insert('tripOffers', {
    companyId,
    tripId,
    driverId,
    status,
    createdAt: now,
    updatedAt: now,
  });

  return true;
}

async function createDemoDocuments(ctx: MutationCtx, companyId: Id<'companies'>, tripId: Id<'trips'>, now: number) {
  const manifestCreated = await ensureDemoDocument(ctx, companyId, tripId, {
    documentType: 'MANIFEST',
    displayName: 'Manifiesto de carga',
    fileName: 'manifiesto-demo.pdf',
    createdAt: now,
  });
  const remittanceCreated = await ensureDemoDocument(ctx, companyId, tripId, {
    documentType: 'REMITTANCE',
    displayName: 'Remesa terrestre',
    fileName: 'remesa-demo.pdf',
    createdAt: now + 1,
  });
  const advanceCreated = await ensureDemoDocument(ctx, companyId, tripId, {
    documentType: 'ADVANCE',
    displayName: 'Soporte de anticipo',
    fileName: 'anticipo-demo.pdf',
    createdAt: now + 2,
  });

  return manifestCreated || remittanceCreated || advanceCreated;
}

type DemoDocumentInput = {
  documentType: 'MANIFEST' | 'REMITTANCE' | 'ADVANCE';
  displayName: string;
  fileName: string;
  createdAt: number;
};

async function ensureDemoDocument(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  input: DemoDocumentInput,
) {
  const documents = await ctx.db
    .query('tripDocuments')
    .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', tripId))
    .collect();
  const existingDocument = documents.find((document) => document.documentType === input.documentType);

  if (existingDocument) {
    const needsDirection = !existingDocument.direction;
    const needsFileName = !existingDocument.originalFileName && existingDocument.fileName;

    if (needsDirection || needsFileName) {
      await ctx.db.patch(existingDocument._id, {
        direction: needsDirection ? 'COMPANY_TO_DRIVER' : existingDocument.direction,
        originalFileName: needsFileName ? existingDocument.fileName : existingDocument.originalFileName,
        updatedAt: input.createdAt,
      });
    }

    return false;
  }

  await ctx.db.insert('tripDocuments', {
    companyId,
    tripId,
    documentType: input.documentType,
    direction: 'COMPANY_TO_DRIVER',
    displayName: input.displayName,
    fileName: input.fileName,
    originalFileName: input.fileName,
    uploadedByType: 'COMPANY',
    status: 'AVAILABLE',
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  });

  return true;
}

async function ensureAcceptedEvent(
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
    return false;
  }

  await ctx.db.insert('tripEvents', {
    companyId,
    tripId,
    driverId,
    eventType: 'TRIP_ACCEPTED',
    note: 'Viaje aceptado desde la app.',
    occurredAt: now - 1000 * 60 * 20,
    createdAt: now - 1000 * 60 * 20,
  });

  return true;
}

type DemoAccessCodeInput = {
  companyId: Id<'companies'>;
  driverId?: Id<'drivers'>;
  role: 'DRIVER' | 'DISPATCHER' | 'ADMIN';
  code: string;
  now: number;
};

async function ensureDemoAccessCode(ctx: MutationCtx, input: DemoAccessCodeInput) {
  const existingAccessCode = await ctx.db
    .query('accessCodes')
    .withIndex('by_code', (q) => q.eq('code', input.code))
    .first();

  if (existingAccessCode) {
    if (
      existingAccessCode.companyId !== input.companyId ||
      existingAccessCode.driverId !== input.driverId ||
      existingAccessCode.role !== input.role ||
      existingAccessCode.status !== 'ACTIVE'
    ) {
      await ctx.db.patch(existingAccessCode._id, {
        companyId: input.companyId,
        driverId: input.driverId,
        role: input.role,
        status: 'ACTIVE',
        expiresAt: undefined,
        usedByUserId: undefined,
        usedAt: undefined,
        updatedAt: input.now,
      });
      const updatedAccessCode = await ctx.db.get(existingAccessCode._id);

      if (!updatedAccessCode) {
        throw new Error('No se pudo actualizar el código demo.');
      }

      return { accessCode: updatedAccessCode, created: true };
    }

    return { accessCode: existingAccessCode, created: false };
  }

  const accessCodeId = await ctx.db.insert('accessCodes', {
    companyId: input.companyId,
    driverId: input.driverId,
    role: input.role,
    code: input.code,
    status: 'ACTIVE',
    createdAt: input.now,
    updatedAt: input.now,
  });
  const accessCode = await ctx.db.get(accessCodeId);

  if (!accessCode) {
    throw new Error('No se pudo crear el código demo.');
  }

  return { accessCode, created: true };
}
