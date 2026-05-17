import { useMutation } from 'convex/react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import {
  companyDocumentTypeOptions,
  DocumentDirection,
  documentDirectionLabels,
  DocumentType,
  driverDocumentTypeOptions,
  getDocumentTypeLabel,
} from '@/src/features/documents/documentLabels';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type DocumentRequirementFormProps = {
  tripId: Id<'trips'>;
  onCreated?: () => void;
};

export function DocumentRequirementForm({ tripId, onCreated }: DocumentRequirementFormProps) {
  const createRequirement = useMutation(api.tripDocumentRequirements.createForTripByDispatcher);
  const [direction, setDirection] = useState<DocumentDirection>('DRIVER_TO_COMPANY');
  const [documentType, setDocumentType] = useState<DocumentType>('DELIVERY_TICKET');
  const [displayName, setDisplayName] = useState('');
  const [required, setRequired] = useState(true);
  const [dueAt, setDueAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const options = direction === 'COMPANY_TO_DRIVER' ? companyDocumentTypeOptions : driverDocumentTypeOptions;

  const handleDirectionChange = (nextDirection: DocumentDirection) => {
    setDirection(nextDirection);
    const nextType = nextDirection === 'COMPANY_TO_DRIVER' ? 'MANIFEST' : 'DELIVERY_TICKET';
    setDocumentType(nextType);
    setDisplayName('');
    setError(undefined);
  };

  const handleSubmit = async () => {
    const normalizedDisplayName = displayName.trim() || getDocumentTypeLabel(documentType);
    const normalizedDueAt = dueAt.trim();
    const dueAtTimestamp = normalizedDueAt ? Date.parse(normalizedDueAt) : undefined;

    if (normalizedDueAt && !Number.isFinite(dueAtTimestamp)) {
      setError('Ingresa una fecha límite válida.');
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      await createRequirement({
        tripId,
        direction,
        documentType,
        displayName: normalizedDisplayName,
        required,
        dueAt: dueAtTimestamp,
      });
      setDisplayName('');
      setDueAt('');
      setRequired(true);
      onCreated?.();
    } catch (createError) {
      setError(getActionErrorMessage(createError, 'No se pudo crear el requisito.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppCard style={styles.card}>
      <Text style={styles.title}>Crear requisito adicional</Text>
      <View style={styles.segment}>
        {(['COMPANY_TO_DRIVER', 'DRIVER_TO_COMPANY'] as DocumentDirection[]).map((item) => {
          const active = direction === item;

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              onPress={() => handleDirectionChange(item)}
              style={[styles.segmentButton, active ? styles.segmentButtonActive : null]}>
              <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
                {documentDirectionLabels[item]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.typeGrid}>
        {options.map((option) => {
          const active = documentType === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => {
                setDocumentType(option.value);
                setDisplayName('');
              }}
              style={[styles.typeButton, active ? styles.typeButtonActive : null]}>
              <Text style={[styles.typeButtonText, active ? styles.typeButtonTextActive : null]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <AppInput
        label="Nombre visible"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={getDocumentTypeLabel(documentType)}
      />
      <AppInput
        label="Fecha límite opcional"
        value={dueAt}
        onChangeText={setDueAt}
        placeholder="2026-05-30"
      />

      <View style={styles.segment}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRequired(true)}
          style={[styles.segmentButton, required ? styles.segmentButtonActive : null]}>
          <Text style={[styles.segmentText, required ? styles.segmentTextActive : null]}>Requerido</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => setRequired(false)}
          style={[styles.segmentButton, !required ? styles.segmentButtonActive : null]}>
          <Text style={[styles.segmentText, !required ? styles.segmentTextActive : null]}>Opcional</Text>
        </Pressable>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <AppButton label="Crear requisito" fullWidth loading={saving} onPress={handleSubmit} />
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[3],
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  segment: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  segmentButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: radius.btn,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[2],
  },
  segmentButtonActive: {
    backgroundColor: colors.brand500,
    borderColor: colors.brand500,
  },
  segmentText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.textInverse,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  typeButton: {
    backgroundColor: colors.neutral50,
    borderColor: colors.borderSubtle,
    borderRadius: radius.btn,
    borderWidth: 1,
    minHeight: 42,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  typeButtonActive: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand500,
  },
  typeButtonText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  typeButtonTextActive: {
    color: colors.brand600,
  },
  error: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    padding: spacing[3],
  },
});
