import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppErrorState } from '@/src/components/AppErrorState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { CompanyDocumentUploadPanel } from '@/src/features/documents/CompanyDocumentUploadPanel';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { DocumentReviewPanel } from '@/src/features/documents/DocumentReviewPanel';
import { TripOfferPanel } from '@/src/features/dispatcher/TripOfferPanel';
import { TripEventTimeline } from '@/src/features/trips/TripEventTimeline';
import { TripHeader } from '@/src/features/trips/TripHeader';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';

export default function DispatcherTripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const resolvedTripId = tripId as Id<'trips'> | undefined;
  const detail = useQuery(api.trips.getDetailForDispatcher, resolvedTripId ? { tripId: resolvedTripId } : 'skip');
  const drivers = useQuery(api.drivers.listForCurrentCompany, {});
  const offerToDrivers = useMutation(api.trips.offerToDriversForDispatcher);
  const cancelTrip = useMutation(api.trips.cancelTripForDispatcher);
  const [selectedDriverIds, setSelectedDriverIds] = useState<Id<'drivers'>[]>([]);
  const [offering, setOffering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  if (!resolvedTripId) {
    return (
      <AppScreen>
        <AppErrorState title="Viaje no encontrado" message="No se encontró el identificador del viaje." />
      </AppScreen>
    );
  }

  const handleOffer = async () => {
    setOffering(true);
    setMessage(undefined);
    setError(undefined);

    try {
      const result = await offerToDrivers({ tripId: resolvedTripId, driverIds: selectedDriverIds });
      setSelectedDriverIds([]);
      setMessage(`Ofertas creadas: ${result.createdCount}. Ya existentes: ${result.skippedCount}.`);
    } catch (offerError) {
      setError(getActionErrorMessage(offerError));
    } finally {
      setOffering(false);
    }
  };

  const handleCancel = async () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      return;
    }

    setCancelling(true);
    setMessage(undefined);
    setError(undefined);

    try {
      await cancelTrip({ tripId: resolvedTripId });
      setConfirmCancel(false);
      setMessage('Viaje cancelado.');
    } catch (cancelError) {
      setError(getActionErrorMessage(cancelError));
    } finally {
      setCancelling(false);
    }
  };

  if (detail === undefined || drivers === undefined) {
    return (
      <AppScreen>
        <AppLoading message="Cargando viaje" />
      </AppScreen>
    );
  }

  const canOffer = !detail.trip.acceptedByDriverId && detail.trip.status !== 'CANCELLED' && detail.trip.status !== 'CLOSED';
  const canCancel = detail.trip.status !== 'CANCELLED' && detail.trip.status !== 'CLOSED';
  const activeDrivers = drivers.filter((driver) => driver.status === 'ACTIVE');
  const driverName = detail.acceptedDriver?.fullName ?? detail.assignedDriver?.fullName ?? 'Sin conductor';
  const documents = detail.documents as TripDocumentView[];
  const companyDocuments = documents.filter((document) => document.direction === 'COMPANY_TO_DRIVER');
  const driverDocuments = documents.filter((document) => document.direction === 'DRIVER_TO_COMPANY');

  return (
    <AppScreen>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <AppCard>
        <View style={styles.headerRow}>
          <TripHeader
            originCity={detail.trip.originCity}
            destinationCity={detail.trip.destinationCity}
            routeLabel={detail.trip.routeLabel}
          />
          <StatusBadge status={detail.trip.status} />
        </View>
        <View style={styles.detailGrid}>
          <Text style={styles.detailText}>Empresa: {detail.company.name}</Text>
          <Text style={styles.detailText}>Conductor: {driverName}</Text>
          <Text style={styles.detailText}>Cargue: {formatDate(detail.trip.pickupAt)}</Text>
          <Text style={styles.detailText}>Entrega estimada: {formatDate(detail.trip.deliveryEta)}</Text>
          <Text style={styles.detailText}>Carga: {detail.trip.cargoDescription}</Text>
          <Text style={styles.detailText}>Flete: {formatCurrency(detail.trip.freightValue)}</Text>
          <Text style={styles.detailText}>Anticipo: {formatCurrency(detail.trip.advanceValue)}</Text>
          {detail.trip.observations ? <Text style={styles.detailText}>Observaciones: {detail.trip.observations}</Text> : null}
        </View>
        {canCancel ? (
          <View style={styles.cancelBox}>
            {confirmCancel ? <Text style={styles.confirmText}>Confirma la cancelación del viaje.</Text> : null}
            <AppButton
              title={confirmCancel ? 'Confirmar cancelación' : 'Cancelar viaje'}
              variant="danger"
              onPress={handleCancel}
              loading={cancelling}
            />
            {confirmCancel ? (
              <AppButton title="Mantener viaje" variant="secondary" onPress={() => setConfirmCancel(false)} />
            ) : null}
          </View>
        ) : null}
      </AppCard>

      {canOffer ? (
        <TripOfferPanel
          drivers={activeDrivers}
          offers={detail.offers}
          selectedDriverIds={selectedDriverIds}
          offering={offering}
          onChangeSelectedDrivers={setSelectedDriverIds}
          onOffer={handleOffer}
        />
      ) : (
        <AppCard>
          <Text style={styles.sectionTitle}>Ofertas enviadas</Text>
          {detail.offers.length === 0 ? <Text style={styles.detailText}>Este viaje no tiene ofertas.</Text> : null}
          <View style={styles.offerList}>
            {detail.offers.map((offer) => (
              <View key={offer._id} style={styles.offerRow}>
                <Text style={styles.offerDriver}>{offer.driver.fullName}</Text>
                <StatusBadge status={offer.status} />
              </View>
            ))}
          </View>
        </AppCard>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos para el conductor</Text>
        <CompanyDocumentUploadPanel tripId={resolvedTripId} />
        {companyDocuments.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyText}>Este viaje todavía no tiene documentos para el conductor.</Text>
          </AppCard>
        ) : (
          <View style={styles.documentList}>
            {companyDocuments.map((document) => (
              <DocumentCard key={document._id} document={document} showDirection={false} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos recibidos del conductor</Text>
        <DocumentReviewPanel documents={driverDocuments} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos</Text>
        <TripEventTimeline events={detail.events} />
      </View>
    </AppScreen>
  );
}

function getActionErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : '';

  if (message) {
    return message;
  }

  return 'No se pudo completar la acción.';
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  detailGrid: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  detailText: {
    ...typography.body,
    color: colors.text,
  },
  cancelBox: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  confirmText: {
    ...typography.body,
    color: colors.danger,
  },
  section: {
    gap: spacing.md,
  },
  documentList: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  offerList: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  offerRow: {
    alignItems: 'flex-start',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  offerDriver: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
  message: {
    ...typography.body,
    backgroundColor: colors.successSoft,
    borderRadius: 8,
    color: colors.success,
    padding: spacing.md,
  },
});
