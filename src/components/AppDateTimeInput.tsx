import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatDateTimeInputDisplay } from '@/src/utils/dateTimeInput';

type AppDateTimeInputProps = {
  label?: string;
  value?: string;
  onChange: (value?: string) => void;
  error?: string;
  disabled?: boolean;
};

type PickerMode = 'date' | 'time';

export function AppDateTimeInput({
  label = 'Fecha de cargue',
  value,
  onChange,
  error,
  disabled = false,
}: AppDateTimeInputProps) {
  const [visiblePicker, setVisiblePicker] = useState<PickerMode | undefined>();
  const selectedDate = useMemo(() => getDateFromValue(value), [value]);

  const handleChange = (mode: PickerMode, event: DateTimePickerEvent, nextDate?: Date) => {
    if (event.type === 'dismissed') {
      setVisiblePicker(undefined);
      return;
    }

    if (!nextDate) {
      return;
    }

    const mergedDate = new Date(selectedDate);

    if (mode === 'date') {
      mergedDate.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
    } else {
      mergedDate.setHours(nextDate.getHours(), nextDate.getMinutes(), 0, 0);
    }

    onChange(mergedDate.toISOString());

    if (Platform.OS === 'android') {
      setVisiblePicker(undefined);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.summaryBox, error ? styles.summaryBoxError : null, disabled ? styles.disabled : null]}>
        <Text style={styles.summaryText}>{formatDateTimeInputDisplay(value)}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setVisiblePicker((current) => (current === 'date' ? undefined : 'date'))}
          style={({ pressed }) => [
            styles.action,
            visiblePicker === 'date' ? styles.actionActive : null,
            pressed ? styles.actionPressed : null,
            disabled ? styles.disabled : null,
          ]}>
          <Text style={[styles.actionText, visiblePicker === 'date' ? styles.actionTextActive : null]}>
            Seleccionar fecha
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={() => setVisiblePicker((current) => (current === 'time' ? undefined : 'time'))}
          style={({ pressed }) => [
            styles.action,
            visiblePicker === 'time' ? styles.actionActive : null,
            pressed ? styles.actionPressed : null,
            disabled ? styles.disabled : null,
          ]}>
          <Text style={[styles.actionText, visiblePicker === 'time' ? styles.actionTextActive : null]}>
            Seleccionar hora
          </Text>
        </Pressable>
      </View>
      {visiblePicker ? (
        <DateTimePicker
          value={selectedDate}
          mode={visiblePicker}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          locale="es-CO"
          is24Hour
          themeVariant="light"
          onChange={(event, date) => handleChange(visiblePicker, event, date)}
        />
      ) : null}
      {error ? <Text style={styles.error}>✕ {error}</Text> : null}
    </View>
  );
}

function getDateFromValue(value?: string) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return new Date();
  }

  return date;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  label: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  summaryBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.btn,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: spacing[3],
  },
  summaryBoxError: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
  },
  summaryText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  action: {
    alignItems: 'center',
    backgroundColor: colors.brand50,
    borderColor: colors.brand200,
    borderRadius: radius.btn,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: spacing[2],
  },
  actionActive: {
    backgroundColor: colors.brand500,
    borderColor: colors.brand500,
  },
  actionPressed: {
    opacity: 0.84,
  },
  actionText: {
    color: colors.brand600,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  actionTextActive: {
    color: colors.textInverse,
  },
  disabled: {
    opacity: 0.5,
  },
  error: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
});
