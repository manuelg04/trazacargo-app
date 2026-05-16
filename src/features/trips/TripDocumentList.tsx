import { StyleSheet, Text, View } from 'react-native';
import { documentTypeLabels } from '@/src/constants/tripStatuses';
import { AppCard } from '@/src/components/AppCard';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type TripDocument = {
  _id: string;
  documentType: string;
  displayName: string;
  fileName: string;
  status: string;
};

type TripDocumentListProps = {
  documents: TripDocument[];
};

export function TripDocumentList({ documents }: TripDocumentListProps) {
  if (documents.length === 0) {
    return (
      <AppCard>
        <Text style={styles.empty}>Este viaje todavía no tiene documentos asociados.</Text>
      </AppCard>
    );
  }

  return (
    <View style={styles.container}>
      {documents.map((document) => (
        <AppCard key={document._id} style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View style={styles.documentText}>
              <Text style={styles.documentTitle}>{document.displayName}</Text>
              <Text style={styles.documentType}>
                {documentTypeLabels[document.documentType as keyof typeof documentTypeLabels] ?? document.documentType}
              </Text>
              <Text style={styles.fileName}>{document.fileName}</Text>
            </View>
            <StatusBadge status={document.status} />
          </View>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  documentCard: {
    padding: spacing.md,
  },
  documentHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  documentText: {
    flex: 1,
    gap: spacing.xs,
  },
  documentTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  documentType: {
    ...typography.body,
    color: colors.textMuted,
  },
  fileName: {
    ...typography.small,
    color: colors.textMuted,
  },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
