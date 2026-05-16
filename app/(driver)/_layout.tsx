import { Pressable, StyleSheet, Text } from 'react-native';
import { Redirect, Tabs, useRouter } from 'expo-router';
import { useDevSession } from '@/src/features/devSession/useDevSession';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function DriverLayout() {
  const { selectedDriverId, selectedDriverName, clearDriver } = useDevSession();
  const router = useRouter();

  if (!selectedDriverId) {
    return <Redirect href="/(dev)/select-driver" />;
  }

  const changeDriver = () => {
    clearDriver();
    router.replace('/(dev)/select-driver');
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerRight: () => (
          <Pressable onPress={changeDriver} style={styles.changeButton}>
            <Text style={styles.changeButtonText}>{selectedDriverName ?? 'Cambiar'}</Text>
          </Pressable>
        ),
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: () => null,
        tabBarIconStyle: styles.tabIcon,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen name="offers" options={{ title: 'Ofertas', tabBarLabel: 'Ofertas' }} />
      <Tabs.Screen name="trips" options={{ title: 'Mis viajes', tabBarLabel: 'Mis viajes' }} />
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
  changeButton: {
    marginRight: spacing.lg,
    maxWidth: 150,
  },
  changeButtonText: {
    ...typography.small,
    color: colors.primary,
    fontWeight: '700',
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
