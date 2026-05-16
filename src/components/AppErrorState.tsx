import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';

type AppErrorStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function AppErrorState({ title, message, actionLabel = 'Intentar de nuevo', onAction }: AppErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onAction ? (
        <AppButton label={actionLabel} onPress={onAction} variant="danger" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.card,
    borderWidth: 1,
    padding: spacing[6],
  },
  title: {
    color: colors.error,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    textAlign: 'center',
  },
  message: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    lineHeight: fontSize.sm * 1.6,
    marginTop: 6,
    textAlign: 'center',
  },
  action: {
    marginTop: 16,
  },
});
