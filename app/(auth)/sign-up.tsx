import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { AuthForm } from '@/src/features/auth/AuthForm';

export default function SignUpScreen() {
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
      await signIn('password', { email, password, flow: 'signUp' });
      router.replace('/(onboarding)/access-code');
    } catch (authError) {
      setError(getAuthErrorMessage(authError, 'No se pudo crear la cuenta.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppScreen title="Crear cuenta" subtitle="Crea tu acceso y luego activa el código de tu empresa.">
      <AuthForm
        mode="signUp"
        loading={submitting}
        error={error}
        onSubmit={handleSubmit}
        onSwitchMode={() => router.replace('/(auth)/sign-in')}
      />
    </AppScreen>
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('at least 8')) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }

  if (message.includes('already exists') || message.includes('already in use')) {
    return 'Ya existe una cuenta con este correo.';
  }

  return fallback;
}
