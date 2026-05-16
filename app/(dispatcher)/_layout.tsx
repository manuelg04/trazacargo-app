import { StyleSheet } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function DispatcherLayout() {
  const { currentProfile, isAuthenticated, isLoading, isProfileLoading } = useCurrentProfile();

  if (isLoading || isProfileLoading) {
    return (
      <AppScreen>
        <AppLoading message="Cargando empresa" />
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

  if (currentProfile.profile.role !== 'DISPATCHER' && currentProfile.profile.role !== 'ADMIN') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: () => null,
        tabBarIconStyle: styles.tabIcon,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard', tabBarLabel: 'Dashboard' }} />
      <Tabs.Screen name="trips" options={{ title: 'Viajes', tabBarLabel: 'Viajes' }} />
      <Tabs.Screen name="drivers" options={{ title: 'Conductores', tabBarLabel: 'Conductores' }} />
      <Tabs.Screen name="access-codes" options={{ title: 'Accesos', tabBarLabel: 'Accesos' }} />
      <Tabs.Screen name="account" options={{ title: 'Cuenta', tabBarLabel: 'Cuenta' }} />
      <Tabs.Screen name="create-trip" options={{ href: null, title: 'Crear viaje' }} />
      <Tabs.Screen name="trip/[tripId]" options={{ href: null, title: 'Detalle del viaje' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.surface,
  },
  headerTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    height: 64,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
  },
  tabItem: {
    justifyContent: 'center',
  },
  tabIcon: {
    display: 'none',
  },
  tabLabel: {
    ...typography.small,
    fontWeight: '700',
  },
});
