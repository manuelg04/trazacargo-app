import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, roleLabels, spacing } from '@/constants/theme';
import { formatDate } from '@/src/utils/formatDate';

type AccessCodeCardCode = {
  _id: Id<'accessCodes'>;
  code: string;
  role: string;
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
          <Text style={styles.meta}>Rol: {roleLabels[accessCode.role] ?? accessCode.role}</Text>
          {accessCode.driverName ? (
            <Text style={styles.meta}>Conductor: {accessCode.driverName}</Text>
          ) : null}
          <Text style={styles.meta}>Creado: {formatDate(accessCode.createdAt)}</Text>
          {accessCode.usedByEmail ? (
            <Text style={styles.meta}>Usado por: {accessCode.usedByEmail}</Text>
          ) : null}
          {accessCode.usedAt ? (
            <Text style={styles.meta}>Usado: {formatDate(accessCode.usedAt)}</Text>
          ) : null}
        </View>
        <StatusBadge status={accessCode.status} />
      </View>
      {accessCode.status === 'ACTIVE' && onDisable ? (
        <AppButton
          label="Deshabilitar código"
          variant="danger"
          onPress={() => onDisable(accessCode._id)}
          loading={disabling}
          fullWidth
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
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  code: {
    color: colors.brand500,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
    letterSpacing: 2,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  action: {
    marginTop: spacing[4],
  },
});
