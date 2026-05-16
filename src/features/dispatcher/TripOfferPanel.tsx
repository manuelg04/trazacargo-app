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
  };
};

type TripOfferPanelProps = {
  drivers: TripOfferPanelDriver[];
  offers: TripOfferPanelOffer[];
  selectedDriverIds: Id<'drivers'>[];
  offering?: boolean;
  onChangeSelectedDrivers: (driverIds: Id<'drivers'>[]) => void;
  onOffer: () => void;
};

export function TripOfferPanel({
  drivers,
  offers,
  selectedDriverIds,
  offering = false,
  onChangeSelectedDrivers,
  onOffer,
}: TripOfferPanelProps) {
  const offeredDriverIds = offers.map((offer) => offer.driverId);

  return (
    <AppCard>
      <Text style={styles.title}>Ofertar viaje</Text>
      <DriverPicker
        drivers={drivers}
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
              <Text style={styles.offerDriver}>{offer.driver.fullName}</Text>
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
});
