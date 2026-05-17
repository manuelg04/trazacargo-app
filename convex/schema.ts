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
  v.literal('ARCHIVED'),
);

export const documentTypeValidator = v.union(
  v.literal('MANIFEST'),
  v.literal('REMITTANCE'),
  v.literal('ADVANCE'),
  v.literal('LOADING_ORDER'),
  v.literal('DELIVERY_TICKET'),
  v.literal('PAYMENT_ACCOUNT'),
  v.literal('SUPPORT_PHOTO'),
  v.literal('FULFILLMENT'),
  v.literal('OTHER'),
);

export const documentDirectionValidator = v.union(
  v.literal('COMPANY_TO_DRIVER'),
  v.literal('DRIVER_TO_COMPANY'),
);

export const documentRequirementStatusValidator = v.union(
  v.literal('PENDING'),
  v.literal('IN_REVIEW'),
  v.literal('SATISFIED'),
  v.literal('REJECTED'),
  v.literal('WAIVED'),
);

export const uploadedByTypeValidator = v.union(
  v.literal('COMPANY'),
  v.literal('DRIVER'),
  v.literal('DISPATCHER'),
  v.literal('ADMIN'),
);

export const tripEventTypeValidator = v.union(
  v.literal('TRIP_ACCEPTED'),
  v.literal('ARRIVED_TO_LOADING'),
  v.literal('LOADED'),
  v.literal('STARTED_ROUTE'),
  v.literal('ARRIVED_TO_UNLOADING'),
  v.literal('UNLOADED'),
  v.literal('DOCUMENTS_SUBMITTED'),
  v.literal('TRIP_CLOSED'),
  v.literal('ISSUE_REPORTED'),
);

export const userRoleValidator = v.union(v.literal('DRIVER'), v.literal('DISPATCHER'), v.literal('ADMIN'));

export const documentReviewEventTypeValidator = v.union(
  v.literal('DOCUMENT_SUBMITTED'),
  v.literal('DOCUMENT_APPROVED'),
  v.literal('DOCUMENT_REJECTED'),
  v.literal('DOCUMENT_RESUBMITTED'),
  v.literal('DOCUMENT_ARCHIVED'),
  v.literal('REQUIREMENT_WAIVED'),
  v.literal('REQUIREMENT_REACTIVATED'),
  v.literal('REQUIREMENT_DUE_DATE_UPDATED'),
);

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
    readyToCloseAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    closedByUserId: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_status', ['status'])
    .index('by_company_and_status', ['companyId', 'status'])
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
    .index('by_company_and_status', ['companyId', 'status'])
    .index('by_driver', ['driverId'])
    .index('by_driver_and_status', ['driverId', 'status'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_driver', ['tripId', 'driverId']),
  tripDocuments: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    requirementId: v.optional(v.id('tripDocumentRequirements')),
    documentType: documentTypeValidator,
    direction: v.optional(documentDirectionValidator),
    displayName: v.string(),
    fileName: v.optional(v.string()),
    originalFileName: v.optional(v.string()),
    storageId: v.optional(v.id('_storage')),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    uploadedByUserId: v.optional(v.id('users')),
    uploadedByType: uploadedByTypeValidator,
    status: documentStatusValidator,
    rejectionReason: v.optional(v.string()),
    reviewedByUserId: v.optional(v.id('users')),
    reviewedAt: v.optional(v.number()),
    parentDocumentId: v.optional(v.id('tripDocuments')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_created_at', ['tripId', 'createdAt'])
    .index('by_trip_and_direction', ['tripId', 'direction'])
    .index('by_requirement', ['requirementId']),
  tripDocumentRequirements: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    direction: documentDirectionValidator,
    documentType: documentTypeValidator,
    displayName: v.string(),
    required: v.boolean(),
    status: documentRequirementStatusValidator,
    dueAt: v.optional(v.number()),
    latestDocumentId: v.optional(v.id('tripDocuments')),
    satisfiedByDocumentId: v.optional(v.id('tripDocuments')),
    waivedByUserId: v.optional(v.id('users')),
    waivedAt: v.optional(v.number()),
    waiverReason: v.optional(v.string()),
    createdByUserId: v.optional(v.id('users')),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_trip', ['tripId'])
    .index('by_company', ['companyId'])
    .index('by_trip_and_direction', ['tripId', 'direction'])
    .index('by_trip_and_status', ['tripId', 'status']),
  tripDocumentReviewEvents: defineTable({
    companyId: v.id('companies'),
    tripId: v.id('trips'),
    requirementId: v.optional(v.id('tripDocumentRequirements')),
    documentId: v.optional(v.id('tripDocuments')),
    actorUserId: v.optional(v.id('users')),
    actorRole: userRoleValidator,
    eventType: documentReviewEventTypeValidator,
    note: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_company', ['companyId'])
    .index('by_trip', ['tripId'])
    .index('by_trip_and_created_at', ['tripId', 'createdAt'])
    .index('by_requirement', ['requirementId'])
    .index('by_document', ['documentId']),
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
