import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import {
  DocumentDirection,
  DocumentType,
  companyDocumentTypeOptions,
  documentDirectionLabels,
  driverDocumentTypeOptions,
} from '@/src/features/documents/documentLabels';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type RequirementTemplateFormInput = {
  direction: DocumentDirection;
  documentType: DocumentType;
  displayName: string;
  required: boolean;
  defaultDueOffsetHours?: number;
};

type RequirementTemplateFormProps = {
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (input: RequirementTemplateFormInput) => Promise<void>;
};

export function RequirementTemplateForm({ loading = false, onCancel, onSubmit }: RequirementTemplateFormProps) {
  const [direction, setDirection] = useState<DocumentDirection>('COMPANY_TO_DRIVER');
  const [documentType, setDocumentType] = useState<DocumentType>('MANIFEST');
  const [displayName, setDisplayName] = useState('');
  const [required, setRequired] = useState(true);
  const [defaultDueOffsetHours, setDefaultDueOffsetHours] = useState('');
  const [error, setError] = useState<string | undefined>();
  const documentTypeOptions = useMemo(
    () => (direction === 'COMPANY_TO_DRIVER' ? companyDocumentTypeOptions : driverDocumentTypeOptions),
    [direction],
  );

  const handleDirectionChange = (nextDirection: DocumentDirection) => {
    setDirection(nextDirection);
    setDocumentType(nextDirection === 'COMPANY_TO_DRIVER' ? 'MANIFEST' : 'DELIVERY_TICKET');
  };

  const handleSubmit = async () => {
    const trimmedName = displayName.trim();
    const trimmedDueHours = defaultDueOffsetHours.trim();
    const parsedDueHours = trimmedDueHours ? Number(trimmedDueHours) : undefined;

    if (!trimmedName) {
      setError('Ingresa un nombre visible.');
      return;
    }

    if (parsedDueHours !== undefined && (!Number.isFinite(parsedDueHours) || parsedDueHours < 0)) {
      setError('Ingresa horas límite válidas.');
      return;
    }

    setError(undefined);
    await onSubmit({
      direction,
      documentType,
      displayName: trimmedName,
      required,
      defaultDueOffsetHours: parsedDueHours,
    });
    setDisplayName('');
    setDefaultDueOffsetHours('');
    setRequired(true);
  };

  return (
    <AppCard>
      <Text style={styles.title}>Crear plantilla</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.form}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Flujo documental</Text>
          <View style={styles.segmentRow}>
            {(['COMPANY_TO_DRIVER', 'DRIVER_TO_COMPANY'] as const).map((option) => (
              <Pressable
                key={option}
                onPress={() => handleDirectionChange(option)}
                style={[styles.segment, direction === option ? styles.segmentActive : null]}>
                <Text style={[styles.segmentText, direction === option ? styles.segmentTextActive : null]}>
                  {documentDirectionLabels[option]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Tipo de documento</Text>
          <View style={styles.optionGrid}>
            {documentTypeOptions.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setDocumentType(option.value)}
                style={[styles.option, documentType === option.value ? styles.optionActive : null]}>
                <Text style={[styles.optionText, documentType === option.value ? styles.optionTextActive : null]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <AppInput label="Nombre visible" value={displayName} onChangeText={setDisplayName} autoCapitalize="sentences" />
        <AppInput
          label="Horas límite por defecto"
          value={defaultDueOffsetHours}
          onChangeText={setDefaultDueOffsetHours}
          keyboardType="numeric"
          hint="Opcional. Se calcula desde la fecha de cargue del viaje."
        />
        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setRequired(true)}
            style={[styles.segment, required ? styles.segmentActive : null]}>
            <Text style={[styles.segmentText, required ? styles.segmentTextActive : null]}>Obligatorio</Text>
          </Pressable>
          <Pressable
            onPress={() => setRequired(false)}
            style={[styles.segment, !required ? styles.segmentActive : null]}>
            <Text style={[styles.segmentText, !required ? styles.segmentTextActive : null]}>Opcional</Text>
          </Pressable>
        </View>
        <AppButton label="Guardar plantilla" onPress={handleSubmit} loading={loading} fullWidth />
        <AppButton label="Cancelar" variant="secondary" onPress={onCancel} disabled={loading} fullWidth />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    marginBottom: spacing[3],
  },
  form: {
    gap: spacing[3],
  },
  fieldGroup: {
    gap: spacing[2],
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  segment: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  segmentActive: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand500,
  },
  segmentText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
  segmentTextActive: {
    color: colors.brand600,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  option: {
    borderColor: colors.borderSubtle,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  optionActive: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand500,
  },
  optionText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
  },
  optionTextActive: {
    color: colors.brand600,
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginBottom: spacing[3],
  },
});
