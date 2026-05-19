import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppInput } from '@/src/components/AppInput';
import {
  buildIsoFromDateAndTime,
  formatDateTimeInputDisplay,
  getDateInputValue,
  getTimeInputValue,
} from '@/src/utils/dateTimeInput';

type AppDateTimeInputProps = {
  label?: string;
  value?: string;
  onChange: (value?: string) => void;
  error?: string;
  disabled?: boolean;
};

export function AppDateTimeInput({
  label = 'Fecha de cargue',
  value,
  onChange,
  error,
  disabled = false,
}: AppDateTimeInputProps) {
  const [dateText, setDateText] = useState(getDateInputValue(value));
  const [timeText, setTimeText] = useState(getTimeInputValue(value));

  useEffect(() => {
    setDateText(getDateInputValue(value));
    setTimeText(getTimeInputValue(value));
  }, [value]);

  const handleDateChange = (nextDateText: string) => {
    setDateText(nextDateText);
    updateValue(nextDateText, timeText);
  };

  const handleTimeChange = (nextTimeText: string) => {
    setTimeText(nextTimeText);
    updateValue(dateText, nextTimeText);
  };

  const updateValue = (nextDateText: string, nextTimeText: string) => {
    if (!nextDateText && !nextTimeText) {
      onChange(undefined);
      return;
    }

    const isoValue = buildIsoFromDateAndTime(nextDateText, nextTimeText);

    if (isoValue) {
      onChange(isoValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.summary}>{formatDateTimeInputDisplay(value)}</Text>
      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="Fecha de cargue"
            value={dateText}
            onChangeText={handleDateChange}
            placeholder="YYYY-MM-DD"
            error={error && !dateText ? error : undefined}
            disabled={disabled}
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Hora de cargue"
            value={timeText}
            onChangeText={handleTimeChange}
            placeholder="HH:mm"
            error={error && dateText && !timeText ? error : undefined}
            disabled={disabled}
          />
        </View>
      </View>
      {error && dateText && timeText ? <Text style={styles.error}>✕ {error}</Text> : null}
    </View>
  );
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
  summary: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  col: {
    flex: 1,
  },
  error: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
  },
});
