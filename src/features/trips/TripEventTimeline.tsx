import { StyleSheet, Text, View } from 'react-native';
import { colors, eventLabels, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/src/utils/formatDate';

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
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Este viaje todavía no tiene eventos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {events.map((event, index) => {
        const isIssue = event.eventType === 'ISSUE_REPORTED';
        const isLast = index === events.length - 1;

        return (
          <View key={event._id} style={styles.row}>
            <View style={styles.timelineColumn}>
              <View style={[styles.dot, isIssue ? styles.dotIssue : null]} />
              {!isLast ? <View style={styles.line} /> : null}
            </View>
            <View style={[styles.eventCard, isIssue ? styles.eventCardIssue : null]}>
              <Text style={[styles.eventTitle, isIssue ? styles.eventTitleIssue : null]}>
                {eventLabels[event.eventType] ?? event.eventType}
              </Text>
              <Text style={styles.eventTime}>{formatDate(event.occurredAt)}</Text>
              {event.driverName ? <Text style={styles.eventMeta}>{event.driverName}</Text> : null}
              {event.note ? (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>&quot;{event.note}&quot;</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[6],
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 20,
  },
  dot: {
    backgroundColor: colors.brand400,
    borderRadius: 5,
    height: 10,
    marginTop: 14,
    width: 10,
  },
  dotIssue: {
    backgroundColor: colors.error,
  },
  line: {
    backgroundColor: colors.borderSubtle,
    flex: 1,
    marginTop: 2,
    width: 2,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    marginBottom: 8,
    padding: spacing[3],
  },
  eventCardIssue: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  eventTitleIssue: {
    color: colors.error,
  },
  eventTime: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  eventMeta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  noteBox: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    marginTop: spacing[2],
    padding: spacing[2],
  },
  noteText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
  },
});
