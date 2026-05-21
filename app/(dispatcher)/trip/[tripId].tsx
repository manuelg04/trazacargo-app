import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppErrorState } from '@/src/components/AppErrorState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';
import { DocumentReviewEventView } from '@/src/features/documents/DocumentReviewHistory';
import { DocumentRequirementView } from '@/src/features/documents/documentRequirementTypes';
import { DispatcherTripDocumentsSection } from '@/src/features/documents/DispatcherTripDocumentsSection';
import { TripOfferPanel } from '@/src/features/dispatcher/TripOfferPanel';
import { TripEventTimeline } from '@/src/features/trips/TripEventTimeline';
import { TripHeader } from '@/src/features/trips/TripHeader';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type Tab = 'info' | 'docs' | 'events';

export default function DispatcherTripDetailScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const resolvedTripId = tripId as Id<'trips'> | undefined;
  const detail = useQuery(api.trips.getDetailForDispatcher, resolvedTripId ? { tripId: resolvedTripId } : 'skip');
  const reviewEvents = useQuery(
    api.tripDocumentReviewEvents.listReviewEventsByTripForDispatcher,
    resolvedTripId ? { tripId: resolvedTripId } : 'skip',
  );
  const drivers = useQuery(api.drivers.listForCurrentCompany, {});
  const offerToDrivers = useMutation(api.trips.offerToDriversForDispatcher);
  const cancelTrip = useMutation(api.trips.cancelTripForDispatcher);
  const closeTrip = useMutation(api.trips.closeTripForDispatcher);
  const waiveRequirement = useMutation(api.tripDocumentRequirements.waiveForTripByDispatcher);
  const reactivateRequirement = useMutation(api.tripDocumentRequirements.reactivateForTripByDispatcher);
  const updateRequirementDueDate = useMutation(api.tripDocumentRequirements.updateRequirementDueDateByDispatcher);
  const [selectedDriverIds, setSelectedDriverIds] = useState<Id<'drivers'>[]>([]);
  const [offering, setOffering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [closing, setClosing] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [message, setMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState<Tab>('info');

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

  const handleClose = async () => {
    if (detail?.documentSummary.isComplete && !confirmClose) {
      setConfirmClose(true);
      return;
    }

    setClosing(true);
    setMessage(undefined);
    setError(undefined);

    try {
      await closeTrip({ tripId: resolvedTripId });
      setConfirmClose(false);
      setMessage('Viaje cerrado correctamente.');
    } catch (closeError) {
      setError(getActionErrorMessage(closeError));
    } finally {
      setClosing(false);
    }
  };

  const handleWaiveRequirement = async (
    requirementId: Id<'tripDocumentRequirements'>,
    waiverReason: string,
  ) => {
    setMessage(undefined);
    setError(undefined);
    await waiveRequirement({ requirementId, waiverReason });
    setMessage('Requisito eximido.');
  };

  const handleReactivateRequirement = async (requirementId: Id<'tripDocumentRequirements'>) => {
    setMessage(undefined);
    setError(undefined);
    await reactivateRequirement({ requirementId });
    setMessage('Requisito reactivado.');
  };

  const handleUpdateRequirementDueDate = async (
    requirementId: Id<'tripDocumentRequirements'>,
    dueAt?: string,
  ) => {
    setMessage(undefined);
    setError(undefined);
    await updateRequirementDueDate({ requirementId, dueAt });
    setMessage(dueAt ? 'Fecha límite actualizada.' : 'Fecha límite limpiada.');
  };

  if (detail === undefined || drivers === undefined || reviewEvents === undefined) {
    return (
      <AppScreen>
        <AppLoading message="Cargando viaje" />
      </AppScreen>
    );
  }

  const canOffer = !detail.trip.acceptedByDriverId && detail.trip.status !== 'CANCELLED' && detail.trip.status !== 'CLOSED';
  const canCancel = detail.trip.status !== 'CANCELLED' && detail.trip.status !== 'CLOSED';
  const activeDrivers = drivers.filter((driver) => driver.status === 'ACTIVE');
  const selectedDriver = detail.acceptedDriver ?? detail.assignedDriver;
  const driverName = selectedDriver?.fullName ?? 'Sin conductor';
  const driverVehicleType = selectedDriver?.vehicleType ?? 'No registrado';
  const tripVehicleType = detail.trip.vehicleType ?? 'No registrado';
  const documents = detail.documents as TripDocumentView[];
  const requirements = detail.documentRequirements as DocumentRequirementView[];
  const companyDocuments = documents.filter((document) => document.direction === 'COMPANY_TO_DRIVER');
  const driverDocuments = documents.filter((document) => document.direction === 'DRIVER_TO_COMPANY');
  const companyRequirements = requirements.filter((requirement) => requirement.direction === 'COMPANY_TO_DRIVER');
  const driverRequirements = requirements.filter((requirement) => requirement.direction === 'DRIVER_TO_COMPANY');
  const canCloseTrip = detail.trip.status !== 'CLOSED' && detail.trip.status !== 'CANCELLED';

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Info y conductor' },
    { key: 'docs', label: 'Documentos' },
    { key: 'events', label: 'Eventos' },
  ];

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.heroArea}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Text style={styles.heroRoute} numberOfLines={1}>
            {detail.trip.originCity} → {detail.trip.destinationCity}
          </Text>
          <Text style={styles.heroDescription} numberOfLines={1}>
            {detail.trip.cargoDescription}
          </Text>
          <View style={styles.heroBadge}>
            <StatusBadge status={detail.trip.status} />
          </View>
        </View>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tab, isActive && styles.tabActive]}>
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <AppScreen scroll key={activeTab}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        ) : null}
        {activeTab === 'info' ? (
          <>
            <AppCard>
              <View style={styles.tripHeader}>
                <TripHeader
                  originCity={detail.trip.originCity}
                  destinationCity={detail.trip.destinationCity}
                  routeLabel={detail.trip.routeLabel}
                />
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Empresa</Text>
                <Text style={styles.dataValue}>{detail.company.name}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Conductor</Text>
                <Text style={styles.dataValue}>{driverName}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Vehículo del viaje</Text>
                <Text style={styles.dataValue}>{tripVehicleType}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Vehículo conductor</Text>
                <Text style={styles.dataValue}>{driverVehicleType}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Carga</Text>
                <Text style={styles.dataValue}>{detail.trip.cargoDescription}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Cargue</Text>
                <Text style={styles.dataValue}>{formatDate(detail.trip.pickupAt)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Entrega estimada</Text>
                <Text style={styles.dataValue}>{formatDate(detail.trip.deliveryEta)}</Text>
              </View>
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Flete</Text>
                <Text style={styles.dataValue}>{formatCurrency(detail.trip.freightValue)}</Text>
              </View>
              <View style={[styles.dataRow, !detail.trip.observations && styles.dataRowLast]}>
                <Text style={styles.dataLabel}>Anticipo</Text>
                <Text style={styles.dataValue}>{formatCurrency(detail.trip.advanceValue)}</Text>
              </View>
              {detail.trip.observations ? (
                <View style={[styles.dataRow, styles.dataRowLast]}>
                  <Text style={styles.dataLabel}>Observaciones</Text>
                  <Text style={styles.dataValue}>{detail.trip.observations}</Text>
                </View>
              ) : null}
            </AppCard>

            {canOffer ? (
              <TripOfferPanel
                tripVehicleType={detail.trip.vehicleType}
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
                {detail.offers.length === 0 ? (
                  <Text style={styles.emptyText}>Este viaje no tiene ofertas.</Text>
                ) : null}
                {detail.offers.map((offer) => (
                  <View key={offer._id} style={styles.offerRow}>
                    <View style={styles.offerDriverBlock}>
                      <Text style={styles.offerDriver}>{offer.driver.fullName}</Text>
                      <Text style={styles.offerVehicle}>
                        Vehículo: {offer.driver.vehicleType || 'No registrado'}
                      </Text>
                    </View>
                    <StatusBadge status={offer.status} />
                  </View>
                ))}
              </AppCard>
            )}

            {canCancel ? (
              <AppCard>
                {confirmCancel ? (
                  <Text style={styles.confirmText}>Confirma la cancelación del viaje.</Text>
                ) : null}
                <View style={styles.cancelActions}>
                  <AppButton
                    label={confirmCancel ? 'Confirmar cancelación' : 'Cancelar viaje'}
                    variant="danger"
                    fullWidth
                    onPress={handleCancel}
                    loading={cancelling}
                  />
                  {confirmCancel ? (
                    <AppButton
                      label="Mantener viaje"
                      variant="secondary"
                      fullWidth
                      onPress={() => setConfirmCancel(false)}
                    />
                  ) : null}
                </View>
              </AppCard>
            ) : null}
          </>
        ) : null}

        {activeTab === 'docs' ? (
          <DispatcherTripDocumentsSection
            tripId={resolvedTripId}
            summary={detail.documentSummary}
            canCloseTrip={canCloseTrip}
            confirmClose={confirmClose}
            closing={closing}
            companyRequirements={companyRequirements}
            driverRequirements={driverRequirements}
            companyDocuments={companyDocuments}
            driverDocuments={driverDocuments}
            reviewEvents={reviewEvents as DocumentReviewEventView[]}
            onClose={handleClose}
            onCancelClose={() => setConfirmClose(false)}
            onWaiveRequirement={handleWaiveRequirement}
            onReactivateRequirement={handleReactivateRequirement}
            onUpdateRequirementDueDate={handleUpdateRequirementDueDate}
          />
        ) : null}

        {activeTab === 'events' ? (
          <TripEventTimeline events={detail.events} />
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
  heroArea: {
    backgroundColor: colors.brand500,
  },
  backButton: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  backText: {
    color: colors.textInverse,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  heroContent: {
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
  },
  heroRoute: {
    color: colors.textInverse,
    fontFamily: fontFamily.extrabold,
    fontSize: fontSize.xl,
  },
  heroDescription: {
    color: colors.textInverse,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    marginTop: 2,
    opacity: 0.75,
  },
  heroBadge: {
    marginTop: spacing[2],
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    height: 48,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand500,
  },
  tabText: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.brand500,
  },
  tripHeader: {
    marginBottom: spacing[3],
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  dataRowLast: {
    borderBottomWidth: 0,
  },
  dataLabel: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  dataValue: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  sectionTitle: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  offerRow: {
    alignItems: 'center',
    borderTopColor: colors.borderSubtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
    paddingTop: spacing[3],
    marginTop: spacing[3],
  },
  offerDriver: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.textPrimary,
    flex: 1,
  },
  offerDriverBlock: {
    flex: 1,
    gap: spacing[1],
  },
  offerVehicle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  cancelActions: {
    gap: spacing[3],
  },
  confirmText: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.error,
    marginBottom: spacing[3],
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  errorText: {
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
  messageBox: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBd,
    borderRadius: 10,
    borderWidth: 1,
    padding: spacing[4],
  },
  messageText: {
    color: colors.success,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
  },
});
