import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
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
    <AppScreen title="Ingresar" subtitle="Usa el correo y la contraseña registrados para TrazaCargo.">
      <AuthForm
        mode="signIn"
        loading={submitting}
        error={error}
        onSubmit={handleSubmit}
        onSwitchMode={() => router.replace('/(auth)/sign-up')}
      />
    </AppScreen>
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : '';

  if (message.includes('Invalid credentials')) {
    return 'Correo o contraseña incorrectos.';
  }

  return fallback;
}
