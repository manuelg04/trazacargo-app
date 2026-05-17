import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { ReactNode } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import {
  DocumentDirection,
  documentDirectionLabels,
  DocumentStatus,
  DocumentType,
  getDocumentTypeLabel,
  UploadedByType,
} from '@/src/features/documents/documentLabels';
import { colors, docTypeLabels, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/src/utils/formatDate';
import { formatFileSize } from '@/src/utils/formatFileSize';
import { getMimeTypeLabel } from '@/src/utils/getMimeTypeLabel';

export type TripDocumentView = {
  _id: Id<'tripDocuments'>;
  requirementId?: Id<'tripDocumentRequirements'>;
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
  const isRejected = document.status === 'REJECTED';

  const handleOpen = async () => {
    if (!document.url) return;

    try {
      await Linking.openURL(document.url);
    } catch {
      Alert.alert('No se pudo abrir', 'Intenta nuevamente o revisa tu conexión.');
    }
  };

  const typeLabel = docTypeLabels[document.documentType] ?? getDocumentTypeLabel(document.documentType);

  return (
    <AppCard style={isRejected ? styles.cardRejected : undefined}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>📄</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{document.displayName}</Text>
          <Text style={styles.type}>{typeLabel}</Text>
          {showDirection ? (
            <Text style={styles.direction}>{documentDirectionLabels[document.direction]}</Text>
          ) : null}
        </View>
        <StatusBadge status={document.status} />
      </View>

      <View style={styles.body}>
        <Text style={document.url ? styles.fileDetail : styles.demoFile}>
          {document.url ? fileDetail || 'Archivo disponible' : 'Documento demo sin archivo'}
        </Text>
        <Text style={styles.date}>Fecha: {formatDate(document.createdAt)}</Text>
      </View>

      {document.rejectionReason ? (
        <View style={styles.rejectPanel}>
          <Text style={styles.rejectTitle}>✕ DOCUMENTO RECHAZADO</Text>
          <Text style={styles.rejectReason}>&quot;{document.rejectionReason}&quot;</Text>
        </View>
      ) : null}

      {document.url ? (
        <AppButton label="Abrir" variant="ghost" onPress={handleOpen} fullWidth />
      ) : null}
      {children ? <View style={styles.childActions}>{children}</View> : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  cardRejected: {
    borderColor: colors.errorBd,
    backgroundColor: colors.errorBg,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  iconBox: {
    alignItems: 'center',
    backgroundColor: colors.brand50,
    borderRadius: radius.md,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  iconText: {
    fontSize: 18,
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
  },
  type: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  direction: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  body: {
    gap: 4,
    marginBottom: spacing[3],
  },
  fileDetail: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  demoFile: {
    color: colors.textTertiary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  date: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  rejectPanel: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    marginBottom: spacing[3],
    padding: spacing[3],
  },
  rejectTitle: {
    color: colors.error,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rejectReason: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
    marginTop: 4,
  },
  childActions: {
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
