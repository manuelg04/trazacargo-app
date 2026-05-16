import { Alert, StyleSheet, View } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { TripCard } from '@/src/features/trips/TripCard';
import { spacing } from '@/src/theme/spacing';

export default function OffersScreen() {
  const router = useRouter();
  const acceptOffer = useMutation(api.trips.acceptOfferForCurrentDriver);
  const [acceptingTripId, setAcceptingTripId] = useState<Id<'trips'> | null>(null);
  const offers = useQuery(api.trips.listAvailableForCurrentDriver, {});

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(driver)/trip/[tripId]', params: { tripId } });
  };

  const handleAccept = async (tripId: Id<'trips'>) => {
    setAcceptingTripId(tripId);

    try {
      await acceptOffer({ tripId });
      router.push({ pathname: '/(driver)/trip/[tripId]', params: { tripId } });
    } catch {
      Alert.alert('No se pudo aceptar', 'La oferta ya no está disponible o hubo un problema de conexión.');
    } finally {
      setAcceptingTripId(null);
    }
  };

  return (
    <AppScreen title="Ofertas disponibles" subtitle="Viajes que la empresa te ofreció para tomar.">
      {offers === undefined ? <AppLoading message="Cargando ofertas" /> : null}
      {offers && offers.length === 0 ? (
        <AppEmptyState title="No tienes ofertas" message="Cuando una empresa te ofrezca un viaje, aparecerá aquí." />
      ) : null}
      <View style={styles.list}>
        {offers?.map((trip) => (
          <TripCard
            key={trip._id}
            trip={trip}
            onView={openDetail}
            onAccept={handleAccept}
            accepting={acceptingTripId === trip._id}
          />
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
