import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

type AccessCodeFormProps = {
  loading: boolean;
  error?: string;
  onSubmit: (code: string) => Promise<void>;
};

export function AccessCodeForm({ loading, error, onSubmit }: AccessCodeFormProps) {
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();

  const handleSubmit = async () => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setLocalError('Ingresa el código.');
      return;
    }

    setLocalError(undefined);
    await onSubmit(normalizedCode);
  };

  const displayError = localError ?? error;

  return (
    <View style={styles.container}>
      <AppInput
        label="Código de acceso"
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
        autoCapitalize="characters"
        placeholder="Ej: TC-4827-X"
        icon={<Text style={styles.inputIcon}>🔑</Text>}
      />
      {displayError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {displayError}</Text>
        </View>
      ) : null}
      <AppButton label="Activar acceso" onPress={handleSubmit} loading={loading} size="lg" fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  inputIcon: {
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.btn,
    borderWidth: 1,
    padding: spacing[3],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
