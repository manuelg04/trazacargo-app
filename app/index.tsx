import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { roleLabels } from '@/src/constants/access';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors } from '@/src/theme/colors';
import { typography } from '@/src/theme/typography';

export default function IndexScreen() {
  const { currentProfile, isAuthenticated, isLoading, isProfileLoading } = useCurrentProfile();

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

  if (!currentProfile?.profile || currentProfile.profile.status !== 'ACTIVE') {
    return <Redirect href="/(onboarding)/access-code" />;
  }

  if (currentProfile.profile.role === 'DRIVER') {
    return <Redirect href="/(driver)/offers" />;
  }

  if (currentProfile.profile.role === 'DISPATCHER' || currentProfile.profile.role === 'ADMIN') {
    return <Redirect href="/(dispatcher)/dashboard" />;
  }

  return (
    <AppScreen title="Perfil no disponible" subtitle="Este rol no está soportado en TrazaCargo.">
      <Text style={{ ...typography.body, color: colors.text }}>
        Tu rol actual es {roleLabels[currentProfile.profile.role] ?? currentProfile.profile.role}.
      </Text>
    </AppScreen>
  );
}
