import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { DocumentDirection, DocumentType } from '@/src/features/documents/documentLabels';
import { CompanySettingsCard } from '@/src/features/settings/CompanySettingsCard';
import { RequirementTemplateCard } from '@/src/features/settings/RequirementTemplateCard';
import { RequirementTemplateForm } from '@/src/features/settings/RequirementTemplateForm';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type CreateTemplateInput = {
  direction: DocumentDirection;
  documentType: DocumentType;
  displayName: string;
  required: boolean;
  defaultDueOffsetHours?: number;
};

export default function DispatcherSettingsScreen() {
  const { currentProfile } = useCurrentProfile();
  const templates = useQuery(api.companyDocumentRequirementTemplates.listForCurrentCompany, {});
  const createTemplate = useMutation(api.companyDocumentRequirementTemplates.createForCurrentCompany);
  const updateTemplate = useMutation(api.companyDocumentRequirementTemplates.updateForCurrentCompany);
  const disableTemplate = useMutation(api.companyDocumentRequirementTemplates.disableForCurrentCompany);
  const seedDefaultTemplates = useMutation(api.companyDocumentRequirementTemplates.seedDefaultsForCurrentCompany);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [updatingTemplateId, setUpdatingTemplateId] = useState<Id<'companyDocumentRequirementTemplates'> | null>(null);
  const [disablingTemplateId, setDisablingTemplateId] = useState<Id<'companyDocumentRequirementTemplates'> | null>(null);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const company = currentProfile?.company;
  const activeTemplateCount = templates?.filter((template) => template.status === 'ACTIVE').length ?? 0;

  const handleCreateTemplate = async (input: CreateTemplateInput) => {
    setCreating(true);
    setMessage(undefined);
    setError(undefined);

    try {
      await createTemplate(input);
      setShowCreateForm(false);
      setMessage('Plantilla creada.');
    } catch (createError) {
      setError(getActionErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  };

  const handleSeedTemplates = async () => {
    setSeeding(true);
    setMessage(undefined);
    setError(undefined);

    try {
      const result = await seedDefaultTemplates({});
      setMessage(result.createdCount > 0 ? 'Plantillas base creadas.' : 'La empresa ya tiene plantillas activas.');
    } catch (seedError) {
      setError(getActionErrorMessage(seedError));
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateTemplate = async (
    templateId: Id<'companyDocumentRequirementTemplates'>,
    input: {
      displayName: string;
      required: boolean;
      defaultDueOffsetHours?: number | null;
    },
  ) => {
    setUpdatingTemplateId(templateId);
    setMessage(undefined);
    setError(undefined);

    try {
      await updateTemplate({
        templateId,
        displayName: input.displayName,
        required: input.required,
        defaultDueOffsetHours: input.defaultDueOffsetHours,
      });
      setMessage('Plantilla actualizada.');
    } catch (updateError) {
      setError(getActionErrorMessage(updateError));
    } finally {
      setUpdatingTemplateId(null);
    }
  };

  const handleDisableTemplate = async (templateId: Id<'companyDocumentRequirementTemplates'>) => {
    setDisablingTemplateId(templateId);
    setMessage(undefined);
    setError(undefined);

    try {
      await disableTemplate({ templateId });
      setMessage('Plantilla desactivada.');
    } catch (disableError) {
      setError(getActionErrorMessage(disableError));
    } finally {
      setDisablingTemplateId(null);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Empresa y plantillas documentales</Text>
      </SafeAreaView>
      <AppScreen>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
        {company ? <CompanySettingsCard company={company} /> : null}
        <AppCard>
          <Text style={styles.sectionTitle}>Plantillas documentales</Text>
          <Text style={styles.sectionText}>
            Estas plantillas se copiarán automáticamente al checklist de cada nuevo viaje.
          </Text>
          <View style={styles.actionGroup}>
            <AppButton
              label={showCreateForm ? 'Ocultar formulario' : 'Crear plantilla'}
              variant={showCreateForm ? 'secondary' : 'primary'}
              fullWidth
              onPress={() => setShowCreateForm((value) => !value)}
            />
            {templates !== undefined && activeTemplateCount === 0 ? (
              <AppButton
                label="Crear plantillas base"
                variant="secondary"
                fullWidth
                onPress={handleSeedTemplates}
                loading={seeding}
              />
            ) : null}
          </View>
        </AppCard>
        {showCreateForm ? (
          <RequirementTemplateForm
            loading={creating}
            onCancel={() => setShowCreateForm(false)}
            onSubmit={handleCreateTemplate}
          />
        ) : null}
        {templates === undefined ? <AppLoading message="Cargando plantillas" /> : null}
        {templates && templates.length === 0 ? (
          <AppEmptyState title="Aún no hay plantillas documentales." message="Crea una plantilla o usa las plantillas base." />
        ) : null}
        {templates && templates.length > 0 ? (
          <FlatList
            data={templates}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <RequirementTemplateCard
                template={item}
                updating={updatingTemplateId === item._id}
                disabling={disablingTemplateId === item._id}
                onUpdate={handleUpdateTemplate}
                onDisable={handleDisableTemplate}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : null}
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  header: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
    paddingBottom: 14,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  sectionText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginTop: spacing[2],
  },
  actionGroup: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  separator: {
    height: spacing[3],
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  messageBox: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  messageText: {
    color: colors.success,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
