import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { DriverPicker } from '@/src/features/dispatcher/DriverPicker';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type TripOfferPanelDriver = {
  _id: Id<'drivers'>;
  fullName: string;
  documentNumber: string;
  status?: string;
  vehicleType?: string;
  vehicle: {
    plate: string;
    vehicleType: string;
  } | null;
};

type TripOfferPanelOffer = {
  _id: Id<'tripOffers'>;
  driverId: Id<'drivers'>;
  status: string;
  driver: {
    fullName: string;
    vehicleType?: string;
  };
};

type TripOfferPanelProps = {
  tripVehicleType?: string;
  drivers: TripOfferPanelDriver[];
  offers: TripOfferPanelOffer[];
  selectedDriverIds: Id<'drivers'>[];
  offering?: boolean;
  onChangeSelectedDrivers: (driverIds: Id<'drivers'>[]) => void;
  onOffer: () => void;
};

export function TripOfferPanel({
  tripVehicleType,
  drivers,
  offers,
  selectedDriverIds,
  offering = false,
  onChangeSelectedDrivers,
  onOffer,
}: TripOfferPanelProps) {
  const offeredDriverIds = offers.map((offer) => offer.driverId);
  const offerableDrivers = drivers.filter((driver) => !driver.status || driver.status === 'ACTIVE');

  return (
    <AppCard>
      <Text style={styles.title}>Ofertar viaje</Text>
      <Text style={styles.tripVehicle}>Tipo requerido: {tripVehicleType || 'No registrado'}</Text>
      <DriverPicker
        drivers={offerableDrivers}
        selectedDriverIds={selectedDriverIds}
        offeredDriverIds={offeredDriverIds}
        onChange={onChangeSelectedDrivers}
      />
      <AppButton
        label="Ofertar viaje"
        onPress={onOffer}
        loading={offering}
        disabled={selectedDriverIds.length === 0}
        fullWidth
        style={styles.action}
      />
      {offers.length > 0 ? (
        <View style={styles.offersSection}>
          <Text style={styles.subtitle}>Ofertas enviadas</Text>
          {offers.map((offer) => (
            <View key={offer._id} style={styles.offerRow}>
              <View style={styles.offerDriverBlock}>
                <Text style={styles.offerDriver}>{offer.driver.fullName}</Text>
                <Text style={styles.offerVehicle}>Vehículo: {offer.driver.vehicleType || 'No registrado'}</Text>
              </View>
              <StatusBadge status={offer.status} />
            </View>
          ))}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    marginBottom: spacing[3],
  },
  tripVehicle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    marginBottom: spacing[3],
  },
  action: {
    marginTop: spacing[4],
  },
  offersSection: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  subtitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  offerRow: {
    alignItems: 'center',
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    paddingTop: spacing[2],
  },
  offerDriver: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  offerDriverBlock: {
    flex: 1,
    gap: spacing[1],
  },
  offerVehicle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
