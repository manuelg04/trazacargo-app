import { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { colors, radius, shadow, spacing } from '@/constants/theme';

type AppCardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export function AppCard({ children, onPress, style }: AppCardProps) {
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[styles.card, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[4],
    ...shadow.sm,
  },
});
