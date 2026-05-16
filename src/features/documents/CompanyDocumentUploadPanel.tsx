import { StyleSheet, Text } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppCard } from '@/src/components/AppCard';
import { companyDocumentTypeOptions } from '@/src/features/documents/documentLabels';
import { DocumentUploadForm } from '@/src/features/documents/DocumentUploadForm';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type CompanyDocumentUploadPanelProps = {
  tripId: Id<'trips'>;
};

export function CompanyDocumentUploadPanel({ tripId }: CompanyDocumentUploadPanelProps) {
  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Subir documento</Text>
      <DocumentUploadForm
        tripId={tripId}
        direction="COMPANY_TO_DRIVER"
        availableDocumentTypes={companyDocumentTypeOptions}
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
