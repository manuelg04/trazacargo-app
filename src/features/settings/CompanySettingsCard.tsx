import { StyleSheet, Text, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type CompanySettingsCardProps = {
  company: {
    name: string;
    city: string;
    status: string;
  };
};

export function CompanySettingsCard({ company }: CompanySettingsCardProps) {
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.label}>Empresa</Text>
          <Text style={styles.name}>{company.name}</Text>
          <Text style={styles.city}>{company.city}</Text>
        </View>
        <StatusBadge status={company.status} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  city: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
