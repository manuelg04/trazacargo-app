import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { DocumentSummary } from '@/src/features/documents/documentRequirementTypes';

type DocumentSummaryPanelProps = {
  summary: DocumentSummary;
};

export function DocumentSummaryPanel({ summary }: DocumentSummaryPanelProps) {
  if (summary.totalRequired === 0) {
    return (
      <AppCard style={styles.card}>
        <Text style={styles.title}>Sin requisitos documentales</Text>
        <Text style={styles.emptyText}>Este viaje todavía no tiene documentos requeridos.</Text>
      </AppCard>
    );
  }

  const title = summary.isComplete
    ? 'Documentación completa'
    : summary.hasRejected
    ? 'Documentos rechazados'
    : summary.hasInReview
    ? 'Documentos en revisión'
    : 'Documentos pendientes';

  const items = [
    { label: 'Requeridos', value: summary.totalRequired },
    { label: 'Pendientes', value: summary.pendingRequired },
    { label: 'En revisión', value: summary.inReviewRequired },
    { label: 'Rechazados', value: summary.rejectedRequired },
    { label: 'Cumplidos', value: summary.satisfiedRequired },
    { label: 'Eximidos', value: summary.waivedRequired },
  ];

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.metric}>
            <Text style={styles.metricValue}>{item.value}</Text>
            <Text style={styles.metricLabel}>{item.label}</Text>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  metric: {
    backgroundColor: colors.neutral50,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 96,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  metricValue: {
    color: colors.brand500,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.lg,
  },
  metricLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
