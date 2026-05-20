import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '@/convex/_generated/api';
import { fontFamily } from '@/constants/theme';
import { AppLoading } from '@/src/components/AppLoading';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';

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
  neutral50: '#F8FAFC',
  white: '#FFFFFF',
  blue: '#2563EB',
  blueBg: '#EFF6FF',
  amber: '#D97706',
  amberBg: '#FFFBEB',
  red: '#DC2626',
  redBg: '#FEF2F2',
  emerald: '#16A34A',
  emeraldBg: '#DCFCE7',
};

export default function DispatcherDashboardScreen() {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();
  const stats = useQuery(api.trips.getDashboardStatsForCurrentCompany, {});
  const companyName = currentProfile?.company?.name ?? 'Empresa';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.companyName}>{companyName}</Text>
        <Text style={styles.companySub}>Consola operativa</Text>
      </SafeAreaView>

      {stats === undefined ? (
        <AppLoading message="Cargando dashboard" />
      ) : stats ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}>
          <SectionLabel>Resumen de viajes</SectionLabel>
          <StatsCard
            metrics={[
              { value: stats.totalTrips, label: 'Total' },
              { value: stats.offeredTrips, label: 'Ofertados' },
              { value: stats.acceptedTrips, label: 'Aceptados' },
              { value: stats.inTransitTrips, label: 'En ruta' },
              { value: stats.closedTrips, label: 'Cerrados' },
            ]}
          />

          <SectionLabel>Pendientes de atención</SectionLabel>
          <PendientesCard
            rows={[
              {
                label: 'Ofertas pendientes',
                value: stats.pendingOffers,
                activeDot: palette.blue,
                activeBadgeBg: palette.blueBg,
                activeBadgeText: palette.blue,
              },
              {
                label: 'Docs pendientes',
                value: stats.tripsWithPendingDocuments,
                activeDot: palette.amber,
                activeBadgeBg: palette.amberBg,
                activeBadgeText: palette.amber,
              },
              {
                label: 'Docs rechazados',
                value: stats.tripsWithRejectedDocuments,
                activeDot: palette.red,
                activeBadgeBg: palette.redBg,
                activeBadgeText: palette.red,
              },
              {
                label: 'Listos para cerrar',
                value: stats.tripsReadyToClose,
                activeDot: palette.emerald,
                activeBadgeBg: palette.emeraldBg,
                activeBadgeText: palette.emerald,
              },
            ]}
          />

          <SectionLabel>Equipo activo</SectionLabel>
          <EquipoCard
            count={stats.activeDrivers}
            onPress={() => router.push('/(dispatcher)/drivers')}
          />

          <SectionLabel>Accesos rápidos</SectionLabel>
          <AccesosGrid
            tiles={[
              {
                icon: (
                  <MaterialCommunityIcons name="truck-outline" size={22} color={palette.green800} />
                ),
                label: 'Ver viajes',
                onPress: () => router.push('/(dispatcher)/trips'),
              },
              {
                icon: <Ionicons name="person-add-outline" size={22} color={palette.green800} />,
                label: 'Conductores',
                onPress: () => router.push('/(dispatcher)/drivers'),
              },
              {
                icon: <Ionicons name="settings-outline" size={22} color={palette.green800} />,
                label: 'Configuración',
                onPress: () => router.push('/(dispatcher)/settings'),
              },
            ]}
          />
        </ScrollView>
      ) : null}

      <Pressable
        onPress={() => router.push('/(dispatcher)/create-trip')}
        accessibilityRole="button"
        style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}>
        <Ionicons name="add" size={18} color={palette.white} />
        <Text style={styles.fabLabel}>Crear viaje</Text>
      </Pressable>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

type Metric = { value: number; label: string };

function StatsCard({ metrics }: { metrics: Metric[] }) {
  return (
    <View style={styles.statsCard}>
      {metrics.map((m, i) => (
        <View key={m.label} style={styles.statCol}>
          {i > 0 ? <View style={styles.statDivider} /> : null}
          <View style={styles.statInner}>
            <Text style={styles.statNumber}>{m.value}</Text>
            <Text style={styles.statLabel}>{m.label}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

type PendienteRow = {
  label: string;
  value: number;
  activeDot: string;
  activeBadgeBg: string;
  activeBadgeText: string;
};

function PendientesCard({ rows }: { rows: PendienteRow[] }) {
  return (
    <View style={styles.pendientesCard}>
      {rows.map((row, idx) => {
        const isZero = row.value === 0;
        const dotColor = isZero ? palette.neutral300 : row.activeDot;
        const badgeBg = isZero ? palette.neutral100 : row.activeBadgeBg;
        const badgeText = isZero ? palette.neutral400 : row.activeBadgeText;
        return (
          <View
            key={row.label}
            style={[
              styles.pendienteRow,
              idx < rows.length - 1 ? styles.pendienteRowBorder : null,
              isZero ? styles.pendienteRowDimmed : null,
            ]}>
            <View style={styles.pendienteLeft}>
              <View style={[styles.dot, { backgroundColor: dotColor }]} />
              <Text style={styles.pendienteText}>{row.label}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeText }]}>{row.value}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function EquipoCard({ count, onPress }: { count: number; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.equipoCard, pressed ? styles.cardPressed : null]}>
      <View style={styles.equipoLeft}>
        <View style={styles.liveDotRing}>
          <View style={styles.liveDot} />
        </View>
        <Text style={styles.equipoLabel}>Conductores activos</Text>
      </View>
      <View style={styles.equipoRight}>
        <Text style={styles.equipoNumber}>{count}</Text>
        <Ionicons name="chevron-forward" size={16} color={palette.neutral300} />
      </View>
    </Pressable>
  );
}

type Tile = { icon: React.ReactNode; label: string; onPress: () => void };

function AccesosGrid({ tiles }: { tiles: Tile[] }) {
  return (
    <View style={styles.accesosGrid}>
      {tiles.map((t) => (
        <Pressable
          key={t.label}
          onPress={t.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.tile, pressed ? styles.cardPressed : null]}>
          <View style={styles.tileIconWrap}>{t.icon}</View>
          <Text style={styles.tileLabel}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.neutral100,
  },
  header: {
    backgroundColor: palette.white,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.neutral200,
  },
  companyName: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: palette.neutral900,
    letterSpacing: -0.3,
  },
  companySub: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: palette.neutral400,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 14,
  },
  sectionLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    color: palette.neutral400,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: -4,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
  },
  statCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  statDivider: {
    position: 'absolute',
    left: 0,
    width: 1,
    height: 30,
    backgroundColor: palette.neutral200,
  },
  statInner: {
    alignItems: 'center',
    gap: 5,
  },
  statNumber: {
    fontFamily: fontFamily.extrabold,
    fontSize: 26,
    color: palette.neutral900,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 8.5,
    color: palette.neutral400,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  pendientesCard: {
    backgroundColor: palette.white,
    borderRadius: 18,
    overflow: 'hidden',
  },
  pendienteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  pendienteRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: palette.neutral100,
  },
  pendienteRowDimmed: {
    opacity: 0.38,
  },
  pendienteLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  pendienteText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: palette.neutral700,
  },
  badge: {
    minWidth: 28,
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 12,
  },
  equipoCard: {
    backgroundColor: palette.white,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  liveDotRing: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.emeraldBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.emerald,
  },
  equipoLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: palette.neutral700,
  },
  equipoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  equipoNumber: {
    fontFamily: fontFamily.extrabold,
    fontSize: 22,
    color: palette.neutral900,
    letterSpacing: -0.4,
  },
  accesosGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: 18,
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 9,
  },
  tileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: palette.green100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: palette.green800,
    textAlign: 'center',
    lineHeight: 14,
  },
  cardPressed: {
    opacity: 0.85,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    height: 52,
    paddingLeft: 16,
    paddingRight: 20,
    borderRadius: 26,
    backgroundColor: palette.green800,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  fabLabel: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: palette.white,
    letterSpacing: -0.2,
  },
});
