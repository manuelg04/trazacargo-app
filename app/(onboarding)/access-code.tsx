import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { api } from '@/convex/_generated/api';
import { AppButton } from '@/src/components/AppButton';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { AccessCodeForm } from '@/src/features/onboarding/AccessCodeForm';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function AccessCodeScreen() {
  const { signOut } = useAuthActions();
  const { currentProfile, isAuthenticated, isLoading, isProfileLoading } = useCurrentProfile();
  const redeemAccessCode = useMutation(api.accessCodes.redeemAccessCode);
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (isLoading || isProfileLoading) {
    return (
      <AppScreen>
        <AppLoading message="Cargando acceso" />
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (currentProfile?.profile?.status === 'ACTIVE' && currentProfile.profile.role === 'DRIVER') {
    return <Redirect href="/(driver)/offers" />;
  }

  const handleRedeem = async (code: string) => {
    setSubmitting(true);
    setError(undefined);

    try {
      const result = await redeemAccessCode({ code });
      router.replace(result.profile.role === 'DRIVER' ? '/(driver)/offers' : '/');
    } catch (redeemError) {
      setError(getAccessCodeErrorMessage(redeemError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <AppScreen title="Activar acceso" subtitle="Ingresa el código de acceso que te entregó la empresa de transporte.">
      <AccessCodeForm loading={submitting} error={error} onSubmit={handleRedeem} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Si el código no funciona, pide uno nuevo a tu empresa.</Text>
        <AppButton title="Cerrar sesión" variant="secondary" onPress={handleSignOut} />
      </View>
    </AppScreen>
  );
}

function getAccessCodeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('usado')) {
    return 'Código usado.';
  }

  if (message.includes('expiró')) {
    return 'Código expirado.';
  }

  if (message.includes('perfil')) {
    return message;
  }

  return 'Código inválido.';
}

const styles = StyleSheet.create({
  footer: {
    gap: spacing.md,
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
});
