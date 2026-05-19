import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { CompanyDocumentUploadPanel } from '@/src/features/documents/CompanyDocumentUploadPanel';
import { DocumentClosureCallout } from '@/src/features/documents/DocumentClosureCallout';
import { DocumentRequirementForm } from '@/src/features/documents/DocumentRequirementForm';
import { DocumentRequirementList } from '@/src/features/documents/DocumentRequirementList';
import { DocumentReviewActions } from '@/src/features/documents/DocumentReviewActions';
import { DocumentReviewEventView, DocumentReviewHistory } from '@/src/features/documents/DocumentReviewHistory';
import { DocumentSummaryPanel } from '@/src/features/documents/DocumentSummaryPanel';
import { DocumentRequirementView, DocumentSummary } from '@/src/features/documents/documentRequirementTypes';
import { OtherDocumentsSection } from '@/src/features/documents/OtherDocumentsSection';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type DispatcherTripDocumentsSectionProps = {
  tripId: Id<'trips'>;
  summary: DocumentSummary;
  canCloseTrip: boolean;
  confirmClose: boolean;
  closing: boolean;
  companyRequirements: DocumentRequirementView[];
  driverRequirements: DocumentRequirementView[];
  companyDocuments: TripDocumentView[];
  driverDocuments: TripDocumentView[];
  reviewEvents: DocumentReviewEventView[];
  onClose: () => void;
  onCancelClose: () => void;
  onWaiveRequirement: (requirementId: Id<'tripDocumentRequirements'>, waiverReason: string) => Promise<void>;
  onReactivateRequirement: (requirementId: Id<'tripDocumentRequirements'>) => Promise<void>;
  onUpdateRequirementDueDate: (requirementId: Id<'tripDocumentRequirements'>, dueAt?: string) => Promise<void>;
};

export function DispatcherTripDocumentsSection({
  tripId,
  summary,
  canCloseTrip,
  confirmClose,
  closing,
  companyRequirements,
  driverRequirements,
  companyDocuments,
  driverDocuments,
  reviewEvents,
  onClose,
  onCancelClose,
  onWaiveRequirement,
  onReactivateRequirement,
  onUpdateRequirementDueDate,
}: DispatcherTripDocumentsSectionProps) {
  const [showRequirementForm, setShowRequirementForm] = useState(false);
  const otherDocuments = [...companyDocuments, ...driverDocuments].filter((document) => !document.requirementId);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Documentos y cierre</Text>
        <Text style={styles.description}>
          Revisa qué falta, qué requiere aprobación y si el viaje ya puede cerrarse.
        </Text>
      </View>
      <DocumentSummaryPanel summary={summary} />
      {canCloseTrip ? (
        <DocumentClosureCallout
          summary={summary}
          confirmClose={confirmClose}
          closing={closing}
          onClose={onClose}
          onCancelConfirm={onCancelClose}
        />
      ) : null}
      <DocumentRequirementList
        title="Documentos para el conductor"
        description="Documentos que la empresa debe entregar o dejar disponibles para el conductor."
        requirements={companyRequirements}
        actor="dispatcher"
        emptyText="Este viaje no tiene requisitos para documentos de la empresa."
        onWaive={onWaiveRequirement}
        onReactivate={onReactivateRequirement}
        onUpdateDueDate={onUpdateRequirementDueDate}
      />
      <DocumentRequirementList
        title="Documentos recibidos del conductor"
        description="Soportes que el conductor debe enviar y que la empresa debe aprobar o rechazar."
        requirements={driverRequirements}
        actor="dispatcher"
        emptyText="Este viaje no tiene requisitos para documentos del conductor."
        onWaive={onWaiveRequirement}
        onReactivate={onReactivateRequirement}
        onUpdateDueDate={onUpdateRequirementDueDate}
      />
      <OtherDocumentsSection
        description="Usa esta sección solo para documentos que no hacen parte del checklist."
        documents={otherDocuments}
        emptyText="No hay documentos adicionales sin requisito."
        actionLabel="Subir otro documento de empresa"
        actionContent={<CompanyDocumentUploadPanel tripId={tripId} />}
        renderDocumentActions={(document) =>
          document.direction === 'DRIVER_TO_COMPANY' && document.status === 'SUBMITTED' ? (
            <DocumentReviewActions documentId={document._id} />
          ) : null
        }
      />
      <View style={styles.secondarySection}>
        <AppButton
          label={showRequirementForm ? 'Ocultar creación de requisito' : 'Crear requisito adicional'}
          variant="ghost"
          fullWidth
          onPress={() => setShowRequirementForm((value) => !value)}
        />
        {showRequirementForm ? <DocumentRequirementForm tripId={tripId} /> : null}
      </View>
      <DocumentReviewHistory events={reviewEvents} />
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
  secondarySection: {
    gap: spacing[3],
  },
});
