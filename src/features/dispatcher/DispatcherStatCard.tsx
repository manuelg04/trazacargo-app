import { StyleSheet, Text } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { colors, fontFamily, fontSize } from '@/constants/theme';

type DispatcherStatCardProps = {
  label: string;
  value: number;
};

export function DispatcherStatCard({ label, value }: DispatcherStatCardProps) {
  const isRejected = label.toLowerCase().includes('rechazado');
  const isReady = label.toLowerCase().includes('listo');
  const isPendingDocs = label.toLowerCase().includes('docs pendientes');
  const isPendingOffers = label.toLowerCase().includes('ofertas pendientes');
  const isOfertado = label.toLowerCase().includes('ofertado');
  const isAceptado = label.toLowerCase().includes('aceptado');

  let cardStyle = {};
  let valueStyle = {};
  let labelStyle = {};

  if (isRejected) {
    cardStyle = { backgroundColor: colors.errorBg, borderColor: colors.errorBd };
    valueStyle = { color: colors.error };
    labelStyle = { color: colors.error };
  } else if (isReady || isAceptado) {
    cardStyle = { backgroundColor: colors.successBg, borderColor: colors.successBd };
    valueStyle = { color: colors.success };
    labelStyle = { color: colors.success };
  } else if (isPendingDocs) {
    cardStyle = { backgroundColor: colors.warningBg, borderColor: colors.warningBd };
    valueStyle = { color: colors.warning };
    labelStyle = { color: colors.warning };
  } else if (isPendingOffers || isOfertado) {
    cardStyle = { backgroundColor: colors.infoBg, borderColor: colors.infoBd };
    valueStyle = { color: colors.info };
    labelStyle = { color: colors.info };
  }

  return (
    <AppCard style={[styles.card, cardStyle]}>
      <Text style={[styles.value, valueStyle]}>{value}</Text>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: 4,
    minWidth: 140,
  },
  value: {
    color: colors.brand500,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize['3xl'],
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
