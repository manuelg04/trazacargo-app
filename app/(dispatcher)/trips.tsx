import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { fontFamily } from '@/constants/theme';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { TripStatus } from '@/src/constants/tripStatuses';
import { DispatcherTripCard } from '@/src/features/dispatcher/DispatcherTripCard';

const palette = {
  green800: '#1A5C38',
  neutral900: '#0F172A',
  neutral700: '#334155',
  neutral600: '#475569',
  neutral400: '#94A3B8',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
};

type StatusFilter = TripStatus | 'ALL' | 'IN_TRANSIT_GROUP';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'OFFERED', label: 'Ofertado' },
  { value: 'ACCEPTED', label: 'Aceptado' },
  { value: 'IN_TRANSIT_GROUP', label: 'En tránsito' },
  { value: 'CLOSED', label: 'Cerrado' },
];

type DispatcherDocumentState = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'REJECTED';

const documentStateFilters: { value: DispatcherDocumentState; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'REJECTED', label: 'Rechazados' },
];

const IN_TRANSIT_STATUSES = new Set([
  'IN_LOADING',
  'LOADED',
  'IN_TRANSIT',
  'IN_UNLOADING',
  'UNLOADED',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_SUBMITTED',
  'DOCUMENTS_APPROVED',
]);

const ACTIVE_STATUSES = new Set([
  'ACCEPTED',
  'IN_LOADING',
  'LOADED',
  'IN_TRANSIT',
  'IN_UNLOADING',
  'UNLOADED',
  'DOCUMENTS_PENDING',
  'DOCUMENTS_SUBMITTED',
  'DOCUMENTS_APPROVED',
]);

export default function DispatcherTripsScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [documentState, setDocumentState] = useState<DispatcherDocumentState>('ALL');

  const queryStatus: TripStatus | undefined =
    statusFilter === 'ALL' || statusFilter === 'IN_TRANSIT_GROUP'
      ? undefined
      : statusFilter;

  const trips = useQuery(
    api.trips.listForCurrentCompany,
    queryStatus ? { status: queryStatus, documentState } : { documentState },
  );

  const filteredTrips = trips
    ? statusFilter === 'IN_TRANSIT_GROUP'
      ? trips.filter((t) => IN_TRANSIT_STATUSES.has(t.status))
      : trips
    : undefined;

  const subtitle = buildSubtitle(statusFilter, filteredTrips);

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(dispatcher)/trip/[tripId]', params: { tripId } });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Viajes</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(dispatcher)/create-trip')}
            accessibilityRole="button"
            style={({ pressed }) => [styles.createBtn, pressed ? styles.createPressed : null]}>
            <Ionicons name="add" size={12} color={palette.white} />
            <Text style={styles.createText}>Crear viaje</Text>
          </Pressable>
        </View>

        <View style={styles.filtersBlock}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Estado del viaje</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {statusFilters.map((f) => {
                const active = statusFilter === f.value;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setStatusFilter(f.value)}
                    accessibilityRole="button"
                    style={[
                      styles.chip,
                      active ? styles.chipActive : styles.chipInactive,
                    ]}>
                    <Text style={[styles.chipText, active ? styles.chipTextActive : styles.chipTextInactive]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          <View style={styles.filterDivider} />

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Estado documental</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}>
              {documentStateFilters.map((f) => {
                const active = documentState === f.value;
                return (
                  <Pressable
                    key={f.value}
                    onPress={() => setDocumentState(f.value)}
                    accessibilityRole="button"
                    style={[
                      styles.chipSm,
                      active ? styles.chipActive : styles.chipInactive,
                    ]}>
                    <Text style={[styles.chipTextSm, active ? styles.chipTextActive : styles.chipTextInactive]}>
                      {f.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {filteredTrips === undefined ? <AppLoading message="Cargando viajes" /> : null}

          {filteredTrips && filteredTrips.length === 0 ? (
            <AppEmptyState
              icon="🗺️"
              title="Sin viajes"
              message="No hay viajes que coincidan con el filtro."
              actionLabel="Crear viaje"
              onAction={() => router.push('/(dispatcher)/create-trip')}
            />
          ) : null}

          {filteredTrips && filteredTrips.length > 0 ? (
            <FlatList
              data={filteredTrips}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => <DispatcherTripCard trip={item} onView={openDetail} />}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

type TripLite = { status: string };

function buildSubtitle(filter: StatusFilter, trips?: TripLite[]): string {
  if (!trips) return 'Cargando…';
  const total = trips.length;
  if (filter === 'ALL') {
    const active = trips.filter((t) => ACTIVE_STATUSES.has(t.status)).length;
    return `${total} viaje${total !== 1 ? 's' : ''} · ${active} activo${active !== 1 ? 's' : ''}`;
  }
  const label = statusFilters.find((f) => f.value === filter)?.label.toLowerCase() ?? '';
  return `${total} ${label}${total !== 1 ? 's' : ''}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palette.neutral100,
  },
  safe: {
    flex: 1,
  },
  header: {
    backgroundColor: palette.white,
    paddingTop: 8,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.extrabold,
    fontSize: 28,
    color: palette.neutral900,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: palette.neutral400,
    marginTop: 5,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.green800,
    borderRadius: 50,
    paddingHorizontal: 18,
    paddingVertical: 11,
    shadowColor: palette.green800,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    elevation: 6,
  },
  createPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  createText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: palette.white,
  },
  filtersBlock: {
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: palette.neutral100,
  },
  filterGroup: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  filterLabel: {
    fontFamily: fontFamily.extrabold,
    fontSize: 9,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: palette.neutral400,
    marginBottom: 10,
  },
  filterDivider: {
    height: 1,
    backgroundColor: palette.neutral100,
    marginHorizontal: 20,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  chipSm: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 50,
    borderWidth: 1.5,
  },
  chipActive: {
    backgroundColor: palette.green800,
    borderColor: palette.green800,
  },
  chipInactive: {
    backgroundColor: palette.white,
    borderColor: palette.neutral200,
  },
  chipText: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
  },
  chipTextSm: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
  },
  chipTextActive: {
    color: palette.white,
    fontFamily: fontFamily.bold,
  },
  chipTextInactive: {
    color: palette.neutral600,
  },
  scroll: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
});
