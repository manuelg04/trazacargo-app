import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors, fontFamily, fontSize, spacing, tripStateLabels } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { TripStatus } from '@/src/constants/tripStatuses';
import { DispatcherTripCard } from '@/src/features/dispatcher/DispatcherTripCard';

const statusFilters: (TripStatus | null)[] = [null, 'DRAFT', 'OFFERED', 'ACCEPTED', 'IN_TRANSIT', 'CLOSED', 'CANCELLED'];
type DispatcherDocumentState = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'REJECTED' | 'READY_TO_CLOSE' | 'COMPLETE';

const documentStateFilters: { value: DispatcherDocumentState; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'READY_TO_CLOSE', label: 'Listos para cerrar' },
  { value: 'COMPLETE', label: 'Completos' },
];

export default function DispatcherTripsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<TripStatus | null>(null);
  const [documentState, setDocumentState] = useState<DispatcherDocumentState>('ALL');
  const trips = useQuery(api.trips.listForCurrentCompany, status ? { status, documentState } : { documentState });

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(dispatcher)/trip/[tripId]', params: { tripId } });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <Text style={styles.headerTitle}>Viajes</Text>
        <AppButton
          label="+ Crear viaje"
          size="sm"
          variant="primary"
          onPress={() => router.push('/(dispatcher)/create-trip')}
        />
      </SafeAreaView>
      <AppScreen>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Estado del viaje</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}>
            {statusFilters.map((filter) => {
              const isActive = status === filter;
              const label = filter ? (tripStateLabels[filter] ?? filter) : 'Todos';
              return (
                <TouchableOpacity
                  key={filter ?? 'ALL'}
                  onPress={() => setStatus(filter)}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : styles.filterChipInactive,
                  ]}>
                  <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Estado documental</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContent}>
            {documentStateFilters.map((filter) => {
              const isActive = documentState === filter.value;
              return (
                <TouchableOpacity
                  key={filter.value}
                  onPress={() => setDocumentState(filter.value)}
                  style={[
                    styles.filterChip,
                    isActive ? styles.filterChipActive : styles.filterChipInactive,
                  ]}>
                  <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
        {trips === undefined ? <AppLoading message="Cargando viajes" /> : null}
        {trips && trips.length === 0 ? (
          <AppEmptyState
            icon="🗺️"
            title="Sin viajes"
            message="No hay viajes creados."
            actionLabel="Crear viaje"
            onAction={() => router.push('/(dispatcher)/create-trip')}
          />
        ) : null}
        {trips && trips.length > 0 ? (
          <FlatList
            data={trips}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <DispatcherTripCard trip={item} onView={openDetail} />
            )}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: colors.brand500,
    borderColor: colors.brand500,
  },
  filterChipInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
  },
  filterChipText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  filterChipTextActive: {
    color: colors.textInverse,
  },
  filterChipTextInactive: {
    color: colors.textSecondary,
  },
  separator: {
    height: spacing[3],
  },
});
