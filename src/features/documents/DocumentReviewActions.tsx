import { useMutation } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type DocumentReviewActionsProps = {
  documentId: Id<'tripDocuments'>;
};

export function DocumentReviewActions({ documentId }: DocumentReviewActionsProps) {
  const approveDocument = useMutation(api.tripDocuments.approveDriverDocument);
  const rejectDocument = useMutation(api.tripDocuments.rejectDriverDocument);
  const [reviewing, setReviewing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [message, setMessage] = useState<string | undefined>();

  const handleApprove = async () => {
    setReviewing(true);
    setError(undefined);
    setMessage(undefined);

    try {
      await approveDocument({ documentId });
      setMessage('Documento aprobado.');
    } catch (approveError) {
      setError(getActionErrorMessage(approveError));
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError('Ingresa el motivo de rechazo.');
      return;
    }

    setReviewing(true);
    setError(undefined);
    setMessage(undefined);

    try {
      await rejectDocument({ documentId, rejectionReason: trimmedReason });
      setRejecting(false);
      setRejectionReason('');
      setMessage('Documento rechazado.');
    } catch (rejectError) {
      setError(getActionErrorMessage(rejectError));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <View style={styles.container}>
      {message ? (
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <View style={styles.actions}>
        <AppButton
          label="Aprobar"
          variant="success"
          onPress={handleApprove}
          loading={reviewing && !rejecting}
          disabled={reviewing}
          fullWidth
        />
        <AppButton
          label={rejecting ? 'Cancelar rechazo' : 'Rechazar'}
          variant="danger"
          onPress={() => {
            setRejecting((value) => !value);
            setRejectionReason('');
            setError(undefined);
          }}
          disabled={reviewing}
          fullWidth
        />
      </View>
      {rejecting ? (
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
            onPress={handleReject}
            loading={reviewing}
            fullWidth
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  actions: {
    gap: spacing[2],
  },
  rejectBox: {
    gap: spacing[2],
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
