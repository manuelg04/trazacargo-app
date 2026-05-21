import { useAuthActions } from '@convex-dev/auth/react';
import { useMutation } from 'convex/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { copy } from '@/constants/copy';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { AccessCodeForm } from '@/src/features/onboarding/AccessCodeForm';
import { getKeyboardAwareBottomPadding } from '@/src/utils/keyboardAwareScroll';

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

  if (
    currentProfile?.profile?.status === 'ACTIVE' &&
    (currentProfile.profile.role === 'DISPATCHER' || currentProfile.profile.role === 'ADMIN')
  ) {
    return <Redirect href="/(dispatcher)/dashboard" />;
  }

  const handleRedeem = async (code: string) => {
    setSubmitting(true);
    setError(undefined);

    try {
      const result = await redeemAccessCode({ code });
      router.replace(result.profile.role === 'DRIVER' ? '/(driver)/offers' : '/(dispatcher)/dashboard');
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
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.topZone}>
        <View style={styles.topContent}>
          <Text style={styles.keyIcon}>🔑</Text>
          <Text style={styles.topTitle}>Código de acceso</Text>
        </View>
      </SafeAreaView>

      <KeyboardAwareScrollView
        style={styles.bottomZone}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Ingresa el código de acceso que te entregó la empresa de transporte.
          </Text>
        </View>

        <AccessCodeForm loading={submitting} error={error} onSubmit={handleRedeem} />

        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

function getAccessCodeErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('usado')) {
    return copy.codeUsed;
  }

  if (message.includes('expiró')) {
    return copy.codeExpired;
  }

  return copy.codeInvalid;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topZone: {
    backgroundColor: colors.brand500,
  },
  topContent: {
    alignItems: 'center',
    gap: spacing[2],
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
  },
  keyIcon: {
    fontSize: 40,
  },
  topTitle: {
    color: colors.textInverse,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
  },
  bottomZone: {
    backgroundColor: colors.bgCanvas,
    flex: 1,
  },
  formContent: {
    gap: spacing[4],
    padding: spacing[6],
    paddingBottom: getKeyboardAwareBottomPadding(spacing[6]),
  },
  infoBox: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  infoText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  signOutButton: {
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  signOutText: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
});
