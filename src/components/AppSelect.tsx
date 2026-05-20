import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fontFamily } from '@/constants/theme';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
  overlay: 'rgba(15,23,42,0.5)',
};

type AppSelectProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export function AppSelect({ label, value, options, placeholder = 'Selecciona', onChange }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const hasValue = Boolean(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.field,
          open ? styles.fieldFocused : null,
          pressed ? styles.fieldPressed : null,
        ]}>
        <Text style={[styles.value, hasValue ? styles.valueFilled : styles.valuePlaceholder]} numberOfLines={1}>
          {hasValue ? value : placeholder}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={palette.neutral300} />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>
            <View style={styles.optionsList}>
              {options.map((opt) => {
                const isSelected = opt === value;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      isSelected ? styles.optionSelected : null,
                      pressed ? styles.optionPressed : null,
                    ]}>
                    <Text style={[styles.optionText, isSelected ? styles.optionTextSelected : null]}>
                      {opt}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color={palette.green800} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
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
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderWidth: 1.5,
    borderColor: palette.neutral200,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 13,
    minHeight: 48,
  },
  fieldFocused: {
    borderColor: palette.green800,
  },
  fieldPressed: {
    opacity: 0.9,
  },
  value: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 14,
  },
  valueFilled: {
    color: palette.neutral900,
  },
  valuePlaceholder: {
    color: palette.neutral400,
  },
  overlay: {
    flex: 1,
    backgroundColor: palette.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: palette.neutral200,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 18,
  },
  sheetTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: palette.neutral900,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  optionsList: {
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: palette.white,
  },
  optionSelected: {
    backgroundColor: '#E4F3EB',
  },
  optionPressed: {
    opacity: 0.85,
  },
  optionText: {
    fontFamily: fontFamily.semibold,
    fontSize: 14,
    color: palette.neutral700,
  },
  optionTextSelected: {
    color: palette.green800,
    fontFamily: fontFamily.bold,
  },
});
