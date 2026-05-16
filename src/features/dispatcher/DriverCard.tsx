import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, size, spacing } from '@/constants/theme';

type DriverCardDriver = {
  _id: Id<'drivers'>;
  fullName: string;
  phone: string;
  documentNumber: string;
  status: string;
  vehicle: {
    plate: string;
    vehicleType: string;
  } | null;
};

type DriverCardProps = {
  driver: DriverCardDriver;
  onGenerateAccessCode?: (driverId: Id<'drivers'>) => void;
  generating?: boolean;
};

export function DriverCard({ driver, onGenerateAccessCode, generating = false }: DriverCardProps) {
  const initials = driver.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{driver.fullName}</Text>
          <Text style={styles.meta}>📱 {driver.phone}</Text>
          <Text style={styles.meta}>🪪 {driver.documentNumber}</Text>
          {driver.vehicle ? (
            <Text style={styles.meta}>🚛 {driver.vehicle.plate} · {driver.vehicle.vehicleType}</Text>
          ) : (
            <Text style={styles.meta}>Sin vehículo registrado</Text>
          )}
        </View>
        <StatusBadge status={driver.status} />
      </View>
      {onGenerateAccessCode ? (
        <AppButton
          label="Generar código de acceso"
          variant="secondary"
          onPress={() => onGenerateAccessCode(driver._id)}
          loading={generating}
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
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brand50,
    borderRadius: size.avatar / 2,
    height: size.avatar,
    justifyContent: 'center',
    width: size.avatar,
  },
  avatarText: {
    color: colors.brand600,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
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
