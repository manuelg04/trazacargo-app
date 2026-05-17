import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppErrorState } from '@/src/components/AppErrorState';
import { AppInput } from '@/src/components/AppInput';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { operationalEventActions, TripEventType } from '@/src/constants/tripEvents';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { DocumentRequirementList } from '@/src/features/documents/DocumentRequirementList';
import { DocumentReviewHistory, DocumentReviewEventView } from '@/src/features/documents/DocumentReviewHistory';
import { DocumentSummaryPanel } from '@/src/features/documents/DocumentSummaryPanel';
import { DocumentRequirementView } from '@/src/features/documents/documentRequirementTypes';
import { DriverDocumentUploadPanel } from '@/src/features/documents/DriverDocumentUploadPanel';
import { TripEventTimeline } from '@/src/features/trips/TripEventTimeline';
import { colors, fontFamily, fontSize, spacing } from '@/constants/theme';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';

type TabKey = 'info' | 'docs' | 'events' | 'actions';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Info' },
  { key: 'docs', label: 'Documentos' },
  { key: 'events', label: 'Eventos' },
  { key: 'actions', label: 'Acciones' },
];

export default function TripDetailScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const acceptOffer = useMutation(api.trips.acceptOfferForCurrentDriver);
  const createEvent = useMutation(api.tripEvents.createForCurrentDriver);
  const [accepting, setAccepting] = useState(false);
  const [activeEvent, setActiveEvent] = useState<TripEventType | null>(null);
  const [issueNote, setIssueNote] = useState('Novedad reportada por el conductor.');
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const resolvedTripId = tripId as Id<'trips'> | undefined;
  const detail = useQuery(
    api.trips.getDetailForCurrentDriver,
    resolvedTripId ? { tripId: resolvedTripId } : 'skip',
  );
  const reviewEvents = useQuery(
    api.tripDocumentReviewEvents.listReviewEventsByTripForCurrentDriver,
    resolvedTripId ? { tripId: resolvedTripId } : 'skip',
  );

  if (!resolvedTripId) {
    return (
      <AppScreen>
        <AppErrorState title="Viaje no encontrado" message="No se encontró el identificador del viaje." />
      </AppScreen>
    );
  }

  const handleAccept = async () => {
    setAccepting(true);

    try {
      await acceptOffer({ tripId: resolvedTripId });
    } catch {
      Alert.alert('No se pudo aceptar', 'La oferta ya no está disponible o hubo un problema de conexión.');
    } finally {
      setAccepting(false);
    }
  };

  const handleCreateEvent = async (eventType: TripEventType, note?: string) => {
    setActiveEvent(eventType);

    try {
      await createEvent({ tripId: resolvedTripId, eventType, note });
    } catch {
      Alert.alert('No se pudo registrar', 'Revisa el estado del viaje y vuelve a intentar.');
    } finally {
      setActiveEvent(null);
    }
  };

  if (detail === undefined) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
          <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
            <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 4 }}>
              <Text style={{ color: colors.textInverse, opacity: 0.8, fontFamily: fontFamily.semibold, fontSize: fontSize.sm }}>
                ← Volver
              </Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
              Cargando...
            </Text>
          </View>
        </SafeAreaView>
        <AppScreen scroll={false}>
          <AppLoading message="Cargando detalle" />
        </AppScreen>
      </View>
    );
  }

  const documents = detail.documents as TripDocumentView[];
  const requirements = detail.documentRequirements as DocumentRequirementView[];
  const companyDocuments = documents.filter((document) => document.direction === 'COMPANY_TO_DRIVER');
  const driverDocuments = documents.filter((document) => document.direction === 'DRIVER_TO_COMPANY');
  const companyRequirements = requirements.filter((requirement) => requirement.direction === 'COMPANY_TO_DRIVER');
  const driverRequirements = requirements.filter((requirement) => requirement.direction === 'DRIVER_TO_COMPANY');
  const routeTitle = `${detail.trip.originCity} → ${detail.trip.destinationCity}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.brand500 }}>
        <View style={{ paddingHorizontal: spacing[4], paddingTop: spacing[3], paddingBottom: 14 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 4 }}>
            <Text style={{ color: colors.textInverse, opacity: 0.8, fontFamily: fontFamily.semibold, fontSize: fontSize.sm }}>
              ← Volver
            </Text>
          </TouchableOpacity>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textInverse, fontFamily: fontFamily.extrabold, fontSize: fontSize.xl }}>
                {routeTitle}
              </Text>
              <Text style={{ color: colors.textInverse, opacity: 0.75, fontFamily: fontFamily.regular, fontSize: fontSize.sm }}>
                {detail.company.name}
              </Text>
            </View>
            <StatusBadge status={detail.trip.status} />
          </View>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={[styles.tabItem, isActive ? styles.tabItemActive : null]}>
                <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : styles.tabLabelInactive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      <ScrollView
        key={activeTab}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {activeTab === 'info' ? (
          <AppCard>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Empresa</Text>
              <Text style={styles.infoValue}>{detail.company.name}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Carga</Text>
              <Text style={styles.infoValue}>{detail.trip.cargoDescription}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>Fecha de cargue</Text>
              <Text style={styles.infoValue}>{formatDate(detail.trip.pickupAt)}</Text>
            </View>
            {detail.trip.deliveryEta ? (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>ETA entrega</Text>
                <Text style={styles.infoValue}>{formatDate(detail.trip.deliveryEta)}</Text>
              </View>
            ) : null}
            {detail.trip.freightValue ? (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>Flete</Text>
                <Text style={styles.infoValue}>{formatCurrency(detail.trip.freightValue)}</Text>
              </View>
            ) : null}
            {detail.trip.advanceValue ? (
              <View style={[styles.infoRow, styles.infoRowBorder]}>
                <Text style={styles.infoLabel}>Anticipo</Text>
                <Text style={styles.infoValue}>{formatCurrency(detail.trip.advanceValue)}</Text>
              </View>
            ) : null}
            {detail.trip.observations ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Observaciones</Text>
                <Text style={[styles.infoValue, { textAlign: 'left', marginLeft: 0, flex: 1 }]}>
                  {detail.trip.observations}
                </Text>
              </View>
            ) : null}
            {!detail.trip.deliveryEta && !detail.trip.freightValue && !detail.trip.advanceValue && !detail.trip.observations ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel} />
              </View>
            ) : null}
            {detail.access.hasPendingOffer ? (
              <AppButton
                label="Aceptar viaje"
                variant="primary"
                size="lg"
                fullWidth
                loading={accepting}
                onPress={handleAccept}
                style={{ marginTop: spacing[4] }}
              />
            ) : null}
          </AppCard>
        ) : null}

        {activeTab === 'docs' ? (
          <View style={styles.tabContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Checklist documental</Text>
              <DocumentSummaryPanel summary={detail.documentSummary} />
            </View>
            <DocumentRequirementList
              title="Documentos de la empresa"
              requirements={companyRequirements}
              actor="driver"
              emptyText="La empresa todavía no ha definido documentos para este viaje."
            />
            <DocumentRequirementList
              title="Documentos que debo enviar"
              requirements={driverRequirements}
              actor="driver"
              emptyText="No tienes documentos requeridos para enviar."
            />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Archivos de la empresa</Text>
              {companyDocuments.length === 0 ? (
                <Text style={styles.emptyText}>Este viaje no tiene documentos de la empresa todavía.</Text>
              ) : (
                <View style={styles.docList}>
                  {companyDocuments.map((document) => (
                    <DocumentCard key={document._id} document={document} showDirection={false} />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Mis archivos enviados</Text>
              {driverDocuments.length === 0 ? (
                <Text style={styles.emptyText}>Todavía no has enviado documentos.</Text>
              ) : (
                <View style={styles.docList}>
                  {driverDocuments.map((document) => (
                    <DocumentCard key={document._id} document={document} showDirection={false} />
                  ))}
                </View>
              )}
            </View>

            {detail.access.belongsToDriver ? (
              <DriverDocumentUploadPanel tripId={resolvedTripId} documents={driverDocuments} />
            ) : null}
            {reviewEvents === undefined ? (
              <AppLoading message="Cargando historial" />
            ) : (
              <DocumentReviewHistory events={reviewEvents as DocumentReviewEventView[]} limit={10} />
            )}
          </View>
        ) : null}

        {activeTab === 'events' ? (
          <TripEventTimeline events={detail.events} />
        ) : null}

        {activeTab === 'actions' ? (
          detail.access.belongsToDriver ? (
            <View style={styles.tabContent}>
              {operationalEventActions.map((action) => (
                <AppButton
                  key={action.eventType}
                  label={action.label}
                  variant="accent"
                  size="lg"
                  fullWidth
                  loading={activeEvent === action.eventType}
                  onPress={() => handleCreateEvent(action.eventType)}
                />
              ))}

              <View style={styles.separator} />

              <AppInput
                label="Descripción de novedad"
                value={issueNote}
                onChangeText={setIssueNote}
                placeholder="Describe la novedad"
                multiline
              />
              <AppButton
                label="⚠ Reportar novedad"
                variant="danger"
                size="lg"
                fullWidth
                loading={activeEvent === 'ISSUE_REPORTED'}
                onPress={() => handleCreateEvent('ISSUE_REPORTED', issueNote.trim() || 'Novedad reportada por el conductor.')}
              />
            </View>
          ) : (
            <AppCard>
              <Text style={styles.noActionsText}>No tienes acciones disponibles.</Text>
            </AppCard>
          )
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
  },
  tabBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    flexDirection: 'row',
    height: 48,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  tabItemActive: {
    borderBottomColor: colors.brand500,
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  tabLabelActive: {
    color: colors.brand500,
  },
  tabLabelInactive: {
    color: colors.textTertiary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[4],
    gap: spacing[4],
  },
  tabContent: {
    gap: spacing[4],
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderBottomColor: colors.borderSubtle,
    borderBottomWidth: 1,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.sm,
  },
  infoValue: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    flexShrink: 1,
    marginLeft: spacing[3],
    textAlign: 'right',
  },
  section: {
    gap: spacing[3],
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  docList: {
    gap: spacing[3],
  },
  separator: {
    backgroundColor: colors.borderSubtle,
    height: 1,
    marginVertical: spacing[2],
  },
  noActionsText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
});
