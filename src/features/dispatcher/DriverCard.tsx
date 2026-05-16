import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{driver.fullName}</Text>
          <Text style={styles.meta}>Teléfono: {driver.phone}</Text>
          <Text style={styles.meta}>Documento: {driver.documentNumber}</Text>
          <Text style={styles.meta}>
            Vehículo: {driver.vehicle ? `${driver.vehicle.plate} · ${driver.vehicle.vehicleType}` : 'Sin vehículo'}
          </Text>
        </View>
        <StatusBadge status={driver.status} />
      </View>
      {onGenerateAccessCode ? (
        <AppButton
          title="Generar código de acceso"
          variant="secondary"
          onPress={() => onGenerateAccessCode(driver._id)}
          loading={generating}
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
  title: {
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
