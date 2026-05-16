import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import {
  DocumentDirection,
  documentDirectionLabels,
  DocumentStatus,
  documentStatusLabels,
  DocumentType,
  getDocumentTypeLabel,
  UploadedByType,
} from '@/src/features/documents/documentLabels';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatDate } from '@/src/utils/formatDate';
import { formatFileSize } from '@/src/utils/formatFileSize';
import { getMimeTypeLabel } from '@/src/utils/getMimeTypeLabel';

export type TripDocumentView = {
  _id: Id<'tripDocuments'>;
  documentType: DocumentType;
  direction: DocumentDirection;
  displayName: string;
  fileName?: string;
  originalFileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  uploadedByType: UploadedByType;
  status: DocumentStatus;
  rejectionReason?: string;
  parentDocumentId?: Id<'tripDocuments'>;
  createdAt: number;
  url: string | null;
};

type DocumentCardProps = {
  document: TripDocumentView;
  showDirection?: boolean;
  children?: ReactNode;
};

export function DocumentCard({ document, showDirection = true, children }: DocumentCardProps) {
  const fileName = document.originalFileName ?? document.fileName;
  const fileSize = formatFileSize(document.sizeBytes);
  const mimeTypeLabel = getMimeTypeLabel(document.mimeType);
  const fileDetail = [fileName, mimeTypeLabel, fileSize].filter(Boolean).join(' · ');

  const handleOpen = async () => {
    if (!document.url) {
      return;
    }

    try {
      await Linking.openURL(document.url);
    } catch {
      Alert.alert('No se pudo abrir', 'Intenta nuevamente o revisa tu conexión.');
    }
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{document.displayName}</Text>
          <Text style={styles.meta}>{getDocumentTypeLabel(document.documentType)}</Text>
          {showDirection ? <Text style={styles.meta}>{documentDirectionLabels[document.direction]}</Text> : null}
        </View>
        <DocumentStatusPill status={document.status} />
      </View>

      <View style={styles.body}>
        <Text style={document.url ? styles.fileDetail : styles.demoFile}>
          {document.url ? fileDetail || 'Archivo disponible' : 'Documento demo sin archivo'}
        </Text>
        <Text style={styles.meta}>Fecha: {formatDate(document.createdAt)}</Text>
        {document.rejectionReason ? <Text style={styles.rejection}>Motivo: {document.rejectionReason}</Text> : null}
      </View>

      {document.url ? <AppButton title="Abrir" variant="secondary" onPress={handleOpen} style={styles.openButton} /> : null}
      {children ? <View style={styles.actions}>{children}</View> : null}
    </AppCard>
  );
}

function DocumentStatusPill({ status }: { status: DocumentStatus }) {
  const tone = documentStatusToneByValue[status] ?? { backgroundColor: colors.neutralSoft, color: colors.textMuted };

  return (
    <View style={[styles.badge, { backgroundColor: tone.backgroundColor }]}>
      <Text style={[styles.badgeText, { color: tone.color }]}>{documentStatusLabels[status]}</Text>
    </View>
  );
}

const documentStatusToneByValue: Record<DocumentStatus, { backgroundColor: string; color: string }> = {
  PENDING: { backgroundColor: colors.warningSoft, color: colors.warning },
  AVAILABLE: { backgroundColor: colors.successSoft, color: colors.success },
  SUBMITTED: { backgroundColor: colors.infoSoft, color: colors.info },
  APPROVED: { backgroundColor: colors.successSoft, color: colors.success },
  REJECTED: { backgroundColor: colors.dangerSoft, color: colors.danger },
  ARCHIVED: { backgroundColor: colors.neutralSoft, color: colors.textMuted },
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
  },
  meta: {
    ...typography.small,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    ...typography.small,
    fontWeight: '700',
  },
  body: {
    gap: spacing.xs,
  },
  fileDetail: {
    ...typography.body,
    color: colors.text,
  },
  demoFile: {
    ...typography.body,
    color: colors.warning,
  },
  rejection: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
  openButton: {
    alignSelf: 'stretch',
  },
  actions: {
    gap: spacing.sm,
  },
});
