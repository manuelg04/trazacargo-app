import { StyleSheet, Text } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { colors, fontFamily, fontSize } from '@/constants/theme';

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
