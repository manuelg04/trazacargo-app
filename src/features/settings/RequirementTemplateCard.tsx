import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { StatusBadge } from '@/src/components/StatusBadge';
import {
  DocumentDirection,
  DocumentType,
  documentDirectionLabels,
  getDocumentTypeLabel,
} from '@/src/features/documents/documentLabels';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type RequirementTemplateView = {
  _id: Id<'companyDocumentRequirementTemplates'>;
  direction: DocumentDirection;
  documentType: DocumentType;
  displayName: string;
  required: boolean;
  defaultDueOffsetHours?: number;
  status: 'ACTIVE' | 'DISABLED';
};

type RequirementTemplateCardProps = {
  template: RequirementTemplateView;
  updating?: boolean;
  disabling?: boolean;
  onUpdate: (
    templateId: Id<'companyDocumentRequirementTemplates'>,
    input: {
      displayName: string;
      required: boolean;
      defaultDueOffsetHours?: number | null;
    },
  ) => Promise<void>;
  onDisable: (templateId: Id<'companyDocumentRequirementTemplates'>) => Promise<void>;
};

export function RequirementTemplateCard({
  template,
  updating = false,
  disabling = false,
  onUpdate,
  onDisable,
}: RequirementTemplateCardProps) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(template.displayName);
  const [required, setRequired] = useState(template.required);
  const [defaultDueOffsetHours, setDefaultDueOffsetHours] = useState(
    template.defaultDueOffsetHours === undefined ? '' : String(template.defaultDueOffsetHours),
  );
  const [error, setError] = useState<string | undefined>();

  const handleCancel = () => {
    setEditing(false);
    setDisplayName(template.displayName);
    setRequired(template.required);
    setDefaultDueOffsetHours(template.defaultDueOffsetHours === undefined ? '' : String(template.defaultDueOffsetHours));
    setError(undefined);
  };

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedDueHours = defaultDueOffsetHours.trim();
    const parsedDueHours = trimmedDueHours ? Number(trimmedDueHours) : null;

    if (!trimmedName) {
      setError('Ingresa un nombre visible.');
      return;
    }

    if (parsedDueHours !== null && (!Number.isFinite(parsedDueHours) || parsedDueHours < 0)) {
      setError('Ingresa horas límite válidas.');
      return;
    }

    setError(undefined);
    await onUpdate(template._id, {
      displayName: trimmedName,
      required,
      defaultDueOffsetHours: parsedDueHours,
    });
    setEditing(false);
  };

  return (
    <AppCard style={template.status === 'DISABLED' ? styles.disabledCard : undefined}>
      <View style={styles.header}>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{template.displayName}</Text>
          <Text style={styles.meta}>{documentDirectionLabels[template.direction]}</Text>
          <Text style={styles.meta}>{getDocumentTypeLabel(template.documentType)}</Text>
        </View>
        <View style={styles.badges}>
          <StatusBadge status={template.status} />
          <Text style={styles.requiredBadge}>{template.required ? 'Obligatorio' : 'Opcional'}</Text>
        </View>
      </View>
      {template.defaultDueOffsetHours !== undefined ? (
        <Text style={styles.dueText}>Límite por defecto: {template.defaultDueOffsetHours} h desde el cargue</Text>
      ) : (
        <Text style={styles.dueText}>Sin límite por defecto</Text>
      )}
      {editing ? (
        <View style={styles.editForm}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppInput label="Nombre visible" value={displayName} onChangeText={setDisplayName} autoCapitalize="sentences" />
          <AppInput
            label="Horas límite por defecto"
            value={defaultDueOffsetHours}
            onChangeText={setDefaultDueOffsetHours}
            keyboardType="numeric"
            hint="Déjalo vacío para no usar límite por defecto."
          />
          <View style={styles.actionRow}>
            <AppButton
              label={required ? 'Obligatorio' : 'Marcar obligatorio'}
              variant={required ? 'primary' : 'secondary'}
              onPress={() => setRequired(true)}
              style={styles.rowButton}
            />
            <AppButton
              label={!required ? 'Opcional' : 'Marcar opcional'}
              variant={!required ? 'primary' : 'secondary'}
              onPress={() => setRequired(false)}
              style={styles.rowButton}
            />
          </View>
          <AppButton label="Guardar cambios" onPress={handleSave} loading={updating} fullWidth />
          <AppButton label="Descartar" variant="secondary" onPress={handleCancel} disabled={updating} fullWidth />
        </View>
      ) : null}
      {!editing && template.status === 'ACTIVE' ? (
        <View style={styles.actions}>
          <AppButton label="Editar" variant="secondary" onPress={() => setEditing(true)} fullWidth />
          <AppButton
            label="Desactivar"
            variant="danger"
            onPress={() => onDisable(template._id)}
            loading={disabling}
            fullWidth
          />
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  disabledCard: {
    opacity: 0.74,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  badges: {
    alignItems: 'flex-end',
    gap: spacing[2],
  },
  requiredBadge: {
    color: colors.brand600,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
  },
  dueText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginTop: spacing[3],
  },
  editForm: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  rowButton: {
    flex: 1,
  },
  actions: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
