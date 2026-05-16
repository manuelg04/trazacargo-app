import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { AuthForm } from '@/src/features/auth/AuthForm';

export default function SignInScreen() {
  const { signIn } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  if (isLoading) {
    return (
      <AppScreen>
        <AppLoading message="Cargando sesión" />
      </AppScreen>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/" />;
  }

  const handleSubmit = async (email: string, password: string) => {
    setSubmitting(true);
    setError(undefined);

    try {
      await signIn('password', { email, password, flow: 'signIn' });
      router.replace('/');
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'No se pudo ingresar.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.topZone}>
        <View style={styles.topContent}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>TC</Text>
          </View>
          <Text style={styles.appName}>TrazaCargo</Text>
          <Text style={styles.appSubtitle}>Gestión de viajes y documentos</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.bottomZone}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Iniciar sesión</Text>
        <AuthForm
          mode="signIn"
          loading={submitting}
          error={error}
          onSubmit={handleSubmit}
          onSwitchMode={() => router.replace('/(auth)/sign-up')}
        />
      </ScrollView>
    </View>
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('Invalid credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  return fallback;
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
  logoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing[1],
    width: 52,
  },
  logoText: {
    color: colors.textInverse,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize['2xl'],
  },
  appName: {
    color: colors.textInverse,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize['2xl'],
  },
  appSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  bottomZone: {
    backgroundColor: colors.bgCanvas,
    flex: 1,
  },
  formContent: {
    gap: spacing[5],
    padding: spacing[6],
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xl,
  },
});
