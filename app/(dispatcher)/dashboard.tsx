import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { DispatcherStatCard } from '@/src/features/dispatcher/DispatcherStatCard';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';

export default function DispatcherDashboardScreen() {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();
  const stats = useQuery(api.trips.getDashboardStatsForCurrentCompany, {});
  const companyName = currentProfile?.company?.name ?? 'Empresa';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>{companyName}</Text>
        <Text style={styles.headerSubtitle}>Consola operativa</Text>
      </SafeAreaView>
      <AppScreen>
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
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        </View>
        <AppButton
          label="+ Crear viaje"
          variant="primary"
          fullWidth
          onPress={() => router.push('/(dispatcher)/create-trip')}
        />
        <AppButton
          label="Ver viajes"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/(dispatcher)/trips')}
        />
        <AppButton
          label="Ver conductores"
          variant="secondary"
          fullWidth
          onPress={() => router.push('/(dispatcher)/drivers')}
        />
      </AppScreen>
    </View>
  );
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
  headerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionHeader: {
    marginTop: spacing[2],
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});
