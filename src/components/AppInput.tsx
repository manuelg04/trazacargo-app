import { ReactNode, useState } from 'react';
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fontFamily, fontSize, radius, size } from '@/constants/theme';

type AppInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function AppInput({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  hint,
  secureTextEntry,
  icon,
  disabled,
  multiline,
  keyboardType,
  autoCapitalize,
}: AppInputProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.errorBd
    : focused
    ? colors.borderFocus
    : colors.border;

  const bgColor = error
    ? colors.errorBg
    : disabled
    ? colors.neutral100
    : colors.surface;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrapper,
          { borderColor, backgroundColor: bgColor },
          focused && !error ? styles.focusShadow : null,
        ]}>
        {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          multiline={multiline}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            multiline ? styles.multiline : { height: size.input },
          ]}
        />
      </View>
      {error ? <Text style={styles.error}>✕ {error}</Text> : null}
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 5,
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    marginBottom: 2,
  },
  inputWrapper: {
    alignItems: 'center',
    borderRadius: radius.btn,
    borderWidth: 1.5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  focusShadow: {
    shadowColor: colors.brand100,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 0,
  },
  iconWrapper: {
    paddingLeft: 12,
  },
  input: {
    color: colors.textPrimary,
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    paddingHorizontal: 14,
    paddingVertical: 0,
  },
  multiline: {
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  error: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
  hint: {
    color: colors.textTertiary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
  },
});
