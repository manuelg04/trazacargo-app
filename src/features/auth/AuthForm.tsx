import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type AuthMode = 'signIn' | 'signUp';

type AuthFormProps = {
  mode: AuthMode;
  loading: boolean;
  error?: string;
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchMode: () => void;
};

export function AuthForm({ mode, loading, error, onSubmit, onSwitchMode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | undefined>();
  const isSignUp = mode === 'signUp';

  const handleSubmit = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setLocalError('Ingresa tu correo.');
      return;
    }

    if (!password) {
      setLocalError('Ingresa tu contraseña.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    setLocalError(undefined);
    await onSubmit(normalizedEmail, password);
  };

  return (
    <View style={styles.container}>
      <AppInput
        nativeID="auth-email"
        label="Correo"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="correo@empresa.com"
      />
      <AppInput
        nativeID="auth-password"
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        textContentType={isSignUp ? 'newPassword' : 'password'}
        placeholder="Mínimo 8 caracteres"
      />
      {isSignUp ? (
        <AppInput
          nativeID="auth-confirm-password"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          textContentType="newPassword"
          placeholder="Repite tu contraseña"
        />
      ) : null}
      {localError || error ? <Text style={styles.error}>{localError ?? error}</Text> : null}
      <AppButton title={isSignUp ? 'Crear cuenta' : 'Ingresar'} onPress={handleSubmit} loading={loading} />
      <Pressable accessibilityRole="button" onPress={onSwitchMode} style={styles.switchButton}>
        <Text style={styles.switchText}>{isSignUp ? 'Ya tengo cuenta' : 'Crear cuenta'}</Text>
      </Pressable>
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
  switchButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  switchText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '700',
  },
});
