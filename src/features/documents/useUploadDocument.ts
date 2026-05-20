import { useMutation } from 'convex/react';
import { useCallback, useState } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { DocumentDirection, DocumentType, getDocumentTypeLabel } from '@/src/features/documents/documentLabels';
import { UploadableFile, uploadFileToConvex } from '@/src/features/documents/uploadFileToConvex';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type UploadDocumentInput = {
  documentType: DocumentType;
  displayName?: string;
  file: UploadableFile;
  parentDocumentId?: Id<'tripDocuments'>;
  requirementId?: Id<'tripDocumentRequirements'>;
};

type UseUploadDocumentInput = {
  tripId: Id<'trips'>;
  direction: DocumentDirection;
};

export function useUploadDocument({ tripId, direction }: UseUploadDocumentInput) {
  const generateUploadUrl = useMutation(api.tripDocuments.generateUploadUrlForCurrentUser);
  const createCompanyDocument = useMutation(api.tripDocuments.createCompanyDocumentForTrip);
  const createDriverDocument = useMutation(api.tripDocuments.createDriverDocumentForTrip);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const clearError = useCallback(() => setError(undefined), []);

  const uploadDocument = useCallback(
    async ({ documentType, displayName, file, parentDocumentId, requirementId }: UploadDocumentInput) => {
      setUploading(true);
      setError(undefined);

      try {
        const uploadUrl = await generateUploadUrl({ tripId, direction });
        const storageId = (await uploadFileToConvex({ uploadUrl, file })) as Id<'_storage'>;
        const normalizedDisplayName = displayName?.trim() || getDocumentTypeLabel(documentType);
        const payload = {
          tripId,
          documentType,
          displayName: normalizedDisplayName,
          storageId,
          originalFileName: file.name,
          mimeType: file.mimeType,
          sizeBytes: file.sizeBytes,
          requirementId,
        };

        if (direction === 'COMPANY_TO_DRIVER') {
          await createCompanyDocument(payload);
        } else {
          await createDriverDocument({
            ...payload,
            parentDocumentId,
          });
        }
      } catch (uploadError) {
        const message = getActionErrorMessage(uploadError, 'No se pudo subir el documento.');
        setError(message);
        throw new Error(message);
      } finally {
        setUploading(false);
      }
    },
    [createCompanyDocument, createDriverDocument, direction, generateUploadUrl, tripId],
  );

  return {
    uploadDocument,
    uploading,
    error,
    clearError,
  };
}
