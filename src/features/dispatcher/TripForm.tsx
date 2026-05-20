import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '@/src/components/AppInput';
import { AppDateTimeField } from '@/src/components/AppDateTimeField';
import { fontFamily } from '@/constants/theme';
import { formatMoneyInput, parseMoneyInputToNumber } from '@/src/utils/moneyInput';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral400: '#94A3B8',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
  errorBd: '#E0A0A0',
  errorBg: '#FEF0F0',
  error: '#C23030',
};

export type TripFormValues = {
  originCity: string;
  destinationCity: string;
  routeLabel?: string;
  pickupAt: string;
  deliveryEta?: string;
  cargoDescription: string;
  freightValue?: number;
  advanceValue?: number;
  observations?: string;
};

type TripFormProps = {
  loading?: boolean;
  onSubmit: (values: TripFormValues) => void;
};

export function TripForm({ loading = false, onSubmit }: TripFormProps) {
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [routeLabel] = useState('');
  const [pickupAt, setPickupAt] = useState<string | undefined>();
  const [deliveryEta, setDeliveryEta] = useState<string | undefined>();
  const [cargoDescription, setCargoDescription] = useState('');
  const [freightValue, setFreightValue] = useState('');
  const [advanceValue, setAdvanceValue] = useState('');
  const [observations, setObservations] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!originCity.trim()) newErrors.originCity = 'Requerido';
    if (!destinationCity.trim()) newErrors.destinationCity = 'Requerido';
    if (!pickupAt) newErrors.pickupAt = 'Requerido';
    if (!cargoDescription.trim()) newErrors.cargoDescription = 'Requerido';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit({
      originCity,
      destinationCity,
      routeLabel,
      pickupAt: pickupAt ?? '',
      deliveryEta,
      cargoDescription,
      freightValue: parseMoneyInputToNumber(freightValue),
      advanceValue: parseMoneyInputToNumber(advanceValue),
      observations,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="Ciudad origen *"
            value={originCity}
            onChangeText={setOriginCity}
            autoCapitalize="words"
            error={errors.originCity}
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Ciudad destino *"
            value={destinationCity}
            onChangeText={setDestinationCity}
            autoCapitalize="words"
            error={errors.destinationCity}
          />
        </View>
      </View>

      <View style={styles.divider} />

      <AppDateTimeField
        label="Fecha de cargue *"
        hintLabel="Cargue"
        sheetTitle="Fecha de cargue"
        timeLabel="Hora de cargue"
        value={pickupAt}
        onChange={setPickupAt}
        error={errors.pickupAt}
      />

      <AppDateTimeField
        label="Fecha de entrega"
        hintLabel="Entrega estimada"
        sheetTitle="Fecha de entrega"
        timeLabel="Hora estimada"
        value={deliveryEta}
        onChange={setDeliveryEta}
      />

      <View style={styles.divider} />

      <AppInput
        label="Descripción de carga *"
        value={cargoDescription}
        onChangeText={setCargoDescription}
        autoCapitalize="sentences"
        multiline
        error={errors.cargoDescription}
      />

      <View style={styles.divider} />

      <View style={styles.row}>
        <View style={styles.col}>
          <AppInput
            label="Valor flete"
            value={freightValue}
            onChangeText={(text) => setFreightValue(formatMoneyInput(text))}
            keyboardType="number-pad"
            placeholder="3.200.000"
          />
        </View>
        <View style={styles.col}>
          <AppInput
            label="Anticipo"
            value={advanceValue}
            onChangeText={(text) => setAdvanceValue(formatMoneyInput(text))}
            keyboardType="number-pad"
            placeholder="800.000"
          />
        </View>
      </View>

      <AppInput
        label="Observaciones"
        value={observations}
        onChangeText={setObservations}
        autoCapitalize="sentences"
        multiline
      />

      {Object.keys(errors).length > 0 ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Completa los campos requeridos (*)</Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.submitBtn,
          pressed && !loading ? styles.submitPressed : null,
          loading ? styles.submitDisabled : null,
        ]}>
        <Ionicons name="add" size={18} color={palette.white} />
        <Text style={styles.submitLabel}>Crear viaje</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: palette.neutral100,
    marginHorizontal: -4,
  },
  errorBox: {
    backgroundColor: palette.errorBg,
    borderColor: palette.errorBd,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  errorText: {
    color: palette.error,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  submitBtn: {
    backgroundColor: palette.green800,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  submitPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: palette.white,
    letterSpacing: -0.2,
  },
});
