import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { api } from '@/convex/_generated/api';
import { AppScreen } from '@/src/components/AppScreen';
import { TripForm, TripFormValues } from '@/src/features/dispatcher/TripForm';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

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
    <AppScreen title="Crear viaje" subtitle="Registra un viaje para ofertarlo a conductores de la empresa.">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TripForm loading={saving} onSubmit={handleSubmit} />
    </AppScreen>
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
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
});
