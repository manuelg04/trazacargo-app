import { Alert, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { useDevSession } from '@/src/features/devSession/useDevSession';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { useState } from 'react';

export default function SelectDriverScreen() {
  const drivers = useQuery(api.drivers.listDemoDrivers);
  const seedDemoData = useMutation(api.dev.seedDemoData);
  const clearDemoData = useMutation(api.dev.clearDemoData);
  const { selectDriver, clearDriver } = useDevSession();
  const router = useRouter();
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);

    try {
      await seedDemoData({});
    } catch {
      Alert.alert('No se pudo sembrar', 'Revisa que Convex esté corriendo y vuelve a intentar.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    setIsClearing(true);

    try {
      clearDriver();
      await clearDemoData({});
    } catch {
      Alert.alert('No se pudo limpiar', 'Revisa que Convex esté corriendo y vuelve a intentar.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AppScreen
      title="Elegir conductor"
      subtitle="Esta selección es temporal para desarrollo. Más adelante será reemplazada por autenticación real.">
      <View style={styles.actions}>
        <AppButton title="Crear datos demo" onPress={handleSeed} loading={isSeeding} />
        <AppButton title="Borrar datos demo" variant="danger" onPress={handleClear} loading={isClearing} />
      </View>

      {drivers === undefined ? <AppLoading message="Cargando conductores" /> : null}

      {drivers && drivers.length === 0 ? (
        <AppEmptyState
          title="No hay conductores demo"
          message="Crea los datos demo para elegir un conductor y probar el flujo."
        />
      ) : null}

      <View style={styles.list}>
        {drivers?.map((driver) => (
          <AppCard key={driver._id}>
            <Text style={styles.driverName}>{driver.fullName}</Text>
            <Text style={styles.driverMeta}>{driver.company.name}</Text>
            <Text style={styles.driverMeta}>CC {driver.documentNumber}</Text>
            <AppButton
              title="Usar este conductor"
              onPress={() => {
                selectDriver({ id: driver._id, fullName: driver.fullName });
                router.replace('/(driver)/offers');
              }}
              style={styles.driverAction}
            />
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  driverName: {
    ...typography.cardTitle,
    color: colors.text,
  },
  driverMeta: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  driverAction: {
    marginTop: spacing.lg,
  },
});
