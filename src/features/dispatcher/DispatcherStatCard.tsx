import { StyleSheet, Text } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type DispatcherStatCardProps = {
  label: string;
  value: number;
};

export function DispatcherStatCard({ label, value }: DispatcherStatCardProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 136,
  },
  value: {
    ...typography.title,
    color: colors.primary,
  },
  label: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '700',
  },
});
