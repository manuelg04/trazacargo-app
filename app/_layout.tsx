import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { lazy, Suspense } from 'react';
import { Platform, View } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { colors } from '@/constants/theme';

const NativeNotificationShell =
  Platform.OS === 'web' ? null : lazy(() => import('@/src/features/notifications/NativeNotificationShell'));

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error('Missing EXPO_PUBLIC_CONVEX_URL');
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bgCanvas,
    card: colors.surface,
    primary: colors.brand500,
    text: colors.textPrimary,
    border: colors.borderSubtle,
  },
};

const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bgCanvas }} />;
  }

  return (
    <ConvexAuthProvider client={convex} storage={Platform.OS === 'web' ? undefined : secureStorage}>
      <ThemeProvider value={navigationTheme}>
        {NativeNotificationShell ? (
          <Suspense fallback={null}>
            <NativeNotificationShell />
          </Suspense>
        ) : null}
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="light" />
      </ThemeProvider>
    </ConvexAuthProvider>
  );
}
