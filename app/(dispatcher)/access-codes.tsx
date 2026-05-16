import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors, fontFamily, fontSize, roleLabels, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { AccessCodeCard } from '@/src/features/dispatcher/AccessCodeCard';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';

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
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Accesos</Text>
      </SafeAreaView>
      <AppScreen>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>⚠ Los códigos son visibles en modo MVP/dev. No compartir en producción.</Text>
        </View>
        {generatedCode ? (
          <View style={styles.generatedCard}>
            <Text style={styles.generatedLabel}>Código generado</Text>
            <Text style={styles.generatedCode}>{generatedCode}</Text>
            <Text style={styles.generatedHint}>Comparte este código con el usuario. Es de un solo uso.</Text>
          </View>
        ) : null}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {isAdmin ? (
          <View style={styles.adminActions}>
            <AppButton
              label={`Crear código ${roleLabels.DISPATCHER}`}
              variant="primary"
              fullWidth
              onPress={() => handleCreateAdministrativeCode('DISPATCHER')}
              loading={creatingRole === 'DISPATCHER'}
            />
            <AppButton
              label={`Crear código ${roleLabels.ADMIN}`}
              variant="secondary"
              fullWidth
              onPress={() => handleCreateAdministrativeCode('ADMIN')}
              loading={creatingRole === 'ADMIN'}
            />
          </View>
        ) : null}
        {accessCodes === undefined ? <AppLoading message="Cargando accesos" /> : null}
        {accessCodes && accessCodes.length === 0 ? (
          <AppEmptyState title="Sin códigos" message="Los códigos generados aparecerán aquí." />
        ) : null}
        {accessCodes && accessCodes.length > 0 ? (
          <FlatList
            data={accessCodes}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <AccessCodeCard
                accessCode={item}
                onDisable={handleDisableAccessCode}
                disabling={disablingCodeId === item._id}
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

function getAccessCodeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message) {
    return message;
  }

  return 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  warningBox: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[3],
  },
  warningText: {
    color: colors.warning,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
  generatedCard: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  generatedLabel: {
    color: colors.success,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  generatedCode: {
    color: colors.brand500,
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: 4,
    marginTop: 6,
  },
  generatedHint: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 6,
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
  adminActions: {
    gap: spacing[3],
  },
  separator: {
    height: spacing[3],
  },
});
