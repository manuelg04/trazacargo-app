import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

type AppLoadingProps = {
  message?: string;
};

export function AppLoading({ message = 'Cargando' }: AppLoadingProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.brand500} size="small" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 10,
    padding: spacing[6],
  },
  message: {
    color: colors.textSecondary,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
