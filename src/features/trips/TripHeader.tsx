import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

type TripHeaderProps = {
  originCity: string;
  destinationCity: string;
  routeLabel: string;
};

export function TripHeader({ originCity, destinationCity, routeLabel }: TripHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.route}>{originCity} → {destinationCity}</Text>
      <Text style={styles.label}>{routeLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  route: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
  },
});
