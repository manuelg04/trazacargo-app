import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';

type DispatcherTripCardTrip = {
  _id: Id<'trips'>;
  originCity: string;
  destinationCity: string;
  pickupAt: number;
  freightValue?: number;
  advanceValue?: number;
  cargoDescription: string;
  status: string;
  acceptedDriver: { fullName: string } | null;
  assignedDriver: { fullName: string } | null;
  offerCount: number;
  pendingOfferCount: number;
};

type DispatcherTripCardProps = {
  trip: DispatcherTripCardTrip;
  onView: (tripId: Id<'trips'>) => void;
};

export function DispatcherTripCard({ trip, onView }: DispatcherTripCardProps) {
  const driverName = trip.acceptedDriver?.fullName ?? trip.assignedDriver?.fullName ?? 'Sin conductor';

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.route}>{trip.originCity} → {trip.destinationCity}</Text>
          <Text style={styles.cargo}>{trip.cargoDescription}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>
      <View style={styles.details}>
        <Text style={styles.detail}>Cargue: {formatDate(trip.pickupAt)}</Text>
        <Text style={styles.detail}>Flete: {formatCurrency(trip.freightValue)}</Text>
        <Text style={styles.detail}>Anticipo: {formatCurrency(trip.advanceValue)}</Text>
        <Text style={styles.detail}>Conductor: {driverName}</Text>
        <Text style={styles.detail}>Ofertas: {trip.offerCount} enviadas · {trip.pendingOfferCount} pendientes</Text>
      </View>
      <AppButton title="Ver detalle" variant="secondary" onPress={() => onView(trip._id)} style={styles.action} />
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
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  route: {
    ...typography.cardTitle,
    color: colors.text,
  },
  cargo: {
    ...typography.body,
    color: colors.textMuted,
  },
  details: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  detail: {
    ...typography.body,
    color: colors.text,
  },
  action: {
    marginTop: spacing.lg,
  },
});
