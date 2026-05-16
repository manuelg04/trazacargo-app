import { Alert, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { TripCard } from '@/src/features/trips/TripCard';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

export default function OffersScreen() {
  const router = useRouter();
  const acceptOffer = useMutation(api.trips.acceptOfferForCurrentDriver);
  const [acceptingTripId, setAcceptingTripId] = useState<Id<'trips'> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
          <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
            Ofertas
          </Text>
          <Text style={{ color: colors.textInverse, opacity: 0.75, fontFamily: fontFamily.regular, fontSize: fontSize.sm }}>
            Viajes disponibles para ti
          </Text>
        </View>
      </SafeAreaView>

      {offers === undefined ? (
        <AppScreen scroll={false}>
          <AppLoading message="Cargando ofertas" />
        </AppScreen>
      ) : offers.length === 0 ? (
        <AppScreen scroll={false}>
          <AppEmptyState
            icon="🏷️"
            title="Sin ofertas disponibles"
            message="Aún no tienes ofertas disponibles. La empresa te enviará viajes pronto."
          />
        </AppScreen>
      ) : (
        <FlatList
          data={offers}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.brand500}
              colors={[colors.brand500]}
            />
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onView={openDetail}
              onAccept={handleAccept}
              accepting={acceptingTripId === item._id}
            />
          )}
        />
      )}
    </View>
  );
}
