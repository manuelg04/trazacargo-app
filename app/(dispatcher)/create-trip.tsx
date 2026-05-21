import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/convex/_generated/api';
import { fontFamily } from '@/constants/theme';
import { KeyboardAwareScrollView } from '@/src/components/KeyboardAwareScrollView';
import { TripForm, TripFormValues } from '@/src/features/dispatcher/TripForm';
import { getKeyboardAwareBottomPadding } from '@/src/utils/keyboardAwareScroll';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral400: '#94A3B8',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
  errorBd: '#E0A0A0',
  errorBg: '#FEF0F0',
  error: '#C23030',
};

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
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            style={({ pressed }) => [styles.backBtn, pressed ? styles.backPressed : null]}>
            <Ionicons name="chevron-back" size={20} color={palette.neutral700} />
          </Pressable>

          <Text style={styles.title}>Crear viaje</Text>
          <Text style={styles.subtitle}>Registra un viaje para ofertarlo</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TripForm loading={saving} onSubmit={handleSubmit} />
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </View>
  );
}

function getCreateTripErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message) return message;
  return 'No se pudo crear el viaje.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.neutral100,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: getKeyboardAwareBottomPadding(32),
    gap: 14,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 14,
  },
  backPressed: {
    opacity: 0.85,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: palette.neutral900,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: palette.neutral400,
    marginTop: -8,
  },
  errorBox: {
    backgroundColor: palette.errorBg,
    borderColor: palette.errorBd,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  errorText: {
    color: palette.error,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
