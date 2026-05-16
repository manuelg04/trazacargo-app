import { StyleSheet, Text, View } from 'react-native';
import { accessCodeStatusLabels, profileStatusLabels } from '@/src/constants/access';
import { documentStatusLabels, offerStatusLabels, tripStatusLabels } from '@/src/constants/tripStatuses';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type StatusBadgeProps = {
  status: string;
};

const statusToneByValue: Record<string, { backgroundColor: string; color: string }> = {
  ACCEPTED: { backgroundColor: colors.successSoft, color: colors.success },
  ACTIVE: { backgroundColor: colors.successSoft, color: colors.success },
  AVAILABLE: { backgroundColor: colors.successSoft, color: colors.success },
  APPROVED: { backgroundColor: colors.successSoft, color: colors.success },
  OFFERED: { backgroundColor: colors.infoSoft, color: colors.info },
  PENDING: { backgroundColor: colors.warningSoft, color: colors.warning },
  DOCUMENTS_PENDING: { backgroundColor: colors.warningSoft, color: colors.warning },
  DOCUMENTS_SUBMITTED: { backgroundColor: colors.infoSoft, color: colors.info },
  CANCELLED: { backgroundColor: colors.dangerSoft, color: colors.danger },
  DISABLED: { backgroundColor: colors.dangerSoft, color: colors.danger },
  REJECTED: { backgroundColor: colors.dangerSoft, color: colors.danger },
  EXPIRED: { backgroundColor: colors.dangerSoft, color: colors.danger },
  ARCHIVED: { backgroundColor: colors.neutralSoft, color: colors.textMuted },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label =
    tripStatusLabels[status as keyof typeof tripStatusLabels] ??
    offerStatusLabels[status as keyof typeof offerStatusLabels] ??
    documentStatusLabels[status as keyof typeof documentStatusLabels] ??
    profileStatusLabels[status as keyof typeof profileStatusLabels] ??
    accessCodeStatusLabels[status as keyof typeof accessCodeStatusLabels] ??
    status;
  const tone = statusToneByValue[status] ?? { backgroundColor: colors.neutralSoft, color: colors.textMuted };

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.text, { color: tone.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    ...typography.small,
    fontWeight: '700',
  },
});
