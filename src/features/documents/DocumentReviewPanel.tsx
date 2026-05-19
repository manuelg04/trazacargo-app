import { StyleSheet, Text, View } from 'react-native';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { DocumentReviewActions } from '@/src/features/documents/DocumentReviewActions';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type DocumentReviewPanelProps = {
  documents: TripDocumentView[];
};

export function DocumentReviewPanel({ documents }: DocumentReviewPanelProps) {
  if (documents.length === 0) {
    return (
      <Text style={styles.empty}>Todavía no hay documentos enviados por el conductor.</Text>
    );
  }

  return (
    <View style={styles.container}>
      {documents.map((document) => (
        <DocumentCard key={document._id} document={document} showDirection={false}>
          {document.status === 'SUBMITTED' ? <DocumentReviewActions documentId={document._id} /> : null}
        </DocumentCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  empty: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
