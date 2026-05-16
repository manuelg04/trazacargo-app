import { FlatList, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppEmptyState } from '@/src/components/AppEmptyState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { TripCard } from '@/src/features/trips/TripCard';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';

export default function TripsScreen() {
  const router = useRouter();
  const trips = useQuery(api.trips.listMineForCurrentDriver, {});

  const openDetail = (tripId: Id<'trips'>) => {
    router.push({ pathname: '/(driver)/trip/[tripId]', params: { tripId } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
          <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
            Mis viajes
          </Text>
          <Text style={{ color: colors.textInverse, opacity: 0.75, fontFamily: fontFamily.regular, fontSize: fontSize.sm }}>
            Viajes aceptados o asignados a ti
          </Text>
        </View>
      </SafeAreaView>

      {trips === undefined ? (
        <AppScreen scroll={false}>
          <AppLoading message="Cargando viajes" />
        </AppScreen>
      ) : trips.length === 0 ? (
        <AppScreen scroll={false}>
          <AppEmptyState
            icon="🚛"
            title="Sin viajes activos"
            message="No tienes viajes activos. Acepta una oferta para comenzar."
          />
        </AppScreen>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TripCard trip={item} onView={openDetail} />
          )}
        />
      )}
    </View>
  );
}
