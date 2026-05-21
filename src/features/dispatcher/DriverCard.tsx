import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import { fontFamily } from '@/constants/theme';

const palette = {
  green800: '#1A5C38',
  green100: '#E4F3EB',
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
};

type DriverCardDriver = {
  _id: Id<'drivers'>;
  fullName: string;
  phone: string;
  documentNumber: string;
  vehicleType?: string;
  status: string;
  vehicle: {
    plate: string;
    vehicleType: string;
  } | null;
};

type DriverCardProps = {
  driver: DriverCardDriver;
  onGenerateAccessCode?: (driverId: Id<'drivers'>) => void;
  onUpdateDriver?: (
    driverId: Id<'drivers'>,
    input: { fullName: string; phone: string; documentNumber: string; vehicleType: string },
  ) => Promise<void>;
  onUpdateStatus?: (driverId: Id<'drivers'>, status: 'ACTIVE' | 'DISABLED') => Promise<void>;
  generating?: boolean;
  updating?: boolean;
  updatingStatus?: boolean;
};

export function DriverCard({
  driver,
  onGenerateAccessCode,
  onUpdateDriver,
  onUpdateStatus,
  generating = false,
  updating = false,
  updatingStatus = false,
}: DriverCardProps) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(driver.fullName);
  const [phone, setPhone] = useState(driver.phone);
  const [documentNumber, setDocumentNumber] = useState(driver.documentNumber);
  const [vehicleType, setVehicleType] = useState(driver.vehicleType ?? driver.vehicle?.vehicleType ?? '');
  const [error, setError] = useState<string | undefined>();

  const isActive = driver.status === 'ACTIVE';
  const displayedVehicleType = driver.vehicleType ?? driver.vehicle?.vehicleType;
  const displayedVehicle = driver.vehicle?.plate
    ? `${driver.vehicle.plate} · ${displayedVehicleType ?? 'No registrado'}`
    : displayedVehicleType;
  const initials = driver.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const handleCancel = () => {
    setEditing(false);
    setFullName(driver.fullName);
    setPhone(driver.phone);
    setDocumentNumber(driver.documentNumber);
    setVehicleType(driver.vehicleType ?? driver.vehicle?.vehicleType ?? '');
    setError(undefined);
  };

  const handleSave = async () => {
    if (!onUpdateDriver) return;

    if (!fullName.trim() || !phone.trim() || !documentNumber.trim() || !vehicleType.trim()) {
      setError('Completa nombre, teléfono, documento y tipo de vehículo.');
      return;
    }

    setError(undefined);
    await onUpdateDriver(driver._id, { fullName, phone, documentNumber, vehicleType });
    setEditing(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isActive ? palette.green800 : palette.neutral300 },
          ]}>
          <Text style={styles.avatarText}>{initials || '?'}</Text>
        </View>

        <View style={styles.body}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {driver.fullName}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isActive ? palette.emeraldBg : palette.neutral100 },
              ]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? palette.emerald : palette.neutral300 },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isActive ? palette.emerald : palette.neutral400 },
                ]}>
                {isActive ? 'ACTIVO' : 'INACTIVO'}
              </Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Feather name="phone" size={13} color={palette.neutral400} />
            <Text style={styles.metaText} numberOfLines={1}>{driver.phone}</Text>
            <Text style={styles.metaSep}>·</Text>
            <Feather name="credit-card" size={13} color={palette.neutral400} />
            <Text style={styles.metaText} numberOfLines={1}>{driver.documentNumber}</Text>
          </View>

          <View style={styles.metaRow}>
            {displayedVehicle ? (
              <>
                <Feather name="truck" size={13} color={palette.neutral400} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {displayedVehicle}
                </Text>
              </>
            ) : (
              <>
                <Feather name="circle" size={13} color={palette.neutral300} />
                <Text style={styles.metaEmpty}>Tipo no registrado</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {editing ? (
        <View style={styles.editForm}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppInput label="Nombre completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <AppInput label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppInput label="Documento" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="number-pad" />
          <AppInput label="Tipo de vehículo" value={vehicleType} onChangeText={setVehicleType} autoCapitalize="words" />
          <AppButton label="Guardar cambios" onPress={handleSave} loading={updating} fullWidth />
          <AppButton label="Descartar" variant="secondary" onPress={handleCancel} disabled={updating} fullWidth />
        </View>
      ) : null}

      <View style={styles.divider} />

      <View style={styles.actions}>
        <ActionButton
          label="Editar"
          icon={<Feather name="edit-2" size={12} color={palette.neutral700} />}
          background={palette.neutral100}
          color={palette.neutral700}
          onPress={() => (editing ? handleCancel() : setEditing(true))}
          disabled={!onUpdateDriver}
        />
        <ActionButton
          label={isActive ? 'Desactivar' : 'Reactivar'}
          icon={
            <Feather
              name={isActive ? 'x-circle' : 'check-circle'}
              size={12}
              color={isActive ? palette.red : palette.emerald}
            />
          }
          background={isActive ? palette.redBg : palette.emeraldBg}
          color={isActive ? palette.red : palette.emerald}
          onPress={() =>
            onUpdateStatus?.(driver._id, isActive ? 'DISABLED' : 'ACTIVE')
          }
          loading={updatingStatus}
          disabled={!onUpdateStatus}
        />
        <ActionButton
          label="Código"
          icon={<Feather name="key" size={12} color={palette.green800} />}
          background={palette.green100}
          color={palette.green800}
          onPress={() => onGenerateAccessCode?.(driver._id)}
          loading={generating}
          disabled={!onGenerateAccessCode || !isActive}
        />
      </View>
    </View>
  );
}

type ActionButtonProps = {
  label: string;
  icon: React.ReactNode;
  background: string;
  color: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

function ActionButton({ label, icon, background, color, onPress, loading, disabled }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.actionBtn,
        { backgroundColor: background },
        pressed && !disabled ? styles.actionPressed : null,
        disabled ? styles.actionDisabled : null,
      ]}>
      {icon}
      <Text style={[styles.actionText, { color }]}>{loading ? '...' : label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 18,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 13,
    color: palette.white,
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 7,
  },
  name: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: palette.neutral900,
    letterSpacing: -0.2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 7,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 4,
  },
  metaText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: palette.neutral500,
    flexShrink: 1,
  },
  metaEmpty: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: palette.neutral300,
    fontStyle: 'italic',
    flexShrink: 1,
  },
  metaSep: {
    fontSize: 12,
    color: palette.neutral300,
  },
  divider: {
    height: 1,
    backgroundColor: palette.neutral100,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  actionBtn: {
    flex: 1,
    height: 34,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  actionPressed: {
    opacity: 0.85,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  editForm: {
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  errorText: {
    color: palette.error,
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
});
