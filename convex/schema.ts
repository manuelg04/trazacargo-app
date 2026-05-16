import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export const companyStatusValidator = v.union(v.literal('ACTIVE'), v.literal('INACTIVE'));

export const driverStatusValidator = v.union(v.literal('ACTIVE'), v.literal('INACTIVE'));

export const vehicleStatusValidator = v.union(v.literal('ACTIVE'), v.literal('INACTIVE'));

export const tripStatusValidator = v.union(
  v.literal('DRAFT'),
  v.literal('OFFERED'),
  v.literal('ACCEPTED'),
  v.literal('IN_LOADING'),
  v.literal('LOADED'),
  v.literal('IN_TRANSIT'),
  v.literal('IN_UNLOADING'),
  v.literal('UNLOADED'),
  v.literal('DOCUMENTS_PENDING'),
  v.literal('DOCUMENTS_SUBMITTED'),
  v.literal('DOCUMENTS_APPROVED'),
  v.literal('CLOSED'),
  v.literal('CANCELLED'),
);

export const offerStatusValidator = v.union(
  v.literal('PENDING'),
  v.literal('ACCEPTED'),
  v.literal('REJECTED'),
  v.literal('EXPIRED'),
  v.literal('CANCELLED'),
);

export const documentStatusValidator = v.union(
  v.literal('PENDING'),
  v.literal('AVAILABLE'),
  v.literal('SUBMITTED'),
  v.literal('APPROVED'),
  v.literal('REJECTED'),
);

export const documentTypeValidator = v.union(
  v.literal('MANIFEST'),
  v.literal('REMITTANCE'),
  v.literal('ADVANCE'),
  v.literal('LOADING_ORDER'),
  v.literal('DELIVERY_TICKET'),
  v.literal('PAYMENT_ACCOUNT'),
  v.literal('SUPPORT_PHOTO'),
  v.literal('OTHER'),
);

export const uploadedByTypeValidator = v.union(v.literal('COMPANY'), v.literal('DRIVER'));

export const tripEventTypeValidator = v.union(
  v.literal('TRIP_ACCEPTED'),
  v.literal('ARRIVED_TO_LOADING'),
  v.literal('LOADED'),
  v.literal('STARTED_ROUTE'),
  v.literal('ARRIVED_TO_UNLOADING'),
  v.literal('UNLOADED'),
  v.literal('DOCUMENTS_SUBMITTED'),
  v.literal('ISSUE_REPORTED'),
);

export const userRoleValidator = v.union(v.literal('DRIVER'), v.literal('DISPATCHER'), v.literal('ADMIN'));

export const userProfileStatusValidator = v.union(v.literal('ACTIVE'), v.literal('DISABLED'));

export const accessCodeStatusValidator = v.union(
  v.literal('ACTIVE'),
  v.literal('USED'),
  v.literal('DISABLED'),
  v.literal('EXPIRED'),
);

export default defineSchema({
  ...authTables,
  companies: defineTable({
    name: v.string(),
    city: v.string(),
    status: companyStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_name', ['name'])
    .index('by_status', ['status']),
  drivers: defineTable({
    companyId: v.id('companies'),
    fullName: v.string(),
    phone: v.string(),
    documentNumber: v.string(),
    status: driverStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_status', ['status'])
    .index('by_company_and_status', ['companyId', 'status']),
  vehicles: defineTable({
    companyId: v.id('companies'),
    driverId: v.optional(v.id('drivers')),
    plate: v.string(),
    vehicleType: v.string(),
    status: vehicleStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_driver', ['driverId']),
  trips: defineTable({
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
  })
    .index('by_company', ['companyId'])
    .index('by_status', ['status'])
    .index('by_assigned_driver', ['assignedDriverId'])
    .index('by_accepted_driver', ['acceptedByDriverId']),
  tripOffers: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    driverId: v.id('drivers'),
    status: offerStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_driver_and_status', ['driverId', 'status'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_driver', ['tripId', 'driverId']),
  tripDocuments: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    documentType: documentTypeValidator,
    displayName: v.string(),
    fileName: v.string(),
    uploadedByType: uploadedByTypeValidator,
    status: documentStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_created_at', ['tripId', 'createdAt']),
  tripEvents: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    driverId: v.optional(v.id('drivers')),
    eventType: tripEventTypeValidator,
    note: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    occurredAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_occurred_at', ['tripId', 'occurredAt'])
    .index('by_trip_and_type', ['tripId', 'eventType']),
  userProfiles: defineTable({
    userId: v.id('users'),
    companyId: v.id('companies'),
    driverId: v.optional(v.id('drivers')),
    role: userRoleValidator,
    status: userProfileStatusValidator,
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_company', ['companyId'])
    .index('by_driver', ['driverId'])
    .index('by_user_and_status', ['userId', 'status']),
  accessCodes: defineTable({
    companyId: v.id('companies'),
    driverId: v.optional(v.id('drivers')),
    role: userRoleValidator,
    code: v.string(),
    status: accessCodeStatusValidator,
    expiresAt: v.optional(v.number()),
    usedByUserId: v.optional(v.id('users')),
    usedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_code', ['code'])
    .index('by_company', ['companyId'])
    .index('by_driver', ['driverId'])
    .index('by_status', ['status'])
    .index('by_company_and_status', ['companyId', 'status']),
});
