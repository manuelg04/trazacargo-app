import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { StatusBadge } from '@/src/components/StatusBadge';
import { colors, fontFamily, fontSize, size, spacing } from '@/constants/theme';

type DriverCardDriver = {
  _id: Id<'drivers'>;
  fullName: string;
  phone: string;
  documentNumber: string;
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
    input: {
      fullName: string;
      phone: string;
      documentNumber: string;
    },
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
  const [error, setError] = useState<string | undefined>();
  const initials = driver.fullName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const canGenerateAccessCode = onGenerateAccessCode && driver.status === 'ACTIVE';

  const handleCancel = () => {
    setEditing(false);
    setFullName(driver.fullName);
    setPhone(driver.phone);
    setDocumentNumber(driver.documentNumber);
    setError(undefined);
  };

  const handleSave = async () => {
    if (!onUpdateDriver) {
      return;
    }

    if (!fullName.trim() || !phone.trim() || !documentNumber.trim()) {
      setError('Completa nombre, teléfono y documento.');
      return;
    }

    setError(undefined);
    await onUpdateDriver(driver._id, {
      fullName,
      phone,
      documentNumber,
    });
    setEditing(false);
  };

  return (
    <AppCard>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{driver.fullName}</Text>
          <Text style={styles.meta}>📱 {driver.phone}</Text>
          <Text style={styles.meta}>🪪 {driver.documentNumber}</Text>
          {driver.vehicle ? (
            <Text style={styles.meta}>🚛 {driver.vehicle.plate} · {driver.vehicle.vehicleType}</Text>
          ) : (
            <Text style={styles.meta}>Sin vehículo registrado</Text>
          )}
        </View>
        <StatusBadge status={driver.status} />
      </View>
      {editing ? (
        <View style={styles.editForm}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <AppInput label="Nombre completo" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
          <AppInput label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <AppInput label="Documento" value={documentNumber} onChangeText={setDocumentNumber} keyboardType="number-pad" />
          <AppButton label="Guardar cambios" onPress={handleSave} loading={updating} fullWidth />
          <AppButton label="Descartar" variant="secondary" onPress={handleCancel} disabled={updating} fullWidth />
        </View>
      ) : null}
      {!editing && onUpdateDriver ? (
        <AppButton
          label="Editar datos"
          variant="secondary"
          onPress={() => setEditing(true)}
          fullWidth
          style={styles.action}
        />
      ) : null}
      {!editing && onUpdateStatus ? (
        <AppButton
          label={driver.status === 'ACTIVE' ? 'Desactivar conductor' : 'Reactivar conductor'}
          variant={driver.status === 'ACTIVE' ? 'danger' : 'success'}
          onPress={() => onUpdateStatus(driver._id, driver.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE')}
          loading={updatingStatus}
          fullWidth
          style={styles.compactAction}
        />
      ) : null}
      {canGenerateAccessCode ? (
        <AppButton
          label="Generar código de acceso"
          variant="secondary"
          onPress={() => onGenerateAccessCode(driver._id)}
          loading={generating}
          fullWidth
          style={styles.action}
        />
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.brand50,
    borderRadius: size.avatar / 2,
    height: size.avatar,
    justifyContent: 'center',
    width: size.avatar,
  },
  avatarText: {
    color: colors.brand600,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  textBlock: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  action: {
    marginTop: spacing[4],
  },
  compactAction: {
    marginTop: spacing[3],
  },
  editForm: {
    gap: spacing[3],
    marginTop: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
