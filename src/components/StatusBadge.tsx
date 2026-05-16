import { StyleSheet, Text, View } from 'react-native';
import {
  accessCodeStatusColors,
  accessCodeStatusLabels,
  docStateColors,
  docStateLabels,
  fontFamily,
  fontSize,
  offerStatusColors,
  offerStatusLabels,
  profileStatusColors,
  profileStatusLabels,
  radius,
  roleColors,
  roleLabels,
  tripStateColors,
  tripStateLabels,
} from '@/constants/theme';

type StatusBadgeProps = {
  status: string;
};

function resolveLabel(status: string) {
  return (
    tripStateLabels[status] ??
    docStateLabels[status] ??
    offerStatusLabels[status] ??
    profileStatusLabels[status] ??
    accessCodeStatusLabels[status] ??
    roleLabels[status] ??
    status
  );
}

function resolveTone(status: string) {
  return (
    tripStateColors[status] ??
    docStateColors[status] ??
    offerStatusColors[status] ??
    profileStatusColors[status] ??
    accessCodeStatusColors[status] ??
    roleColors[status] ??
    { bg: '#F0F0ED', text: '#6E8078', border: '#D4D4CE' }
  );
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = resolveLabel(status);
  const tone = resolveTone(status);

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border,
        },
      ]}>
      <Text style={[styles.text, { color: tone.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  text: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
