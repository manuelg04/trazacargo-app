import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type DriverPickerDriver = {
  _id: Id<'drivers'>;
  fullName: string;
  documentNumber: string;
  vehicleType?: string;
  vehicle: {
    plate: string;
    vehicleType: string;
  } | null;
};

type DriverPickerProps = {
  drivers: DriverPickerDriver[];
  selectedDriverIds: Id<'drivers'>[];
  offeredDriverIds?: Id<'drivers'>[];
  onChange: (driverIds: Id<'drivers'>[]) => void;
};

export function DriverPicker({ drivers, selectedDriverIds, offeredDriverIds = [], onChange }: DriverPickerProps) {
  if (drivers.length === 0) {
    return <AppEmptyState title="Sin conductores" message="Crea conductores activos antes de ofertar viajes." />;
  }

  const toggleDriver = (driverId: Id<'drivers'>) => {
    if (offeredDriverIds.includes(driverId)) {
      return;
    }

    if (selectedDriverIds.includes(driverId)) {
      onChange(selectedDriverIds.filter((selectedDriverId) => selectedDriverId !== driverId));
    } else {
      onChange([...selectedDriverIds, driverId]);
    }
  };

  return (
    <View style={styles.container}>
      {drivers.map((driver) => {
        const selected = selectedDriverIds.includes(driver._id);
        const alreadyOffered = offeredDriverIds.includes(driver._id);
        const displayedVehicleType = driver.vehicleType ?? driver.vehicle?.vehicleType;
        const displayedVehicle = driver.vehicle?.plate
          ? `${driver.vehicle.plate} · ${displayedVehicleType ?? 'No registrado'}`
          : displayedVehicleType ?? 'No registrado';

        return (
          <Pressable
            key={driver._id}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected || alreadyOffered, disabled: alreadyOffered }}
            disabled={alreadyOffered}
            onPress={() => toggleDriver(driver._id)}
            style={({ pressed }) => [
              styles.option,
              selected ? styles.optionSelected : null,
              alreadyOffered ? styles.optionDisabled : null,
              pressed && !alreadyOffered ? styles.optionPressed : null,
            ]}>
            <View style={[styles.checkbox, selected || alreadyOffered ? styles.checkboxSelected : null]}>
              <Text style={styles.checkboxText}>{selected || alreadyOffered ? '✓' : ''}</Text>
            </View>
            <View style={styles.driverText}>
              <Text style={styles.driverName}>{driver.fullName}</Text>
              <Text style={styles.driverMeta}>
                {driver.documentNumber} · {displayedVehicle}
              </Text>
              {alreadyOffered ? <Text style={styles.offeredText}>Oferta ya enviada</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 58,
    padding: spacing.md,
  },
  optionSelected: {
    borderColor: colors.primary,
  },
  optionDisabled: {
    backgroundColor: colors.surfaceMuted,
    opacity: 0.74,
  },
  optionPressed: {
    opacity: 0.86,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    ...typography.small,
    color: colors.surface,
    fontWeight: '700',
  },
  driverText: {
    flex: 1,
    gap: spacing.xs,
  },
  driverName: {
    ...typography.cardTitle,
    color: colors.text,
  },
  driverMeta: {
    ...typography.small,
    color: colors.textMuted,
  },
  offeredText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
  },
});
