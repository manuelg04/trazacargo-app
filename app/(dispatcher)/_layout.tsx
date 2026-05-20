import { Redirect, Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { fontFamily } from '@/constants/theme';

const palette = {
  green800: '#1A5C38',
  neutral400: '#94A3B8',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
};

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
        headerShown: false,
        tabBarActiveTintColor: palette.green800,
        tabBarInactiveTintColor: palette.neutral400,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
        tabBarIconStyle: styles.tabIcon,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          tabBarLabel: 'Viajes',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="truck-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="drivers"
        options={{
          tabBarLabel: 'Conductores',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="access-codes"
        options={{
          tabBarLabel: 'Accesos',
          tabBarIcon: ({ color }) => <Ionicons name="key-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Config.',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          tabBarLabel: 'Cuenta',
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-circle-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="create-trip" options={{ href: null }} />
      <Tabs.Screen name="trip/[tripId]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.white,
    borderTopColor: palette.neutral100,
    borderTopWidth: 1,
    height: 68,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    justifyContent: 'center',
  },
  tabIcon: {
    marginBottom: -2,
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 9,
    letterSpacing: 0.1,
  },
});
