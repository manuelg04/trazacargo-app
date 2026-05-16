import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { AppButton } from '@/src/components/AppButton';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { DispatcherStatCard } from '@/src/features/dispatcher/DispatcherStatCard';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { spacing } from '@/src/theme/spacing';

export default function DispatcherDashboardScreen() {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();
  const stats = useQuery(api.trips.getDashboardStatsForCurrentCompany, {});
  const companyName = currentProfile?.company?.name ?? 'Empresa';

  return (
    <AppScreen title={companyName} subtitle="Consola operativa para viajes, conductores y accesos.">
      {stats === undefined ? <AppLoading message="Cargando dashboard" /> : null}
      {stats ? (
        <View style={styles.statsGrid}>
          <DispatcherStatCard label="Viajes totales" value={stats.totalTrips} />
          <DispatcherStatCard label="Ofertados" value={stats.offeredTrips} />
          <DispatcherStatCard label="Aceptados" value={stats.acceptedTrips} />
          <DispatcherStatCard label="En ruta" value={stats.inTransitTrips} />
          <DispatcherStatCard label="Cerrados" value={stats.closedTrips} />
          <DispatcherStatCard label="Conductores activos" value={stats.activeDrivers} />
          <DispatcherStatCard label="Ofertas pendientes" value={stats.pendingOffers} />
        </View>
      ) : null}
      <View style={styles.actions}>
        <AppButton title="Crear viaje" onPress={() => router.push('/(dispatcher)/create-trip')} />
        <AppButton title="Ver viajes" variant="secondary" onPress={() => router.push('/(dispatcher)/trips')} />
        <AppButton title="Ver conductores" variant="secondary" onPress={() => router.push('/(dispatcher)/drivers')} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actions: {
    gap: spacing.md,
  },
});
