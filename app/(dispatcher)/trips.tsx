import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { tripStatusLabels, TripStatus } from '@/src/constants/tripStatuses';
import { DispatcherTripCard } from '@/src/features/dispatcher/DispatcherTripCard';
import { spacing } from '@/src/theme/spacing';

const statusFilters: (TripStatus | null)[] = [null, 'DRAFT', 'OFFERED', 'ACCEPTED', 'IN_TRANSIT', 'CLOSED', 'CANCELLED'];

export default function DispatcherTripsScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<TripStatus | null>(null);
  const trips = useQuery(api.trips.listForCurrentCompany, status ? { status } : {});

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(dispatcher)/trip/[tripId]', params: { tripId } });
  };

  return (
    <AppScreen title="Viajes" subtitle="Viajes creados para tu empresa.">
      <View style={styles.actions}>
        <AppButton title="Crear viaje" onPress={() => router.push('/(dispatcher)/create-trip')} />
      </View>
      <View style={styles.filters}>
        {statusFilters.map((filter) => (
          <AppButton
            key={filter ?? 'ALL'}
            title={filter ? tripStatusLabels[filter] : 'Todos'}
            variant={status === filter ? 'primary' : 'secondary'}
            onPress={() => setStatus(filter)}
            style={styles.filterButton}
          />
        ))}
      </View>
      {trips === undefined ? <AppLoading message="Cargando viajes" /> : null}
      {trips && trips.length === 0 ? (
        <AppEmptyState title="Sin viajes" message="Crea un viaje para ofertarlo a tus conductores." />
      ) : null}
      <View style={styles.list}>
        {trips?.map((trip) => (
          <DispatcherTripCard key={trip._id} trip={trip} onView={openDetail} />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.md,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterButton: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
});
