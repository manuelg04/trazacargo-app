import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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

  return (
    <View style={styles.container}>
      <AppInput
        nativeID="access-code"
        label="Código de acceso"
        value={code}
        onChangeText={setCode}
        autoCapitalize="characters"
        autoCorrect={false}
        placeholder="TC-CARLOS-2026"
      />
      {localError || error ? <Text style={styles.error}>{localError ?? error}</Text> : null}
      <AppButton title="Activar acceso" onPress={handleSubmit} loading={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
