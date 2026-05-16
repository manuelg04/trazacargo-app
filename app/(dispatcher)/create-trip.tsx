import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppScreen } from '@/src/components/AppScreen';
import { TripForm, TripFormValues } from '@/src/features/dispatcher/TripForm';

export default function CreateTripScreen() {
  const router = useRouter();
  const createTrip = useMutation(api.trips.createForDispatcher);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (values: TripFormValues) => {
    setSaving(true);
    setError(undefined);

    try {
      const trip = await createTrip(values);
      router.replace({ pathname: '/(dispatcher)/trip/[tripId]', params: { tripId: trip._id } });
    } catch (createError) {
      setError(getCreateTripErrorMessage(createError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Crear viaje</Text>
        <Text style={styles.headerSubtitle}>Registra un viaje para ofertarlo</Text>
      </View>
      <AppScreen>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        <TripForm loading={saving} onSubmit={handleSubmit} />
      </AppScreen>
    </View>
  );
}

function getCreateTripErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message) {
    return message;
  }

  return 'No se pudo crear el viaje.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgCanvas,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  headerTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
