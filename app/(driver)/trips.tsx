import { StyleSheet, View } from 'react-native';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { TripCard } from '@/src/features/trips/TripCard';
import { spacing } from '@/src/theme/spacing';

export default function TripsScreen() {
  const router = useRouter();
  const trips = useQuery(api.trips.listMineForCurrentDriver, {});

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(driver)/trip/[tripId]', params: { tripId } });
  };

  return (
    <AppScreen title="Mis viajes" subtitle="Viajes aceptados o asignados a tu conductor.">
      {trips === undefined ? <AppLoading message="Cargando viajes" /> : null}
      {trips && trips.length === 0 ? (
        <AppEmptyState title="No tienes viajes" message="Acepta una oferta para verla en esta sección." />
      ) : null}
      <View style={styles.list}>
        {trips?.map((trip) => (
          <TripCard key={trip._id} trip={trip} onView={openDetail} />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
  },
});
