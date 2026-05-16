import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type AppLoadingProps = {
  message?: string;
};

export function AppLoading({ message = 'Cargando' }: AppLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
  },
});
