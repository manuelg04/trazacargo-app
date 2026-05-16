import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { colors, fontFamily, fontSize, radius, size } from '@/constants/theme';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'accent' | 'success' | 'link';
type ButtonSize = 'lg' | 'md' | 'sm';

const variantMap: Record<Variant, { bg: string; text: string; border: string }> = {
  primary:   { bg: colors.brand500,  text: colors.textInverse,   border: colors.brand500 },
  secondary: { bg: colors.brand50,   text: colors.brand600,      border: colors.brand200 },
  danger:    { bg: colors.errorBg,   text: colors.error,         border: colors.errorBd },
  ghost:     { bg: 'transparent',    text: colors.textSecondary, border: colors.border },
  accent:    { bg: colors.accent500, text: colors.textInverse,   border: colors.accent500 },
  success:   { bg: colors.success,   text: colors.textInverse,   border: colors.success },
  link:      { bg: 'transparent',    text: colors.brand600,      border: 'transparent' },
};

type AppButtonProps = {
  label?: string;
  title?: string;
  onPress: () => void;
  variant?: Variant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function AppButton({
  label,
  title,
  onPress,
  variant = 'primary',
  size: buttonSize = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
}: AppButtonProps) {
  const text = label ?? title ?? '';
  const tone = variantMap[variant];
  const height = buttonSize === 'lg' ? size.btnLg : buttonSize === 'sm' ? size.btnSm : size.btnMd;
  const textSize = buttonSize === 'sm' ? fontSize.sm : fontSize.base;
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
          height,
          opacity: isDisabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={tone.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: tone.text, fontSize: textSize }]} numberOfLines={1}>
          {text}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.btn,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  label: {
    fontFamily: fontFamily.bold,
    letterSpacing: 0.1,
  },
});
