import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
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
          <Text style={styles.route}>
            {trip.originCity}
            <Text style={styles.arrow}> → </Text>
            {trip.destinationCity}
          </Text>
          <Text style={styles.cargo}>{trip.cargoDescription}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>

      <View style={styles.meta}>
        <Text style={styles.metaItem}>📅 {formatDate(trip.pickupAt)}</Text>
        {trip.freightValue ? <Text style={styles.metaItem}>💵 {formatCurrency(trip.freightValue)}</Text> : null}
        <Text style={styles.metaItem}>🚛 {driverName}</Text>
        {trip.offerCount > 0 ? (
          <Text style={styles.metaItem}>
            {trip.offerCount} oferta{trip.offerCount !== 1 ? 's' : ''} · {trip.pendingOfferCount} pendiente{trip.pendingOfferCount !== 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>

      <AppButton label="Ver detalle" variant="secondary" onPress={() => onView(trip._id)} fullWidth style={styles.action} />
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
  headerText: {
    flex: 1,
    gap: 4,
  },
  route: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.md,
  },
  arrow: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
  },
  cargo: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  meta: {
    gap: 4,
    marginTop: spacing[3],
  },
  metaItem: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  action: {
    marginTop: spacing[4],
  },
});
