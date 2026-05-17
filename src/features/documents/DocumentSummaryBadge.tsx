import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, radius } from '@/constants/theme';
import { DocumentSummary } from '@/src/features/documents/documentRequirementTypes';

type DocumentSummaryBadgeProps = {
  summary: DocumentSummary;
  tripStatus?: string;
};

export function DocumentSummaryBadge({ summary, tripStatus }: DocumentSummaryBadgeProps) {
  const tone = getSummaryTone(summary, tripStatus);

  return (
    <View style={[styles.badge, { backgroundColor: tone.bg, borderColor: tone.border }]}>
      <Text style={[styles.text, { color: tone.text }]}>{tone.label}</Text>
    </View>
  );
}

function getSummaryTone(summary: DocumentSummary, tripStatus?: string) {
  if (summary.totalRequired === 0) {
    return { label: 'Sin requisitos', bg: colors.neutral50, text: colors.textTertiary, border: colors.borderSubtle };
  }

  if (summary.hasRejected) {
    return {
      label: `Rechazados: ${summary.rejectedRequired}`,
      bg: colors.errorBg,
      text: colors.error,
      border: colors.errorBd,
    };
  }

  if (summary.hasInReview) {
    return {
      label: `En revisión: ${summary.inReviewRequired}`,
      bg: colors.infoBg,
      text: colors.info,
      border: colors.infoBd,
    };
  }

  if (summary.hasPending) {
    return {
      label: `Pendientes: ${summary.pendingRequired}`,
      bg: colors.warningBg,
      text: colors.warning,
      border: colors.warningBd,
    };
  }

  if (summary.isComplete && tripStatus !== 'CLOSED' && tripStatus !== 'CANCELLED') {
    return { label: 'Listo para cerrar', bg: colors.successBg, text: colors.success, border: colors.successBd };
  }

  if (summary.isComplete) {
    return { label: 'Completo', bg: colors.successBg, text: colors.success, border: colors.successBd };
  }

  return {
    label: 'Sin pendientes',
    bg: colors.warningBg,
    text: colors.warning,
    border: colors.warningBd,
  };
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
