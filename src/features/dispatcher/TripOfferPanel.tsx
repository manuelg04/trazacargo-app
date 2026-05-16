import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { DriverPicker } from '@/src/features/dispatcher/DriverPicker';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
        title="Ofertar viaje"
        onPress={onOffer}
        loading={offering}
        disabled={selectedDriverIds.length === 0}
        style={styles.action}
      />
      {offers.length > 0 ? (
        <View style={styles.offers}>
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
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  action: {
    marginTop: spacing.lg,
  },
  offers: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  offerRow: {
    alignItems: 'flex-start',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  offerDriver: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
});
