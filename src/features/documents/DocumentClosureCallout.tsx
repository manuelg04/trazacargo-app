import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { DocumentSummary } from '@/src/features/documents/documentRequirementTypes';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type DocumentClosureCalloutProps = {
  summary: DocumentSummary;
  confirmClose: boolean;
  closing: boolean;
  onClose: () => void;
  onCancelConfirm: () => void;
};

export function DocumentClosureCallout({
  summary,
  confirmClose,
  closing,
  onClose,
  onCancelConfirm,
}: DocumentClosureCalloutProps) {
  const readyToClose = summary.isComplete;

  return (
    <AppCard style={[styles.card, readyToClose ? styles.readyCard : styles.blockedCard]}>
      <View style={styles.header}>
        <View style={styles.statusDot} />
        <View style={styles.textBlock}>
          <Text style={styles.title}>{readyToClose ? 'Listo para cerrar' : 'Aún faltan documentos requeridos'}</Text>
          <Text style={styles.body}>
            {readyToClose
              ? 'La documentación requerida ya está completa. Puedes cerrar el viaje cuando confirmes.'
              : 'No puedes cerrar este viaje porque aún hay documentos pendientes, en revisión o rechazados.'}
          </Text>
          {confirmClose ? <Text style={styles.confirmText}>Confirma el cierre del viaje.</Text> : null}
        </View>
      </View>
      <AppButton
        label={confirmClose ? 'Confirmar cierre' : 'Cerrar viaje'}
        variant="success"
        fullWidth
        loading={closing}
        disabled={!readyToClose}
        onPress={onClose}
      />
      {confirmClose ? (
        <AppButton
          label="Mantener viaje abierto"
          variant="secondary"
          fullWidth
          disabled={closing}
          onPress={onCancelConfirm}
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  readyCard: {
    borderColor: colors.successBd,
  },
  blockedCard: {
    borderColor: colors.warningBd,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
  },
  statusDot: {
    backgroundColor: colors.brand500,
    borderRadius: 999,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  body: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  confirmText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
