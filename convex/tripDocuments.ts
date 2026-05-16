import { ConvexError, v } from 'convex/values';
import { Id } from './_generated/dataModel';
import { MutationCtx, mutation, query } from './_generated/server';
import { documentDirectionValidator, documentTypeValidator } from './schema';
import {
  assertCompanyDocumentType,
  assertDriverDocumentType,
  assertRequiredText,
  listTripDocumentsWithUrls,
  normalizeDocumentDirection,
  serializeTripDocument,
  tripDocumentWithUrlReturn,
} from './lib/documents';
import {
  assertDispatcherCanAccessTrip,
  assertDriverCanAccessTrip,
  assertSameCompany,
  requireDispatcherOrAdminProfile,
  requireDriverProfile,
} from './lib/permissions';

export const generateUploadUrlForCurrentUser = mutation({
  args: {
    tripId: v.id('trips'),
    direction: documentDirectionValidator,
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (args.direction === 'COMPANY_TO_DRIVER') {
      const { profile } = await requireDispatcherOrAdminProfile(ctx);
      await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    } else {
      const { profile } = await requireDriverProfile(ctx);
      const { belongsToDriver } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);

      if (!belongsToDriver) {
        throw new ConvexError('Solo puedes subir documentos de viajes aceptados o asignados.');
      }
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const createCompanyDocumentForTrip = mutation({
  args: {
    tripId: v.id('trips'),
    documentType: documentTypeValidator,
    displayName: v.string(),
    storageId: v.id('_storage'),
    originalFileName: v.string(),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const trip = await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para el documento.');
    const originalFileName = assertRequiredText(args.originalFileName, 'El archivo debe tener nombre.');
    const now = Date.now();

    assertCompanyDocumentType(args.documentType);

    const documentId = await ctx.db.insert('tripDocuments', {
      companyId: trip.companyId,
      tripId: args.tripId,
      documentType: args.documentType,
      direction: 'COMPANY_TO_DRIVER',
      displayName,
      fileName: originalFileName,
      originalFileName,
      storageId: args.storageId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadedByUserId: userId,
      uploadedByType: profile.role,
      status: 'AVAILABLE',
      createdAt: now,
      updatedAt: now,
    });
    const document = await ctx.db.get(documentId);

    if (!document) {
      throw new ConvexError('No se pudo guardar el documento.');
    }

    return await serializeTripDocument(ctx, document);
  },
});

export const createDriverDocumentForTrip = mutation({
  args: {
    tripId: v.id('trips'),
    documentType: documentTypeValidator,
    displayName: v.string(),
    storageId: v.id('_storage'),
    originalFileName: v.string(),
    mimeType: v.optional(v.string()),
    sizeBytes: v.optional(v.number()),
    parentDocumentId: v.optional(v.id('tripDocuments')),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDriverProfile(ctx);
    const { trip, belongsToDriver } = await assertDriverCanAccessTrip(ctx, profile, args.tripId);
    const displayName = assertRequiredText(args.displayName, 'Ingresa un nombre para el documento.');
    const originalFileName = assertRequiredText(args.originalFileName, 'El archivo debe tener nombre.');
    const now = Date.now();

    assertDriverDocumentType(args.documentType);

    if (!belongsToDriver) {
      throw new ConvexError('Solo puedes subir documentos de viajes aceptados o asignados.');
    }

    if (args.parentDocumentId) {
      const parentDocument = await ctx.db.get(args.parentDocumentId);

      if (
        !parentDocument ||
        parentDocument.tripId !== args.tripId ||
        parentDocument.companyId !== trip.companyId ||
        parentDocument.status !== 'REJECTED' ||
        normalizeDocumentDirection(parentDocument) !== 'DRIVER_TO_COMPANY'
      ) {
        throw new ConvexError('No se puede reenviar este documento.');
      }
    }

    const documentId = await ctx.db.insert('tripDocuments', {
      companyId: trip.companyId,
      tripId: args.tripId,
      documentType: args.documentType,
      direction: 'DRIVER_TO_COMPANY',
      displayName,
      fileName: originalFileName,
      originalFileName,
      storageId: args.storageId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      uploadedByUserId: userId,
      uploadedByType: 'DRIVER',
      status: 'SUBMITTED',
      parentDocumentId: args.parentDocumentId,
      createdAt: now,
      updatedAt: now,
    });
    const document = await ctx.db.get(documentId);

    if (!document) {
      throw new ConvexError('No se pudo guardar el documento.');
    }

    return await serializeTripDocument(ctx, document);
  },
});

export const listByTripForCurrentDriver = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentWithUrlReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDriverProfile(ctx);
    await assertDriverCanAccessTrip(ctx, profile, args.tripId);

    return await listTripDocumentsWithUrls(ctx, args.tripId);
  },
});

export const listByTripForDispatcher = query({
  args: {
    tripId: v.id('trips'),
  },
  returns: v.array(tripDocumentWithUrlReturn),
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await assertDispatcherCanAccessTrip(ctx, profile, args.tripId);

    return await listTripDocumentsWithUrls(ctx, args.tripId);
  },
});

export const approveDriverDocument = mutation({
  args: {
    documentId: v.id('tripDocuments'),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const document = await getDispatcherDocument(ctx, args.documentId, profile.companyId);

    if (normalizeDocumentDirection(document) !== 'DRIVER_TO_COMPANY') {
      throw new ConvexError('Solo puedes aprobar documentos enviados por el conductor.');
    }

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: 'APPROVED',
      rejectionReason: undefined,
      reviewedByUserId: userId,
      reviewedAt: now,
      updatedAt: now,
    });
    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo actualizar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

export const rejectDriverDocument = mutation({
  args: {
    documentId: v.id('tripDocuments'),
    rejectionReason: v.string(),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { userId, profile } = await requireDispatcherOrAdminProfile(ctx);
    const document = await getDispatcherDocument(ctx, args.documentId, profile.companyId);
    const rejectionReason = assertRequiredText(args.rejectionReason, 'Ingresa el motivo de rechazo.');

    if (normalizeDocumentDirection(document) !== 'DRIVER_TO_COMPANY') {
      throw new ConvexError('Solo puedes rechazar documentos enviados por el conductor.');
    }

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: 'REJECTED',
      rejectionReason,
      reviewedByUserId: userId,
      reviewedAt: now,
      updatedAt: now,
    });
    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo actualizar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

export const archiveDocumentForDispatcher = mutation({
  args: {
    documentId: v.id('tripDocuments'),
  },
  returns: tripDocumentWithUrlReturn,
  handler: async (ctx, args) => {
    const { profile } = await requireDispatcherOrAdminProfile(ctx);
    await getDispatcherDocument(ctx, args.documentId, profile.companyId);

    const now = Date.now();

    await ctx.db.patch(args.documentId, {
      status: 'ARCHIVED',
      updatedAt: now,
    });
    const updatedDocument = await ctx.db.get(args.documentId);

    if (!updatedDocument) {
      throw new ConvexError('No se pudo archivar el documento.');
    }

    return await serializeTripDocument(ctx, updatedDocument);
  },
});

async function getDispatcherDocument(ctx: MutationCtx, documentId: Id<'tripDocuments'>, companyId: Id<'companies'>) {
  const document = await ctx.db.get(documentId);

  if (!document) {
    throw new ConvexError('El documento no existe.');
  }

  assertSameCompany(document.companyId, companyId);

  const trip = await ctx.db.get(document.tripId);

  if (!trip) {
    throw new ConvexError('El viaje no existe.');
  }

  assertSameCompany(trip.companyId, companyId);

  return document;
}
