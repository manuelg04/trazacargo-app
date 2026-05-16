import { StyleSheet, Text, View } from 'react-native';
import { tripEventLabels } from '@/src/constants/tripEvents';
import { AppCard } from '@/src/components/AppCard';
import { formatDate } from '@/src/utils/formatDate';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type TripEvent = {
  _id: string;
  eventType: string;
  note?: string;
  occurredAt: number;
  driverName?: string;
};

type TripEventTimelineProps = {
  events: TripEvent[];
};

export function TripEventTimeline({ events }: TripEventTimelineProps) {
  if (events.length === 0) {
    return (
      <AppCard>
        <Text style={styles.empty}>Este viaje todavía no tiene eventos.</Text>
      </AppCard>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event) => (
        <View key={event._id} style={styles.eventRow}>
          <View style={styles.marker} />
          <AppCard style={styles.eventCard}>
            <Text style={styles.eventTitle}>
              {tripEventLabels[event.eventType as keyof typeof tripEventLabels] ?? event.eventType}
            </Text>
            <Text style={styles.eventDate}>{formatDate(event.occurredAt)}</Text>
            {event.driverName ? <Text style={styles.eventMeta}>{event.driverName}</Text> : null}
            {event.note ? <Text style={styles.eventNote}>{event.note}</Text> : null}
          </AppCard>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  eventRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  marker: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 12,
    marginTop: spacing.lg,
    width: 12,
  },
  eventCard: {
    flex: 1,
    padding: spacing.md,
  },
  eventTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  eventDate: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  eventMeta: {
    ...typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  eventNote: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
