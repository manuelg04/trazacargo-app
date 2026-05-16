import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
          <Text style={styles.route}>{trip.originCity} → {trip.destinationCity}</Text>
          <Text style={styles.cargo}>{trip.cargoDescription}</Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>

      <View style={styles.details}>
        <Text style={styles.detail}>Cargue: {formatDate(trip.pickupAt)}</Text>
        <Text style={styles.detail}>Flete: {formatCurrency(trip.freightValue)}</Text>
        <Text style={styles.detail}>Anticipo: {formatCurrency(trip.advanceValue)}</Text>
      </View>

      <View style={styles.actions}>
        <AppButton title="Ver detalle" variant="secondary" onPress={() => onView(trip._id)} style={styles.actionButton} />
        {onAccept ? (
          <AppButton
            title="Aceptar viaje"
            onPress={() => onAccept(trip._id)}
            loading={accepting}
            style={styles.actionButton}
          />
        ) : null}
      </View>
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
});
