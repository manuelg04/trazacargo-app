import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DevSessionProvider } from '@/src/features/devSession/DevSessionContext';
import { colors } from '@/src/theme/colors';

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
    background: colors.background,
    card: colors.surface,
    primary: colors.primary,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <DevSessionProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="dark" />
        </ThemeProvider>
      </DevSessionProvider>
    </ConvexProvider>
  );
}
