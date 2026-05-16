import { useMutation } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
    return <Text style={styles.empty}>Todavía no hay documentos enviados por el conductor.</Text>;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {documents.map((document) => {
        const isRejecting = rejectingDocumentId === document._id;

        return (
          <DocumentCard key={document._id} document={document} showDirection={false}>
            {document.status === 'SUBMITTED' ? (
              <View style={styles.reviewActions}>
                <AppButton
                  title="Aprobar"
                  variant="secondary"
                  onPress={() => handleApprove(document._id)}
                  loading={activeDocumentId === document._id && !isRejecting}
                />
                <AppButton
                  title={isRejecting ? 'Cancelar rechazo' : 'Rechazar'}
                  variant="danger"
                  onPress={() => {
                    setRejectingDocumentId(isRejecting ? undefined : document._id);
                    setRejectionReason('');
                    setError(undefined);
                  }}
                  disabled={activeDocumentId === document._id}
                />
                {isRejecting ? (
                  <View style={styles.rejectBox}>
                    <AppInput
                      label="Motivo de rechazo"
                      value={rejectionReason}
                      onChangeText={setRejectionReason}
                      placeholder="Ejemplo: el archivo no es legible"
                      multiline
                    />
                    <AppButton
                      title="Confirmar rechazo"
                      variant="danger"
                      onPress={() => handleReject(document._id)}
                      loading={activeDocumentId === document._id}
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

  if (message) {
    return message;
  }

  return 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  reviewActions: {
    gap: spacing.sm,
  },
  rejectBox: {
    gap: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
  message: {
    ...typography.body,
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    color: colors.success,
    padding: spacing.md,
  },
});
