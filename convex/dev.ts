import { Id } from './_generated/dataModel';
import { mutation, MutationCtx } from './_generated/server';
import { v } from 'convex/values';

const demoCompanyName = 'Transportes Demo Bucaramanga';

export const seedDemoData = mutation({
  args: {},
  returns: v.object({
    created: v.boolean(),
    companyId: v.id('companies'),
  }),
  handler: async (ctx) => {
    const existingCompany = await ctx.db
      .query('companies')
      .withIndex('by_name', (q) => q.eq('name', demoCompanyName))
      .first();

    if (existingCompany) {
      return { created: false, companyId: existingCompany._id };
    }

    const now = Date.now();
    const companyId = await ctx.db.insert('companies', {
      name: demoCompanyName,
      city: 'Bucaramanga',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    const firstDriverId = await ctx.db.insert('drivers', {
      companyId,
      fullName: 'Carlos Rueda',
      phone: '3001234567',
      documentNumber: '1098765432',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    const secondDriverId = await ctx.db.insert('drivers', {
      companyId,
      fullName: 'Julian Mendoza',
      phone: '3107654321',
      documentNumber: '1023456789',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('vehicles', {
      companyId,
      driverId: firstDriverId,
      plate: 'SXB482',
      vehicleType: 'Tractomula',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });

    const offeredTripId = await ctx.db.insert('trips', {
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
      createdAt: now,
      updatedAt: now,
    });

    const acceptedTripId = await ctx.db.insert('trips', {
      companyId,
      originCity: 'Girón',
      destinationCity: 'Cartagena',
      routeLabel: 'Girón - Cartagena',
      pickupAt: now - 1000 * 60 * 60 * 3,
      deliveryEta: now + 1000 * 60 * 60 * 28,
      cargoDescription: 'Material industrial empacado',
      freightValue: 3900000,
      advanceValue: 1000000,
      assignedDriverId: firstDriverId,
      acceptedByDriverId: firstDriverId,
      status: 'ACCEPTED',
      observations: 'Confirmar ingreso por portería principal.',
      createdAt: now,
      updatedAt: now,
    });

    const secondDriverTripId = await ctx.db.insert('trips', {
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
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripOffers', {
      companyId,
      tripId: offeredTripId,
      driverId: firstDriverId,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripOffers', {
      companyId,
      tripId: acceptedTripId,
      driverId: firstDriverId,
      status: 'ACCEPTED',
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('tripOffers', {
      companyId,
      tripId: secondDriverTripId,
      driverId: secondDriverId,
      status: 'PENDING',
      createdAt: now,
      updatedAt: now,
    });

    await createDemoDocuments(ctx, companyId, offeredTripId, now);
    await createDemoDocuments(ctx, companyId, acceptedTripId, now);
    await createDemoDocuments(ctx, companyId, secondDriverTripId, now);

    await ctx.db.insert('tripEvents', {
      companyId,
      tripId: acceptedTripId,
      driverId: firstDriverId,
      eventType: 'TRIP_ACCEPTED',
      note: 'Viaje aceptado desde la app.',
      occurredAt: now - 1000 * 60 * 20,
      createdAt: now - 1000 * 60 * 20,
    });

    return { created: true, companyId };
  },
});

export const clearDemoData = mutation({
  args: {},
  returns: v.object({
    deletedCompanies: v.number(),
  }),
  handler: async (ctx) => {
    const companies = await ctx.db
      .query('companies')
      .withIndex('by_name', (q) => q.eq('name', demoCompanyName))
      .collect();

    for (const company of companies) {
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

    return { deletedCompanies: companies.length };
  },
});

async function createDemoDocuments(
  ctx: MutationCtx,
  companyId: Id<'companies'>,
  tripId: Id<'trips'>,
  now: number,
) {
  await ctx.db.insert('tripDocuments', {
    companyId,
    tripId,
    documentType: 'MANIFEST',
    displayName: 'Manifiesto de carga',
    fileName: 'manifiesto-demo.pdf',
    uploadedByType: 'COMPANY',
    status: 'AVAILABLE',
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert('tripDocuments', {
    companyId,
    tripId,
    documentType: 'REMITTANCE',
    displayName: 'Remesa terrestre',
    fileName: 'remesa-demo.pdf',
    uploadedByType: 'COMPANY',
    status: 'AVAILABLE',
    createdAt: now + 1,
    updatedAt: now + 1,
  });

  await ctx.db.insert('tripDocuments', {
    companyId,
    tripId,
    documentType: 'ADVANCE',
    displayName: 'Soporte de anticipo',
    fileName: 'anticipo-demo.pdf',
    uploadedByType: 'COMPANY',
    status: 'AVAILABLE',
    createdAt: now + 2,
    updatedAt: now + 2,
  });
}
