import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { roleLabels } from '@/src/constants/access';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatDate } from '@/src/utils/formatDate';

type AccessCodeCardCode = {
  _id: Id<'accessCodes'>;
  code: string;
  role: keyof typeof roleLabels;
  status: string;
  driverName?: string;
  usedByEmail?: string;
  createdAt: number;
  usedAt?: number;
};

type AccessCodeCardProps = {
  accessCode: AccessCodeCardCode;
  onDisable?: (accessCodeId: Id<'accessCodes'>) => void;
  disabling?: boolean;
};

export function AccessCodeCard({ accessCode, onDisable, disabling = false }: AccessCodeCardProps) {
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.code}>{accessCode.code}</Text>
          <Text style={styles.meta}>Rol: {roleLabels[accessCode.role]}</Text>
          <Text style={styles.meta}>Conductor: {accessCode.driverName ?? 'No aplica'}</Text>
          <Text style={styles.meta}>Creado: {formatDate(accessCode.createdAt)}</Text>
          <Text style={styles.meta}>Usado por: {accessCode.usedByEmail ?? 'Sin uso'}</Text>
          {accessCode.usedAt ? <Text style={styles.meta}>Usado: {formatDate(accessCode.usedAt)}</Text> : null}
        </View>
        <StatusBadge status={accessCode.status} />
      </View>
      {accessCode.status === 'ACTIVE' && onDisable ? (
        <AppButton
          title="Deshabilitar código"
          variant="danger"
          onPress={() => onDisable(accessCode._id)}
          loading={disabling}
          style={styles.action}
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  code: {
    ...typography.cardTitle,
    color: colors.text,
  },
  meta: {
    ...typography.body,
    color: colors.textMuted,
  },
  action: {
    marginTop: spacing.lg,
  },
});
