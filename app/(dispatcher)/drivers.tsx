import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppInput } from '@/src/components/AppInput';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { DriverCard } from '@/src/features/dispatcher/DriverCard';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';

export default function DispatcherDriversScreen() {
  const drivers = useQuery(api.drivers.listForCurrentCompany, {});
  const createDriver = useMutation(api.drivers.createForCurrentCompany);
  const createAccessCode = useMutation(api.accessCodes.createDriverAccessCode);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatingDriverId, setGeneratingDriverId] = useState<Id<'drivers'> | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleCreateDriver = async () => {
    if (!fullName.trim() || !phone.trim() || !documentNumber.trim()) {
      setError('Completa nombre, teléfono y documento.');
      return;
    }

    if ((vehiclePlate.trim() && !vehicleType.trim()) || (!vehiclePlate.trim() && vehicleType.trim())) {
      setError('Para crear vehículo, completa placa y tipo.');
      return;
    }

    setCreating(true);
    setError(undefined);

    try {
      await createDriver({ fullName, phone, documentNumber, vehiclePlate, vehicleType });
      setFullName('');
      setPhone('');
      setDocumentNumber('');
      setVehiclePlate('');
      setVehicleType('');
    } catch (createError) {
      setError(getDriverErrorMessage(createError));
    } finally {
      setCreating(false);
    }
  };

  const handleGenerateAccessCode = async (driverId: Id<'drivers'>) => {
    setGeneratingDriverId(driverId);
    setGeneratedCode(undefined);
    setError(undefined);

    try {
      const accessCode = await createAccessCode({ driverId });
      setGeneratedCode(accessCode.code);
    } catch (createError) {
      setError(getDriverErrorMessage(createError));
    } finally {
      setGeneratingDriverId(null);
    }
  };

  return (
    <AppScreen title="Conductores" subtitle="Conductores activos de tu empresa y accesos para activar sus cuentas.">
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {generatedCode ? (
        <AppCard style={styles.generatedCard}>
          <Text style={styles.generatedLabel}>Código generado</Text>
          <Text style={styles.generatedCode}>{generatedCode}</Text>
        </AppCard>
      ) : null}
      <AppCard>
        <View style={styles.form}>
          <AppInput label="Nombre completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <AppInput label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppInput label="Documento" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="number-pad" />
          <AppInput label="Placa" value={vehiclePlate} onChangeText={setVehiclePlate} autoCapitalize="characters" />
          <AppInput label="Tipo de vehículo" value={vehicleType} onChangeText={setVehicleType} autoCapitalize="words" />
          <AppButton title="Crear conductor" onPress={handleCreateDriver} loading={creating} />
        </View>
      </AppCard>
      {drivers === undefined ? <AppLoading message="Cargando conductores" /> : null}
      {drivers && drivers.length === 0 ? (
        <AppEmptyState title="Sin conductores" message="Crea el primer conductor para poder ofertar viajes." />
      ) : null}
      <View style={styles.list}>
        {drivers?.map((driver) => (
          <DriverCard
            key={driver._id}
            driver={driver}
            onGenerateAccessCode={handleGenerateAccessCode}
            generating={generatingDriverId === driver._id}
          />
        ))}
      </View>
    </AppScreen>
  );
}

function getDriverErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message) {
    return message;
  }

  return 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
  generatedCard: {
    backgroundColor: colors.successSoft,
  },
  generatedLabel: {
    ...typography.small,
    color: colors.success,
    fontWeight: '700',
  },
  generatedCode: {
    ...typography.sectionTitle,
    color: colors.text,
    marginTop: spacing.xs,
  },
});
