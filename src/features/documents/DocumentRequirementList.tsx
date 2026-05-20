import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { DocumentRequirementCard } from '@/src/features/documents/DocumentRequirementCard';
import { DocumentRequirementView } from '@/src/features/documents/documentRequirementTypes';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type DocumentRequirementListProps = {
  title: string;
  description?: string;
  requirements: DocumentRequirementView[];
  actor: 'driver' | 'dispatcher';
  emptyText: string;
  onWaive?: (requirementId: Id<'tripDocumentRequirements'>, waiverReason: string) => Promise<void>;
  onReactivate?: (requirementId: Id<'tripDocumentRequirements'>) => Promise<void>;
  onUpdateDueDate?: (requirementId: Id<'tripDocumentRequirements'>, dueAt?: string) => Promise<void>;
  onUploaded?: () => void;
  uploadsEnabled?: boolean;
};

export function DocumentRequirementList({
  title,
  description,
  requirements,
  actor,
  emptyText,
  onWaive,
  onReactivate,
  onUpdateDueDate,
  onUploaded,
  uploadsEnabled = true,
}: DocumentRequirementListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {requirements.length === 0 ? <Text style={styles.emptyText}>{emptyText}</Text> : null}
      {requirements.map((requirement) => (
        <DocumentRequirementCard
          key={requirement._id}
          requirement={requirement}
          actor={actor}
          onWaive={onWaive}
          onReactivate={onReactivate}
          onUpdateDueDate={onUpdateDueDate}
          onUploaded={onUploaded}
          uploadsEnabled={uploadsEnabled}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing[3],
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
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
