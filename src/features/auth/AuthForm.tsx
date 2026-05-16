import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

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

  const displayError = localError ?? error;

  return (
    <View style={styles.container}>
      <AppInput
        label="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="correo@empresa.com"
        icon={<Text style={styles.inputIcon}>📧</Text>}
      />
      <AppInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Mínimo 8 caracteres"
        icon={<Text style={styles.inputIcon}>🔒</Text>}
      />
      {isSignUp ? (
        <AppInput
          label="Confirmar contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Repite tu contraseña"
          icon={<Text style={styles.inputIcon}>🔒</Text>}
        />
      ) : null}
      {displayError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {displayError}</Text>
        </View>
      ) : null}
      <AppButton
        label={isSignUp ? 'Crear cuenta' : 'Ingresar'}
        onPress={handleSubmit}
        loading={loading}
        size="lg"
        fullWidth
      />
      <TouchableOpacity onPress={onSwitchMode} activeOpacity={0.7} style={styles.switchButton}>
        <Text style={styles.switchText}>
          {isSignUp ? '¿Ya tienes cuenta? Iniciar sesión' : '¿No tienes cuenta? Crear cuenta'}
        </Text>
      </TouchableOpacity>
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
  switchButton: {
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  switchText: {
    color: colors.brand600,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
});
