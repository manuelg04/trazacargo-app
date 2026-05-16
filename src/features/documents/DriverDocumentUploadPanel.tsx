import { StyleSheet, Text } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppCard } from '@/src/components/AppCard';
import { driverDocumentTypeOptions, DocumentType } from '@/src/features/documents/documentLabels';
import { DocumentUploadForm } from '@/src/features/documents/DocumentUploadForm';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type DriverDocumentUploadPanelProps = {
  tripId: Id<'trips'>;
  documents: TripDocumentView[];
};

export function DriverDocumentUploadPanel({ tripId, documents }: DriverDocumentUploadPanelProps) {
  const getRejectedParentDocumentId = (documentType: DocumentType) => {
    return documents.find((document) => document.documentType === documentType && document.status === 'REJECTED')?._id;
  };

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Enviar documento</Text>
      <DocumentUploadForm
        tripId={tripId}
        direction="DRIVER_TO_COMPANY"
        availableDocumentTypes={driverDocumentTypeOptions}
        parentDocumentResolver={getRejectedParentDocumentId}
      />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
  },
});
