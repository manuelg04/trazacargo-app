import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { colors, fontFamily, fontSize, size } from '@/constants/theme';

export default function DriverLayout() {
  const { currentProfile, isAuthenticated, isLoading, isProfileLoading } = useCurrentProfile();

  if (isLoading || isProfileLoading) {
    return (
      <AppScreen>
        <AppLoading message="Cargando conductor" />
      </AppScreen>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!currentProfile?.profile || currentProfile.profile.status !== 'ACTIVE') {
    return <Redirect href="/(onboarding)/access-code" />;
  }

  if (currentProfile.profile.role !== 'DRIVER') {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand500,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIcon: () => null,
        tabBarIconStyle: { display: 'none' },
      }}>
      <Tabs.Screen name="offers" options={{ tabBarLabel: 'Ofertas' }} />
      <Tabs.Screen name="trips" options={{ tabBarLabel: 'Mis viajes' }} />
      <Tabs.Screen name="account" options={{ tabBarLabel: 'Cuenta' }} />
      <Tabs.Screen name="trip/[tripId]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    height: size.navBar,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
});
