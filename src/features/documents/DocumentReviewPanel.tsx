import { useMutation } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

type DocumentReviewPanelProps = {
  documents: TripDocumentView[];
};

export function DocumentReviewPanel({ documents }: DocumentReviewPanelProps) {
  const approveDocument = useMutation(api.tripDocuments.approveDriverDocument);
  const rejectDocument = useMutation(api.tripDocuments.rejectDriverDocument);
  const [activeDocumentId, setActiveDocumentId] = useState<Id<'tripDocuments'> | undefined>();
  const [rejectingDocumentId, setRejectingDocumentId] = useState<Id<'tripDocuments'> | undefined>();
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  const handleApprove = async (documentId: Id<'tripDocuments'>) => {
    setActiveDocumentId(documentId);
    setError(undefined);
    setMessage(undefined);

    try {
      await approveDocument({ documentId });
      setMessage('Documento aprobado.');
    } catch (approveError) {
      setError(getActionErrorMessage(approveError));
    } finally {
      setActiveDocumentId(undefined);
    }
  };

  const handleReject = async (documentId: Id<'tripDocuments'>) => {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError('Ingresa el motivo de rechazo.');
      return;
    }

    setActiveDocumentId(documentId);
    setError(undefined);
    setMessage(undefined);

    try {
      await rejectDocument({ documentId, rejectionReason: trimmedReason });
      setRejectingDocumentId(undefined);
      setRejectionReason('');
      setMessage('Documento rechazado.');
    } catch (rejectError) {
      setError(getActionErrorMessage(rejectError));
    } finally {
      setActiveDocumentId(undefined);
    }
  };

  if (documents.length === 0) {
    return (
      <Text style={styles.empty}>Todavía no hay documentos enviados por el conductor.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
      {documents.map((document) => {
        const isRejecting = rejectingDocumentId === document._id;

        return (
          <DocumentCard key={document._id} document={document} showDirection={false}>
            {document.status === 'SUBMITTED' ? (
              <View style={styles.reviewActions}>
                <AppButton
                  label="Aprobar"
                  variant="success"
                  onPress={() => handleApprove(document._id)}
                  loading={activeDocumentId === document._id && !isRejecting}
                  fullWidth
                />
                <AppButton
                  label={isRejecting ? 'Cancelar rechazo' : 'Rechazar'}
                  variant="danger"
                  onPress={() => {
                    setRejectingDocumentId(isRejecting ? undefined : document._id);
                    setRejectionReason('');
                    setError(undefined);
                  }}
                  disabled={activeDocumentId === document._id}
                  fullWidth
                />
                {isRejecting ? (
                  <View style={styles.rejectBox}>
                    <AppInput
                      label="Motivo de rechazo *"
                      value={rejectionReason}
                      onChangeText={setRejectionReason}
                      placeholder="Ej: el archivo no es legible"
                      multiline
                    />
                    <AppButton
                      label="Confirmar rechazo"
                      variant="danger"
                      onPress={() => handleReject(document._id)}
                      loading={activeDocumentId === document._id}
                      fullWidth
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
          </DocumentCard>
        );
      })}
    </View>
  );
}

function getActionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return message || 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  reviewActions: {
    gap: spacing[2],
  },
  rejectBox: {
    gap: spacing[2],
  },
  empty: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.btn,
    borderWidth: 1,
    padding: spacing[3],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  messageBox: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBd,
    borderRadius: radius.btn,
    borderWidth: 1,
    padding: spacing[3],
  },
  messageText: {
    color: colors.success,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
