import { convexTest } from 'convex-test';
import { FunctionReference } from 'convex/server';
import { ConvexError } from 'convex/values';
import { describe, expect, test } from 'vitest';
import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import schema from './schema';
import { modules } from './test.setup';

type DocumentStateFilter = 'ALL' | 'COMPLETE' | 'PENDING' | 'IN_REVIEW' | 'REJECTED' | 'READY_TO_CLOSE';
type ReviewEventType =
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_RESUBMITTED'
  | 'DOCUMENT_ARCHIVED'
  | 'REQUIREMENT_WAIVED'
  | 'REQUIREMENT_REACTIVATED'
  | 'REQUIREMENT_DUE_DATE_UPDATED';
type TestApp = ReturnType<typeof createTestApp>;

const updateRequirementDueDateByDispatcher = (
  api.tripDocumentRequirements as unknown as Record<
    string,
    FunctionReference<
      'mutation',
      'public',
      { requirementId: Id<'tripDocumentRequirements'>; dueAt?: number | string },
      { dueAt?: number }
    >
  >
).updateRequirementDueDateByDispatcher;

const listReviewEventsByTripForDispatcher = (
  api.tripDocumentReviewEvents as Record<
    string,
    FunctionReference<
      'query',
      'public',
      { tripId: Id<'trips'> },
      { eventType: ReviewEventType; note?: string }[]
    >
  >
).listReviewEventsByTripForDispatcher;

const listReviewEventsByTripForCurrentDriver = (
  api.tripDocumentReviewEvents as Record<
    string,
    FunctionReference<
      'query',
      'public',
      { tripId: Id<'trips'> },
      { eventType: ReviewEventType; note?: string }[]
    >
  >
).listReviewEventsByTripForCurrentDriver;

function createTestApp() {
  return convexTest(schema, modules);
}

function asUser(t: TestApp, userId: Id<'users'>, label: string) {
  return t.withIdentity({
    subject: `${userId}|${label}`,
    tokenIdentifier: `test:${label}`,
  });
}

describe('document workflow rules', () => {
  test('creates default requirements when a dispatcher creates a trip', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');

    const trip = await dispatcher.mutation(api.trips.createForDispatcher, {
      originCity: 'Bucaramanga',
      destinationCity: 'Santa Marta',
      pickupAt: '2026-05-18',
      deliveryEta: '2026-05-20',
      cargoDescription: 'Carga seca',
    });

    const requirements = await listRequirements(t, trip._id);

    expect(requirements).toHaveLength(6);
    expect(requirements.map((requirement) => [requirement.documentType, requirement.required])).toEqual([
      ['MANIFEST', true],
      ['REMITTANCE', true],
      ['ADVANCE', false],
      ['DELIVERY_TICKET', true],
      ['PAYMENT_ACCOUNT', true],
      ['FULFILLMENT', false],
    ]);
  });

  test('blocks closing a trip while required documents are pending', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');

    await expect(dispatcher.mutation(api.trips.closeTripForDispatcher, { tripId: seed.tripId })).rejects.toThrow(
      ConvexError,
    );
  });

  test('allows closing a trip when required documents are satisfied or waived', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');

    await satisfyRequiredRequirements(t, seed.tripId);

    const trip = await dispatcher.mutation(api.trips.closeTripForDispatcher, { tripId: seed.tripId });

    expect(trip.status).toBe('CLOSED');
  });

  test('rejects driver attempts to close trips or create company documents', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const driver = asUser(t, seed.driverUserId, 'driver');
    const storageId = await storeTestFile(t);

    await expect(driver.mutation(api.trips.closeTripForDispatcher, { tripId: seed.tripId })).rejects.toThrow(
      ConvexError,
    );
    await expect(
      driver.mutation(api.tripDocuments.createCompanyDocumentForTrip, {
        tripId: seed.tripId,
        documentType: 'MANIFEST',
        displayName: 'Manifiesto',
        storageId,
        originalFileName: 'manifest.pdf',
      }),
    ).rejects.toThrow(ConvexError);
  });

  test('rejects dispatcher attempts to create driver documents', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');
    const storageId = await storeTestFile(t);

    await expect(
      dispatcher.mutation(api.tripDocuments.createDriverDocumentForTrip, {
        tripId: seed.tripId,
        documentType: 'DELIVERY_TICKET',
        displayName: 'Ticket',
        storageId,
        originalFileName: 'ticket.pdf',
      }),
    ).rejects.toThrow(ConvexError);
  });

  test('updates requirement states when driver documents are reviewed', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');
    const driver = asUser(t, seed.driverUserId, 'driver');
    const deliveryRequirement = await findRequirement(t, seed.tripId, 'DELIVERY_TICKET');
    const paymentRequirement = await findRequirement(t, seed.tripId, 'PAYMENT_ACCOUNT');

    const approvedDocument = await driver.mutation(api.tripDocuments.createDriverDocumentForTrip, {
      tripId: seed.tripId,
      requirementId: deliveryRequirement._id,
      documentType: 'DELIVERY_TICKET',
      displayName: 'Ticket',
      storageId: await storeTestFile(t),
      originalFileName: 'ticket.pdf',
    });
    expect((await getRequirement(t, deliveryRequirement._id)).status).toBe('IN_REVIEW');

    await dispatcher.mutation(api.tripDocuments.approveDriverDocument, { documentId: approvedDocument._id });
    expect((await getRequirement(t, deliveryRequirement._id)).status).toBe('SATISFIED');

    const rejectedDocument = await driver.mutation(api.tripDocuments.createDriverDocumentForTrip, {
      tripId: seed.tripId,
      requirementId: paymentRequirement._id,
      documentType: 'PAYMENT_ACCOUNT',
      displayName: 'Cuenta de cobro',
      storageId: await storeTestFile(t),
      originalFileName: 'cuenta.pdf',
    });
    await dispatcher.mutation(api.tripDocuments.rejectDriverDocument, {
      documentId: rejectedDocument._id,
      rejectionReason: 'Falta firma',
    });

    expect((await getRequirement(t, paymentRequirement._id)).status).toBe('REJECTED');
  });

  test('prevents a dispatcher from operating another company trip', async () => {
    const t = createTestApp();
    const first = await seedCompany(t, 'A');
    const second = await seedCompany(t, 'B');
    const dispatcher = asUser(t, first.dispatcherUserId, 'dispatcher-a');

    await expect(dispatcher.mutation(api.trips.closeTripForDispatcher, { tripId: second.tripId })).rejects.toThrow(
      ConvexError,
    );
  });

  test('filters dispatcher trips by document state', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');

    await markRequiredRequirements(t, seed.tripId, 'REJECTED');
    const rejectedTrips = await dispatcher.query(api.trips.listForCurrentCompany, {
      documentState: 'REJECTED' satisfies DocumentStateFilter,
    } as never);

    await satisfyRequiredRequirements(t, seed.tripId);
    const readyTrips = await dispatcher.query(api.trips.listForCurrentCompany, {
      documentState: 'READY_TO_CLOSE' satisfies DocumentStateFilter,
    } as never);

    expect(rejectedTrips.map((trip) => trip._id)).toContain(seed.tripId);
    expect(readyTrips.map((trip) => trip._id)).toContain(seed.tripId);
  });

  test('filters driver trips by document state', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const driver = asUser(t, seed.driverUserId, 'driver');

    await markRequiredRequirements(t, seed.tripId, 'IN_REVIEW');

    const trips = await driver.query(api.trips.listMineForCurrentDriver, {
      documentState: 'IN_REVIEW' satisfies DocumentStateFilter,
    } as never);

    expect(trips.map((trip) => trip._id)).toContain(seed.tripId);
  });

  test('updates requirement due date and records the change', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');
    const requirement = await findRequirement(t, seed.tripId, 'PAYMENT_ACCOUNT');

    const updatedRequirement = await dispatcher.mutation(updateRequirementDueDateByDispatcher, {
      requirementId: requirement._id,
      dueAt: '2026-05-30T12:00:00.000Z',
    });

    const events = await dispatcher.query(listReviewEventsByTripForDispatcher, { tripId: seed.tripId });

    expect(updatedRequirement.dueAt).toBe(Date.parse('2026-05-30T12:00:00.000Z'));
    expect(events[0].eventType).toBe('REQUIREMENT_DUE_DATE_UPDATED');
  });

  test('records submission, rejection, resubmission, approval, waiver, and reactivation history', async () => {
    const t = createTestApp();
    const seed = await seedCompany(t);
    const dispatcher = asUser(t, seed.dispatcherUserId, 'dispatcher');
    const driver = asUser(t, seed.driverUserId, 'driver');
    const deliveryRequirement = await findRequirement(t, seed.tripId, 'DELIVERY_TICKET');
    const paymentRequirement = await findRequirement(t, seed.tripId, 'PAYMENT_ACCOUNT');

    const firstDocument = await driver.mutation(api.tripDocuments.createDriverDocumentForTrip, {
      tripId: seed.tripId,
      requirementId: deliveryRequirement._id,
      documentType: 'DELIVERY_TICKET',
      displayName: 'Ticket inicial',
      storageId: await storeTestFile(t),
      originalFileName: 'ticket.pdf',
    });
    await dispatcher.mutation(api.tripDocuments.rejectDriverDocument, {
      documentId: firstDocument._id,
      rejectionReason: 'Falta firma',
    });
    const secondDocument = await driver.mutation(api.tripDocuments.createDriverDocumentForTrip, {
      tripId: seed.tripId,
      requirementId: deliveryRequirement._id,
      parentDocumentId: firstDocument._id,
      documentType: 'DELIVERY_TICKET',
      displayName: 'Ticket corregido',
      storageId: await storeTestFile(t),
      originalFileName: 'ticket-corregido.pdf',
    });
    await dispatcher.mutation(api.tripDocuments.approveDriverDocument, { documentId: secondDocument._id });
    await dispatcher.mutation(api.tripDocumentRequirements.waiveForTripByDispatcher, {
      requirementId: paymentRequirement._id,
      waiverReason: 'No aplica para este cliente',
    });
    await dispatcher.mutation(api.tripDocumentRequirements.reactivateForTripByDispatcher, {
      requirementId: paymentRequirement._id,
    });

    const dispatcherEvents = await dispatcher.query(listReviewEventsByTripForDispatcher, { tripId: seed.tripId });
    const driverEvents = await driver.query(listReviewEventsByTripForCurrentDriver, { tripId: seed.tripId });
    const eventTypes = dispatcherEvents.map((event) => event.eventType);

    expect(eventTypes).toEqual(
      expect.arrayContaining([
        'DOCUMENT_SUBMITTED',
        'DOCUMENT_REJECTED',
        'DOCUMENT_RESUBMITTED',
        'DOCUMENT_APPROVED',
        'REQUIREMENT_WAIVED',
        'REQUIREMENT_REACTIVATED',
      ]),
    );
    expect(dispatcherEvents.find((event) => event.eventType === 'DOCUMENT_REJECTED')?.note).toBe('Falta firma');
    expect(driverEvents.map((event) => event.eventType)).toEqual(expect.arrayContaining(eventTypes));
  });
});

async function seedCompany(t: TestApp, suffix = 'main') {
  const now = Date.parse('2026-05-17T12:00:00.000Z');

  return await t.run(async (ctx) => {
    const companyId = await ctx.db.insert('companies', {
      name: `Transportes ${suffix}`,
      city: 'Bucaramanga',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    const driverId = await ctx.db.insert('drivers', {
      companyId,
      fullName: `Conductor ${suffix}`,
      phone: '3001234567',
      documentNumber: `DOC-${suffix}`,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    const dispatcherUserId = await ctx.db.insert('users', { email: `dispatcher-${suffix}@example.com` });
    const driverUserId = await ctx.db.insert('users', { email: `driver-${suffix}@example.com` });
    await ctx.db.insert('userProfiles', {
      userId: dispatcherUserId,
      companyId,
      role: 'DISPATCHER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert('userProfiles', {
      userId: driverUserId,
      companyId,
      driverId,
      role: 'DRIVER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    });
    const tripId = await ctx.db.insert('trips', {
      companyId,
      originCity: 'Bucaramanga',
      destinationCity: 'Barranquilla',
      routeLabel: `Bucaramanga - Barranquilla ${suffix}`,
      pickupAt: now + 3600000,
      deliveryEta: now + 86400000,
      cargoDescription: `Carga ${suffix}`,
      assignedDriverId: driverId,
      acceptedByDriverId: driverId,
      status: 'ACCEPTED',
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert('tripOffers', {
      companyId,
      tripId,
      driverId,
      status: 'ACCEPTED',
      createdAt: now,
      updatedAt: now,
    });
    const requirements = [
      ['COMPANY_TO_DRIVER', 'MANIFEST', 'Manifiesto', true],
      ['COMPANY_TO_DRIVER', 'REMITTANCE', 'Remesa', true],
      ['ADVANCE', 'ADVANCE', 'Anticipo', false],
      ['DRIVER_TO_COMPANY', 'DELIVERY_TICKET', 'Ticket de descargue', true],
      ['DRIVER_TO_COMPANY', 'PAYMENT_ACCOUNT', 'Cuenta de cobro', true],
      ['DRIVER_TO_COMPANY', 'FULFILLMENT', 'Cumplido', false],
    ] as const;

    for (const [direction, documentType, displayName, required] of requirements) {
      await ctx.db.insert('tripDocumentRequirements', {
        companyId,
        tripId,
        direction: direction === 'ADVANCE' ? 'COMPANY_TO_DRIVER' : direction,
        documentType,
        displayName,
        required,
        status: 'PENDING',
        createdByUserId: dispatcherUserId,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { companyId, driverId, dispatcherUserId, driverUserId, tripId };
  });
}

async function listRequirements(t: TestApp, tripId: Id<'trips'>) {
  return await t.run(async (ctx) => {
    const requirements = await ctx.db
      .query('tripDocumentRequirements')
      .withIndex('by_trip', (q) => q.eq('tripId', tripId))
      .collect();

    return requirements.sort((a, b) => a.createdAt - b.createdAt);
  });
}

async function findRequirement(t: TestApp, tripId: Id<'trips'>, documentType: string) {
  const requirement = (await listRequirements(t, tripId)).find((item) => item.documentType === documentType);

  if (!requirement) {
    throw new Error(`Missing requirement ${documentType}`);
  }

  return requirement;
}

async function getRequirement(t: TestApp, requirementId: Id<'tripDocumentRequirements'>) {
  const requirement = await t.run(async (ctx) => await ctx.db.get(requirementId));

  if (!requirement) {
    throw new Error('Missing requirement');
  }

  return requirement;
}

async function markRequiredRequirements(
  t: TestApp,
  tripId: Id<'trips'>,
  status: 'PENDING' | 'IN_REVIEW' | 'SATISFIED' | 'REJECTED' | 'WAIVED',
) {
  await t.run(async (ctx) => {
    const requirements = await ctx.db
      .query('tripDocumentRequirements')
      .withIndex('by_trip', (q) => q.eq('tripId', tripId))
      .collect();

    for (const requirement of requirements) {
      if (requirement.required) {
        await ctx.db.patch(requirement._id, { status });
      }
    }
  });
}

async function satisfyRequiredRequirements(t: TestApp, tripId: Id<'trips'>) {
  await markRequiredRequirements(t, tripId, 'SATISFIED');
}

async function storeTestFile(t: TestApp) {
  return await t.run(async (ctx) => await ctx.storage.store(new Blob(['test'], { type: 'application/pdf' })));
}
