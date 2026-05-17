import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppCard } from '@/src/components/AppCard';
import { colors, fontFamily, fontSize, roleLabels, spacing } from '@/constants/theme';
import { formatDate } from '@/src/utils/formatDate';
import { DocumentDirection, DocumentType, getDocumentTypeLabel } from './documentLabels';

type ReviewEventType =
  | 'DOCUMENT_SUBMITTED'
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_RESUBMITTED'
  | 'DOCUMENT_ARCHIVED'
  | 'REQUIREMENT_WAIVED'
  | 'REQUIREMENT_REACTIVATED'
  | 'REQUIREMENT_DUE_DATE_UPDATED';

type ReviewEventRole = 'DRIVER' | 'DISPATCHER' | 'ADMIN';

type ReviewEventDocument = {
  _id: Id<'tripDocuments'>;
  displayName: string;
  documentType: DocumentType;
  direction?: DocumentDirection;
};

type ReviewEventRequirement = {
  _id: Id<'tripDocumentRequirements'>;
  displayName: string;
  documentType: DocumentType;
  direction: DocumentDirection;
};

export type DocumentReviewEventView = {
  _id: Id<'tripDocumentReviewEvents'>;
  eventType: ReviewEventType;
  actorRole: ReviewEventRole;
  note?: string;
  createdAt: number;
  document: ReviewEventDocument | null;
  requirement: ReviewEventRequirement | null;
};

type DocumentReviewHistoryProps = {
  events: DocumentReviewEventView[];
  limit?: number;
};

const eventLabels: Record<ReviewEventType, string> = {
  DOCUMENT_SUBMITTED: 'Documento enviado',
  DOCUMENT_APPROVED: 'Documento aprobado',
  DOCUMENT_REJECTED: 'Documento rechazado',
  DOCUMENT_RESUBMITTED: 'Documento reenviado',
  DOCUMENT_ARCHIVED: 'Documento archivado',
  REQUIREMENT_WAIVED: 'Requisito eximido',
  REQUIREMENT_REACTIVATED: 'Requisito reactivado',
  REQUIREMENT_DUE_DATE_UPDATED: 'Fecha límite actualizada',
};

export function DocumentReviewHistory({ events, limit }: DocumentReviewHistoryProps) {
  const visibleEvents = limit ? events.slice(0, limit) : events;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Historial documental</Text>
      <AppCard style={styles.card}>
        {visibleEvents.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay movimientos documentales.</Text>
        ) : null}
        {visibleEvents.map((event, index) => (
          <View
            key={event._id}
            style={[styles.eventRow, index < visibleEvents.length - 1 ? styles.eventRowBorder : null]}>
            <Text style={styles.eventTitle}>{eventLabels[event.eventType]}</Text>
            <Text style={styles.eventMeta}>{getEventTarget(event)}</Text>
            {event.note ? <Text style={styles.eventNote}>{event.note}</Text> : null}
            <Text style={styles.eventFooter}>
              {roleLabels[event.actorRole]} · {formatDate(event.createdAt)}
            </Text>
          </View>
        ))}
      </AppCard>
    </View>
  );
}

function getEventTarget(event: DocumentReviewEventView) {
  const target = event.document ?? event.requirement;

  if (!target) {
    return 'Movimiento del viaje';
  }

  return `${target.displayName} · ${getDocumentTypeLabel(target.documentType)}`;
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  card: {
    gap: 0,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  eventRow: {
    gap: 4,
    paddingVertical: spacing[3],
  },
  eventRowBorder: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
  },
  eventTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
  eventMeta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  eventNote: {
    color: colors.textPrimary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  eventFooter: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
});
