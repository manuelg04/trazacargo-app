import { ConvexError, v } from 'convex/values';
import { Doc } from '../_generated/dataModel';
import { MutationCtx, QueryCtx } from '../_generated/server';
import {
  documentDirectionValidator,
  documentStatusValidator,
  documentTypeValidator,
  uploadedByTypeValidator,
} from '../schema';

type DocumentCtx = QueryCtx | MutationCtx;
type DocumentDirection = 'COMPANY_TO_DRIVER' | 'DRIVER_TO_COMPANY';
type DocumentType = Doc<'tripDocuments'>['documentType'];

export const companyDocumentTypes = ['MANIFEST', 'REMITTANCE', 'ADVANCE', 'LOADING_ORDER', 'OTHER'] as const;
export const driverDocumentTypes = ['DELIVERY_TICKET', 'PAYMENT_ACCOUNT', 'SUPPORT_PHOTO', 'FULFILLMENT', 'OTHER'] as const;
export const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const;
export const maxDocumentSizeBytes = 10 * 1024 * 1024;

export const tripDocumentWithUrlReturn = v.object({
  _id: v.id('tripDocuments'),
  _creationTime: v.number(),
  companyId: v.id('companies'),
  tripId: v.id('trips'),
  requirementId: v.optional(v.id('tripDocumentRequirements')),
  documentType: documentTypeValidator,
  direction: documentDirectionValidator,
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
  url: v.union(v.string(), v.null()),
});

export function normalizeDocumentDirection(document: Doc<'tripDocuments'>): DocumentDirection {
  if (document.direction) {
    return document.direction;
  }

  return document.uploadedByType === 'DRIVER' ? 'DRIVER_TO_COMPANY' : 'COMPANY_TO_DRIVER';
}

export function assertCompanyDocumentType(documentType: DocumentType) {
  if (!companyDocumentTypes.some((type) => type === documentType)) {
    throw new ConvexError('Este tipo de documento no lo puede subir la empresa.');
  }
}

export function assertDriverDocumentType(documentType: DocumentType) {
  if (!driverDocumentTypes.some((type) => type === documentType)) {
    throw new ConvexError('Este tipo de documento no lo puede subir el conductor.');
  }
}

export function assertRequiredText(value: string, message: string) {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new ConvexError(message);
  }

  return normalizedValue;
}

export function assertAllowedFileMetadata(mimeType: string | undefined, sizeBytes: number | undefined) {
  if (sizeBytes !== undefined && sizeBytes > maxDocumentSizeBytes) {
    throw new ConvexError('El archivo no puede superar 10 MB.');
  }

  const normalizedMimeType = mimeType?.trim();

  if (!normalizedMimeType) {
    return;
  }

  if (!allowedMimeTypes.some((allowedMimeType) => allowedMimeType === normalizedMimeType)) {
    throw new ConvexError('Solo puedes subir PDF, JPG, PNG o WEBP.');
  }
}

export async function listTripDocumentsWithUrls(ctx: DocumentCtx, tripId: Doc<'trips'>['_id']) {
  const documents = await ctx.db
    .query('tripDocuments')
    .withIndex('by_trip_and_created_at', (q) => q.eq('tripId', tripId))
    .order('desc')
    .collect();

  return await Promise.all(documents.map((document) => serializeTripDocument(ctx, document)));
}

export async function serializeTripDocument(ctx: DocumentCtx, document: Doc<'tripDocuments'>) {
  const url = document.storageId ? await ctx.storage.getUrl(document.storageId) : null;
  const originalFileName = document.originalFileName ?? document.fileName;

  return {
    ...document,
    direction: normalizeDocumentDirection(document),
    fileName: document.fileName,
    originalFileName,
    url,
  };
}
