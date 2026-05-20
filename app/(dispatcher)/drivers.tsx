import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fontFamily } from '@/constants/theme';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppInput } from '@/src/components/AppInput';
import { AppLoading } from '@/src/components/AppLoading';
import { AppSelect } from '@/src/components/AppSelect';
import { DriverCard } from '@/src/features/dispatcher/DriverCard';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
  emerald: '#16A34A',
  emeraldBg: '#DCFCE7',
  red: '#DC2626',
  redBg: '#FEF2F2',
  error: '#C23030',
  errorBg: '#FEF0F0',
  errorBd: '#E0A0A0',
  successBg: '#DCFCE7',
  successBd: '#9ACDB0',
  success: '#16A34A',
};

const VEHICLE_TYPES = ['Tractomula', 'Camión', 'Furgón', 'Camioneta', 'Otro'];

export default function DispatcherDriversScreen() {
  const drivers = useQuery(api.drivers.listForCurrentCompany, {});
  const createDriver = useMutation(api.drivers.createForCurrentCompany);
  const updateDriver = useMutation(api.drivers.updateDriverForCurrentCompany);
  const updateDriverStatus = useMutation(api.drivers.updateStatusForCurrentCompany);
  const createAccessCode = useMutation(api.accessCodes.createDriverAccessCode);

  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [creating, setCreating] = useState(false);
  const [generatingDriverId, setGeneratingDriverId] = useState<Id<'drivers'> | null>(null);
  const [updatingDriverId, setUpdatingDriverId] = useState<Id<'drivers'> | null>(null);
  const [updatingStatusDriverId, setUpdatingStatusDriverId] = useState<Id<'drivers'> | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const activeCount = drivers?.filter((d) => d.status === 'ACTIVE').length ?? 0;

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setDocumentNumber('');
    setVehiclePlate('');
    setVehicleType('');
  };

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
      resetForm();
      setShowForm(false);
    } catch (createError) {
      setError(getActionErrorMessage(createError));
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
      setError(getActionErrorMessage(createError));
    } finally {
      setGeneratingDriverId(null);
    }
  };

  const handleUpdateDriver = async (
    driverId: Id<'drivers'>,
    input: { fullName: string; phone: string; documentNumber: string },
  ) => {
    setUpdatingDriverId(driverId);
    setError(undefined);

    try {
      await updateDriver({ driverId, ...input });
    } catch (updateError) {
      setError(getActionErrorMessage(updateError));
    } finally {
      setUpdatingDriverId(null);
    }
  };

  const handleUpdateStatus = async (driverId: Id<'drivers'>, status: 'ACTIVE' | 'DISABLED') => {
    setUpdatingStatusDriverId(driverId);
    setError(undefined);

    try {
      await updateDriverStatus({ driverId, status });
    } catch (updateError) {
      setError(getActionErrorMessage(updateError));
    } finally {
      setUpdatingStatusDriverId(null);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {showForm ? (
            <View style={styles.formHeader}>
              <Pressable
                onPress={() => {
                  setShowForm(false);
                  setError(undefined);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.backBtn, pressed ? styles.pressed : null]}>
                <Ionicons name="chevron-back" size={20} color={palette.neutral700} />
              </Pressable>
              <View style={styles.formHeaderText}>
                <Text style={styles.formTitle}>Nuevo conductor</Text>
                <Text style={styles.formSubtitle}>Registra un conductor en tu flota</Text>
              </View>
            </View>
          ) : (
            <View style={styles.listHeader}>
              <View style={styles.listHeaderText}>
                <Text style={styles.pageTitle}>Conductores</Text>
                <Text style={styles.pageSubtitle}>
                  {drivers ? `${activeCount} activos` : 'Cargando…'}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  setShowForm(true);
                  setError(undefined);
                  setGeneratedCode(undefined);
                }}
                accessibilityRole="button"
                style={({ pressed }) => [styles.newBtn, pressed ? styles.newBtnPressed : null]}>
                <Ionicons name="add" size={14} color={palette.white} />
                <Text style={styles.newBtnText}>Nuevo</Text>
              </Pressable>
            </View>
          )}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {generatedCode ? (
            <View style={styles.generatedCard}>
              <Text style={styles.generatedLabel}>Código generado</Text>
              <Text style={styles.generatedCode}>{generatedCode}</Text>
              <Text style={styles.generatedHint}>
                Comparte este código con el conductor. Es de un solo uso.
              </Text>
            </View>
          ) : null}

          {showForm ? (
            <View style={styles.formCard}>
              <Text style={styles.sectionLabel}>Datos personales</Text>
              <AppInput
                label="Nombre completo *"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <View style={styles.row}>
                <View style={styles.col}>
                  <AppInput
                    label="Teléfono *"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>
                <View style={styles.col}>
                  <AppInput
                    label="Documento *"
                    value={documentNumber}
                    onChangeText={setDocumentNumber}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Vehículo</Text>
                <Text style={styles.sectionLabelHint}>(opcional)</Text>
              </View>
              <View style={styles.row}>
                <View style={styles.col}>
                  <AppInput
                    label="Placa"
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.col}>
                  <AppSelect
                    label="Tipo de vehículo"
                    value={vehicleType}
                    options={VEHICLE_TYPES}
                    onChange={setVehicleType}
                  />
                </View>
              </View>

              <Pressable
                onPress={handleCreateDriver}
                disabled={creating}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && !creating ? styles.submitPressed : null,
                  creating ? styles.submitDisabled : null,
                ]}>
                <Ionicons name="add" size={18} color={palette.white} />
                <Text style={styles.submitText}>
                  {creating ? 'Creando…' : 'Crear conductor'}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {drivers === undefined ? <AppLoading message="Cargando conductores" /> : null}
          {drivers && drivers.length === 0 ? (
            <AppEmptyState icon="👥" title="Sin conductores" message="Aún no hay conductores registrados." />
          ) : null}
          {drivers && drivers.length > 0 ? (
            <View>
              {showForm ? <Text style={[styles.sectionLabel, styles.fleetLabel]}>Tu flota</Text> : null}
              <FlatList
                data={drivers}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                  <DriverCard
                    driver={item}
                    onGenerateAccessCode={handleGenerateAccessCode}
                    onUpdateDriver={handleUpdateDriver}
                    onUpdateStatus={handleUpdateStatus}
                    generating={generatingDriverId === item._id}
                    updating={updatingDriverId === item._id}
                    updatingStatus={updatingStatusDriverId === item._id}
                  />
                )}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.neutral100,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 6,
  },
  listHeaderText: {
    flex: 1,
  },
  pageTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    color: palette.neutral900,
    letterSpacing: -1,
  },
  pageSubtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: palette.neutral400,
    marginTop: 4,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.green800,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  newBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  newBtnText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: palette.white,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 6,
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
  },
  pressed: {
    opacity: 0.85,
  },
  formHeaderText: {
    flex: 1,
  },
  formTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: palette.neutral900,
    letterSpacing: -0.7,
  },
  formSubtitle: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: palette.neutral400,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 20,
    gap: 14,
  },
  sectionLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    color: palette.neutral400,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionLabelHint: {
    fontFamily: fontFamily.medium,
    fontSize: 10,
    color: palette.neutral300,
  },
  fleetLabel: {
    marginBottom: 10,
    paddingHorizontal: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: palette.neutral100,
    marginHorizontal: -4,
    marginVertical: 2,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.green800,
    borderRadius: 16,
    height: 54,
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
  submitText: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: palette.white,
    letterSpacing: -0.2,
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
  generatedCard: {
    backgroundColor: palette.successBg,
    borderColor: palette.successBd,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  generatedLabel: {
    color: palette.success,
    fontFamily: fontFamily.extrabold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  generatedCode: {
    color: palette.green800,
    fontFamily: fontFamily.extrabold,
    fontSize: 24,
    letterSpacing: 4,
    marginTop: 6,
  },
  generatedHint: {
    color: palette.neutral500,
    fontFamily: fontFamily.medium,
    fontSize: 12,
    marginTop: 6,
  },
  separator: {
    height: 12,
  },
});
