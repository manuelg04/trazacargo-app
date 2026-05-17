import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

type DriverDocumentState = 'ALL' | 'PENDING' | 'IN_REVIEW' | 'REJECTED' | 'COMPLETE';

const documentStateFilters: { value: DriverDocumentState; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'IN_REVIEW', label: 'En revisión' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'COMPLETE', label: 'Completos' },
];

export default function TripsScreen() {
  const router = useRouter();
  const [documentState, setDocumentState] = useState<DriverDocumentState>('ALL');
  const trips = useQuery(api.trips.listMineForCurrentDriver, { documentState });

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
          <View style={styles.content}>
            <DocumentStateFilters value={documentState} onChange={setDocumentState} />
            <AppEmptyState
              icon="🚛"
              title={documentState === 'ALL' ? 'Sin viajes activos' : 'Sin viajes con este filtro'}
              message={documentState === 'ALL' ? 'No tienes viajes activos. Acepta una oferta para comenzar.' : 'No encontramos viajes con ese estado documental.'}
            />
          </View>
        </AppScreen>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<DocumentStateFilters value={documentState} onChange={setDocumentState} />}
          renderItem={({ item }) => (
            <TripCard trip={item} onView={openDetail} />
          )}
        />
      )}
    </View>
  );
}

function DocumentStateFilters({
  value,
  onChange,
}: {
  value: DriverDocumentState;
  onChange: (value: DriverDocumentState) => void;
}) {
  return (
    <View style={styles.filterGroup}>
      <Text style={styles.filterLabel}>Estado documental</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
        {documentStateFilters.map((filter) => {
          const isActive = value === filter.value;
          return (
            <TouchableOpacity
              key={filter.value}
              onPress={() => onChange(filter.value)}
              style={[styles.filterChip, isActive ? styles.filterChipActive : styles.filterChipInactive]}>
              <Text style={[styles.filterChipText, isActive ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing[4],
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
  filtersContent: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
});
