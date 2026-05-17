import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { DocumentUploadForm } from '@/src/features/documents/DocumentUploadForm';
import { DocumentRequirementView } from '@/src/features/documents/documentRequirementTypes';
import {
  companyDocumentTypeOptions,
  driverDocumentTypeOptions,
} from '@/src/features/documents/documentLabels';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

type RequirementUploadPanelProps = {
  tripId: Id<'trips'>;
  requirement: DocumentRequirementView;
  parentDocumentId?: Id<'tripDocuments'>;
  onUploaded?: () => void;
};

export function RequirementUploadPanel({
  tripId,
  requirement,
  parentDocumentId,
  onUploaded,
}: RequirementUploadPanelProps) {
  const options =
    requirement.direction === 'COMPANY_TO_DRIVER' ? companyDocumentTypeOptions : driverDocumentTypeOptions;

  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {requirement.direction === 'COMPANY_TO_DRIVER' ? 'Subir documento de empresa' : 'Enviar soporte'}
      </Text>
      <DocumentUploadForm
        tripId={tripId}
        direction={requirement.direction}
        availableDocumentTypes={options}
        requirementId={requirement._id}
        fixedDocumentType={requirement.documentType}
        defaultDisplayName={requirement.displayName}
        submitLabel={parentDocumentId ? 'Reenviar documento' : 'Subir documento'}
        parentDocumentResolver={() => parentDocumentId}
        onUploaded={onUploaded}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.neutral50,
    borderColor: colors.borderSubtle,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing[3],
    padding: spacing[3],
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
});
