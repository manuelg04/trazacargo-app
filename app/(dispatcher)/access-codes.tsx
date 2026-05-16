import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { roleLabels } from '@/src/constants/access';
import { AccessCodeCard } from '@/src/features/dispatcher/AccessCodeCard';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function AccessCodesScreen() {
  const { currentProfile } = useCurrentProfile();
  const accessCodes = useQuery(api.accessCodes.listForCurrentCompany, {});
  const createDispatcherAccessCode = useMutation(api.accessCodes.createDispatcherAccessCode);
  const disableAccessCode = useMutation(api.accessCodes.disableAccessCode);
  const [creatingRole, setCreatingRole] = useState<'DISPATCHER' | 'ADMIN' | null>(null);
  const [disablingCodeId, setDisablingCodeId] = useState<Id<'accessCodes'> | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const isAdmin = currentProfile?.profile?.role === 'ADMIN';

  const handleCreateAdministrativeCode = async (role: 'DISPATCHER' | 'ADMIN') => {
    setCreatingRole(role);
    setGeneratedCode(undefined);
    setError(undefined);

    try {
      const accessCode = await createDispatcherAccessCode({ role });
      setGeneratedCode(accessCode.code);
    } catch (createError) {
      setError(getAccessCodeErrorMessage(createError));
    } finally {
      setCreatingRole(null);
    }
  };

  const handleDisableAccessCode = async (accessCodeId: Id<'accessCodes'>) => {
    setDisablingCodeId(accessCodeId);
    setError(undefined);

    try {
      await disableAccessCode({ accessCodeId });
    } catch (disableError) {
      setError(getAccessCodeErrorMessage(disableError));
    } finally {
      setDisablingCodeId(null);
    }
  };

  return (
    <AppScreen title="Accesos" subtitle="Códigos de activación de la empresa.">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {generatedCode ? (
        <AppCard style={styles.generatedCard}>
          <Text style={styles.generatedLabel}>Código generado</Text>
          <Text style={styles.generatedCode}>{generatedCode}</Text>
        </AppCard>
      ) : null}
      {isAdmin ? (
        <View style={styles.actions}>
          <AppButton
            title={`Crear código ${roleLabels.DISPATCHER}`}
            onPress={() => handleCreateAdministrativeCode('DISPATCHER')}
            loading={creatingRole === 'DISPATCHER'}
          />
          <AppButton
            title={`Crear código ${roleLabels.ADMIN}`}
            variant="secondary"
            onPress={() => handleCreateAdministrativeCode('ADMIN')}
            loading={creatingRole === 'ADMIN'}
          />
        </View>
      ) : null}
      {accessCodes === undefined ? <AppLoading message="Cargando accesos" /> : null}
      {accessCodes && accessCodes.length === 0 ? (
        <AppEmptyState title="Sin códigos" message="Los códigos generados aparecerán aquí." />
      ) : null}
      <View style={styles.list}>
        {accessCodes?.map((accessCode) => (
          <AccessCodeCard
            key={accessCode._id}
            accessCode={accessCode}
            onDisable={handleDisableAccessCode}
            disabling={disablingCodeId === accessCode._id}
          />
        ))}
      </View>
    </AppScreen>
  );
}

function getAccessCodeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message) {
    return message;
  }

  return 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
  generatedCard: {
    backgroundColor: colors.successSoft,
  },
  generatedLabel: {
    ...typography.small,
    color: colors.success,
    fontWeight: '700',
  },
  generatedCode: {
    ...typography.sectionTitle,
    color: colors.text,
    marginTop: spacing.xs,
  },
});
