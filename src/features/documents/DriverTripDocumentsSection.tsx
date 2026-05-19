import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { DocumentRequirementList } from '@/src/features/documents/DocumentRequirementList';
import { DocumentReviewEventView, DocumentReviewHistory } from '@/src/features/documents/DocumentReviewHistory';
import { DocumentSummaryPanel } from '@/src/features/documents/DocumentSummaryPanel';
import { DocumentRequirementView, DocumentSummary } from '@/src/features/documents/documentRequirementTypes';
import { DriverDocumentUploadPanel } from '@/src/features/documents/DriverDocumentUploadPanel';
import { OtherDocumentsSection } from '@/src/features/documents/OtherDocumentsSection';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type DriverTripDocumentsSectionProps = {
  tripId: Id<'trips'>;
  summary: DocumentSummary;
  belongsToDriver: boolean;
  companyRequirements: DocumentRequirementView[];
  driverRequirements: DocumentRequirementView[];
  companyDocuments: TripDocumentView[];
  driverDocuments: TripDocumentView[];
  reviewEvents: DocumentReviewEventView[];
};

export function DriverTripDocumentsSection({
  tripId,
  summary,
  belongsToDriver,
  companyRequirements,
  driverRequirements,
  companyDocuments,
  driverDocuments,
  reviewEvents,
}: DriverTripDocumentsSectionProps) {
  const otherDocuments = [...companyDocuments, ...driverDocuments].filter((document) => !document.requirementId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documentos</Text>
        <Text style={styles.description}>
          Consulta lo que envió la empresa y completa los documentos que debes entregar.
        </Text>
      </View>
      <DocumentSummaryPanel summary={summary} />
      <DocumentRequirementList
        title="Documentos de la empresa"
        description="Abre aquí los documentos que la empresa dejó disponibles para este viaje."
        requirements={companyRequirements}
        actor="driver"
        emptyText="La empresa todavía no ha definido documentos para este viaje."
      />
      <DocumentRequirementList
        title="Documentos que debo enviar"
        description="Sube o reenvía desde cada requisito para que la empresa pueda revisarlo."
        requirements={driverRequirements}
        actor="driver"
        emptyText="No tienes documentos requeridos para enviar."
      />
      <OtherDocumentsSection
        description="Soportes adicionales que no están asociados a un requisito del checklist."
        documents={otherDocuments}
        emptyText="No hay documentos adicionales sin requisito."
        actionLabel={belongsToDriver ? 'Enviar otro documento' : undefined}
        actionContent={belongsToDriver ? <DriverDocumentUploadPanel tripId={tripId} documents={driverDocuments} /> : undefined}
      />
      <DocumentReviewHistory events={reviewEvents} limit={10} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
