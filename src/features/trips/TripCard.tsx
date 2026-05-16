import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';

type TripCardTrip = {
  _id: Id<'trips'>;
  originCity: string;
  destinationCity: string;
  pickupAt: number;
  freightValue?: number;
  advanceValue?: number;
  cargoDescription: string;
  status: string;
};

type TripCardProps = {
  trip: TripCardTrip;
  onView: (tripId: Id<'trips'>) => void;
  onAccept?: (tripId: Id<'trips'>) => void;
  accepting?: boolean;
};

export function TripCard({ trip, onView, onAccept, accepting = false }: TripCardProps) {
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
        {trip.advanceValue ? <Text style={styles.metaItem}>Anticipo: {formatCurrency(trip.advanceValue)}</Text> : null}
      </View>

      <View style={styles.actions}>
        <AppButton label="Ver detalle" variant="secondary" onPress={() => onView(trip._id)} fullWidth />
        {onAccept ? (
          <AppButton label="Aceptar viaje" onPress={() => onAccept(trip._id)} loading={accepting} fullWidth />
        ) : null}
      </View>
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
  actions: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
});
