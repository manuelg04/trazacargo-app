import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppDateTimeInput } from '@/src/components/AppDateTimeInput';
import { AppInput } from '@/src/components/AppInput';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatMoneyInput, parseMoneyInputToNumber } from '@/src/utils/moneyInput';

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
  const [deliveryEta, setDeliveryEta] = useState('');
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
    <AppCard>
      <View style={styles.form}>
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
        <View style={styles.row}>
          <View style={styles.col}>
            <AppDateTimeInput
              label="Fecha de cargue *"
              value={pickupAt}
              onChange={setPickupAt}
              error={errors.pickupAt}
            />
          </View>
          <View style={styles.col}>
            <AppInput
              label="ETA entrega"
              value={deliveryEta}
              onChangeText={setDeliveryEta}
              placeholder="16 mayo 2026"
            />
          </View>
        </View>
        <AppInput
          label="Descripción de carga *"
          value={cargoDescription}
          onChangeText={setCargoDescription}
          autoCapitalize="sentences"
          multiline
          error={errors.cargoDescription}
        />
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
        <AppButton label="Crear viaje" onPress={handleSubmit} loading={loading} size="lg" fullWidth />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing[3],
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  col: {
    flex: 1,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.btn,
    borderWidth: 1,
    padding: spacing[3],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
