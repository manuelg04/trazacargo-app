import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export type TripFormValues = {
  originCity: string;
  destinationCity: string;
  routeLabel?: string;
  pickupAt: string;
  deliveryEta?: string;
  cargoDescription: string;
  freightValue?: string;
  advanceValue?: string;
  observations?: string;
};

type TripFormProps = {
  loading?: boolean;
  onSubmit: (values: TripFormValues) => void;
};

export function TripForm({ loading = false, onSubmit }: TripFormProps) {
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [routeLabel, setRouteLabel] = useState('');
  const [pickupAt, setPickupAt] = useState('');
  const [deliveryEta, setDeliveryEta] = useState('');
  const [cargoDescription, setCargoDescription] = useState('');
  const [freightValue, setFreightValue] = useState('');
  const [advanceValue, setAdvanceValue] = useState('');
  const [observations, setObservations] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = () => {
    if (!originCity.trim() || !destinationCity.trim() || !pickupAt.trim() || !cargoDescription.trim()) {
      setError('Completa origen, destino, fecha de cargue y carga.');
      return;
    }

    setError(undefined);
    onSubmit({
      originCity,
      destinationCity,
      routeLabel,
      pickupAt,
      deliveryEta,
      cargoDescription,
      freightValue,
      advanceValue,
      observations,
    });
  };

  return (
    <AppCard>
      <View style={styles.form}>
        <AppInput label="Ciudad origen" value={originCity} onChangeText={setOriginCity} autoCapitalize="words" />
        <AppInput label="Ciudad destino" value={destinationCity} onChangeText={setDestinationCity} autoCapitalize="words" />
        <AppInput label="Ruta / etiqueta" value={routeLabel} onChangeText={setRouteLabel} autoCapitalize="sentences" />
        <AppInput label="Fecha de cargue" value={pickupAt} onChangeText={setPickupAt} placeholder="2026-05-20 08:00" />
        <AppInput label="ETA entrega" value={deliveryEta} onChangeText={setDeliveryEta} placeholder="2026-05-21 16:00" />
        <AppInput
          label="Descripción de carga"
          value={cargoDescription}
          onChangeText={setCargoDescription}
          autoCapitalize="sentences"
          multiline
          style={styles.multiline}
        />
        <AppInput
          label="Valor flete"
          value={freightValue}
          onChangeText={setFreightValue}
          keyboardType="number-pad"
          placeholder="4200000"
        />
        <AppInput
          label="Anticipo"
          value={advanceValue}
          onChangeText={setAdvanceValue}
          keyboardType="number-pad"
          placeholder="1200000"
        />
        <AppInput
          label="Observaciones"
          value={observations}
          onChangeText={setObservations}
          autoCapitalize="sentences"
          multiline
          style={styles.multiline}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <AppButton title="Crear viaje" onPress={handleSubmit} loading={loading} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  multiline: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  error: {
    ...typography.body,
    color: colors.danger,
  },
});
