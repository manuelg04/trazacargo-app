import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type OtherDocumentsSectionProps = {
  title?: string;
  description: string;
  documents: TripDocumentView[];
  emptyText: string;
  actionLabel?: string;
  actionContent?: ReactNode;
  renderDocumentActions?: (document: TripDocumentView) => ReactNode;
};

export function OtherDocumentsSection({
  title = 'Otros documentos',
  description,
  documents,
  emptyText,
  actionLabel,
  actionContent,
  renderDocumentActions,
}: OtherDocumentsSectionProps) {
  const [showAction, setShowAction] = useState(false);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {actionLabel && actionContent ? (
        <View style={styles.secondaryAction}>
          <AppButton
            label={showAction ? 'Ocultar subida libre' : actionLabel}
            variant="ghost"
            fullWidth
            onPress={() => setShowAction((value) => !value)}
          />
          {showAction ? actionContent : null}
        </View>
      ) : null}
      {documents.length === 0 ? (
        <AppCard>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </AppCard>
      ) : (
        <View style={styles.list}>
          {documents.map((document) => (
            <DocumentCard key={document._id} document={document}>
              {renderDocumentActions?.(document)}
            </DocumentCard>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  secondaryAction: {
    gap: spacing[3],
  },
  list: {
    gap: spacing[3],
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
