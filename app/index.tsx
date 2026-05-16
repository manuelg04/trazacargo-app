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

  return (
    <AppScreen title="Perfil no disponible" subtitle="Este perfil todavía no tiene una experiencia móvil activa.">
      <Text style={{ ...typography.body, color: colors.text }}>
        Tu rol actual es {roleLabels[currentProfile.profile.role]}. Se habilitará en otra fase.
      </Text>
    </AppScreen>
  );
}
