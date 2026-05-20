import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/constants/theme';
import { DateTimePickerSheet } from '@/src/components/DateTimePickerSheet';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  white: '#FFFFFF',
  errorBd: '#E0A0A0',
  error: '#C23030',
};

const MONTHS_ES_SHORT = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DOW3 = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

type AppDateTimeFieldProps = {
  label: string;
  hintLabel: string;
  sheetTitle: string;
  timeLabel: string;
  value?: string;
  onChange: (isoValue: string) => void;
  error?: string;
  placeholder?: string;
};

export function AppDateTimeField({
  label,
  hintLabel,
  sheetTitle,
  timeLabel,
  value,
  onChange,
  error,
  placeholder = 'Selecciona fecha y hora',
}: AppDateTimeFieldProps) {
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);

  const display = value ? formatDisplay(value) : undefined;

  const borderColor = error
    ? palette.errorBd
    : open
    ? palette.green800
    : palette.neutral200;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[
          styles.field,
          { borderColor },
          open ? styles.fieldFocused : null,
        ]}>
        <Ionicons
          name="calendar-outline"
          size={18}
          color={hasValue ? palette.green800 : palette.neutral400}
        />
        <View style={styles.textCol}>
          {hasValue ? (
            <>
              <Text style={styles.hint}>{hintLabel}</Text>
              <Text style={styles.value} numberOfLines={1}>{display}</Text>
            </>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color={palette.neutral300} />
      </Pressable>
      {error ? <Text style={styles.error}>✕ {error}</Text> : null}

      <DateTimePickerSheet
        visible={open}
        title={sheetTitle}
        hintLabel={timeLabel}
        initialValue={value}
        onConfirm={(iso) => {
          onChange(iso);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}

function formatDisplay(iso: string): string {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return '';
  const dow = DOW3[d.getDay()];
  const day = d.getDate();
  const month = MONTHS_ES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const h24 = d.getHours();
  const m = d.getMinutes();
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12Raw = h24 % 12;
  const h12 = h12Raw === 0 ? 12 : h12Raw;
  return `${dow}, ${day} ${month} ${year} · ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    color: palette.neutral900,
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    marginBottom: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 56,
  },
  fieldFocused: {
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 0,
  },
  textCol: {
    flex: 1,
  },
  hint: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    color: palette.green800,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: palette.neutral900,
  },
  placeholder: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: palette.neutral400,
  },
  error: {
    color: palette.error,
    fontFamily: fontFamily.medium,
    fontSize: 11,
    marginTop: 2,
  },
});
