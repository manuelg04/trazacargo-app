import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMutation, useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppErrorState } from '@/src/components/AppErrorState';
import { AppLoading } from '@/src/components/AppLoading';
import { AppScreen } from '@/src/components/AppScreen';
import { StatusBadge } from '@/src/components/StatusBadge';
import { operationalEventActions, TripEventType } from '@/src/constants/tripEvents';
import { DocumentCard, TripDocumentView } from '@/src/features/documents/DocumentCard';
import { DriverDocumentUploadPanel } from '@/src/features/documents/DriverDocumentUploadPanel';
import { TripEventTimeline } from '@/src/features/trips/TripEventTimeline';
import { TripHeader } from '@/src/features/trips/TripHeader';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatCurrency } from '@/src/utils/formatCurrency';
import { formatDate } from '@/src/utils/formatDate';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const acceptOffer = useMutation(api.trips.acceptOfferForCurrentDriver);
  const createEvent = useMutation(api.tripEvents.createForCurrentDriver);
  const [accepting, setAccepting] = useState(false);
  const [activeEvent, setActiveEvent] = useState<TripEventType | null>(null);
  const [issueNote, setIssueNote] = useState('Novedad reportada por el conductor.');
  const resolvedTripId = tripId as Id<'trips'> | undefined;
  const detail = useQuery(
    api.trips.getDetailForCurrentDriver,
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
      <AppScreen>
        <AppLoading message="Cargando detalle" />
      </AppScreen>
    );
  }

  const documents = detail.documents as TripDocumentView[];
  const companyDocuments = documents.filter((document) => document.direction === 'COMPANY_TO_DRIVER');
  const driverDocuments = documents.filter((document) => document.direction === 'DRIVER_TO_COMPANY');

  return (
    <AppScreen>
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
          <Text style={styles.detailText}>Cargue: {formatDate(detail.trip.pickupAt)}</Text>
          <Text style={styles.detailText}>Entrega estimada: {formatDate(detail.trip.deliveryEta)}</Text>
          <Text style={styles.detailText}>Carga: {detail.trip.cargoDescription}</Text>
          <Text style={styles.detailText}>Flete: {formatCurrency(detail.trip.freightValue)}</Text>
          <Text style={styles.detailText}>Anticipo: {formatCurrency(detail.trip.advanceValue)}</Text>
          {detail.trip.observations ? <Text style={styles.detailText}>Observaciones: {detail.trip.observations}</Text> : null}
        </View>
        {detail.access.hasPendingOffer ? (
          <AppButton title="Aceptar viaje" onPress={handleAccept} loading={accepting} style={styles.acceptButton} />
        ) : null}
      </AppCard>

      {detail.access.belongsToDriver ? (
        <AppCard>
          <Text style={styles.sectionTitle}>Acciones operativas</Text>
          <View style={styles.actions}>
            {operationalEventActions.map((action) => (
              <AppButton
                key={action.eventType}
                title={action.label}
                variant="secondary"
                onPress={() => handleCreateEvent(action.eventType)}
                loading={activeEvent === action.eventType}
              />
            ))}
          </View>
          <View style={styles.issueBox}>
            <Text style={styles.issueLabel}>Novedad</Text>
            <TextInput
              value={issueNote}
              onChangeText={setIssueNote}
              placeholder="Describe la novedad"
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.input}
            />
            <AppButton
              title="Reportar novedad"
              variant="danger"
              onPress={() => handleCreateEvent('ISSUE_REPORTED', issueNote.trim() || 'Novedad reportada por el conductor.')}
              loading={activeEvent === 'ISSUE_REPORTED'}
            />
          </View>
        </AppCard>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Documentos de la empresa</Text>
        {companyDocuments.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyText}>Este viaje todavía no tiene documentos de la empresa.</Text>
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
        <Text style={styles.sectionTitle}>Mis documentos enviados</Text>
        {driverDocuments.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyText}>Todavía no has enviado documentos para este viaje.</Text>
          </AppCard>
        ) : (
          <View style={styles.documentList}>
            {driverDocuments.map((document) => (
              <DocumentCard key={document._id} document={document} showDirection={false} />
            ))}
          </View>
        )}
      </View>

      {detail.access.belongsToDriver ? <DriverDocumentUploadPanel tripId={resolvedTripId} documents={driverDocuments} /> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Eventos</Text>
        <TripEventTimeline events={detail.events} />
      </View>
    </AppScreen>
  );
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
  acceptButton: {
    marginTop: spacing.lg,
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
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  issueBox: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  issueLabel: {
    ...typography.cardTitle,
    color: colors.text,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    minHeight: 88,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
});
