import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppInput } from '@/src/components/AppInput';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { DriverCard } from '@/src/features/dispatcher/DriverCard';

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
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Conductores</Text>
      </SafeAreaView>
      <AppScreen>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {generatedCode ? (
          <AppCard style={styles.generatedCard}>
            <Text style={styles.generatedLabel}>Código generado</Text>
            <Text style={styles.generatedCode}>{generatedCode}</Text>
            <Text style={styles.generatedHint}>Comparte este código con el conductor. Es de un solo uso.</Text>
          </AppCard>
        ) : null}
        <AppCard>
          <Text style={styles.formTitle}>Nuevo conductor</Text>
          <View style={styles.form}>
            <AppInput label="Nombre completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
            <AppInput label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <AppInput label="Documento" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="number-pad" />
            <AppInput label="Placa" value={vehiclePlate} onChangeText={setVehiclePlate} autoCapitalize="characters" />
            <AppInput label="Tipo de vehículo" value={vehicleType} onChangeText={setVehicleType} autoCapitalize="words" />
            <AppButton label="Crear conductor" variant="primary" size="lg" fullWidth onPress={handleCreateDriver} loading={creating} />
          </View>
        </AppCard>
        {drivers === undefined ? <AppLoading message="Cargando conductores" /> : null}
        {drivers && drivers.length === 0 ? (
          <AppEmptyState icon="👥" title="Sin conductores" message="Aún no hay conductores registrados." />
        ) : null}
        {drivers && drivers.length > 0 ? (
          <FlatList
            data={drivers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DriverCard
                driver={item}
                onGenerateAccessCode={handleGenerateAccessCode}
                generating={generatingDriverId === item._id}
              />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : null}
      </AppScreen>
    </View>
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
  generatedCard: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBd,
  },
  generatedLabel: {
    color: colors.success,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  generatedCode: {
    color: colors.brand500,
    fontFamily: fontFamily.bold,
    fontSize: 22,
    letterSpacing: 4,
    marginTop: 6,
  },
  generatedHint: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.xs,
    marginTop: 6,
  },
  formTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    marginBottom: spacing[3],
  },
  form: {
    gap: spacing[3],
  },
  separator: {
    height: spacing[3],
  },
});
