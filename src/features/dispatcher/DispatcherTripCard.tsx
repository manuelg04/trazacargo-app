import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Id } from '@/convex/_generated/dataModel';
import { DocumentSummary } from '@/src/features/documents/documentRequirementTypes';
import { fontFamily } from '@/constants/theme';
import { formatCurrency } from '@/src/utils/formatCurrency';

const palette = {
  green800: '#1A5C38',
  green100: '#E4F3EB',
  green50: '#F2FAF5',
  neutral900: '#0F172A',
  neutral800: '#1E293B',
  neutral700: '#334155',
  neutral600: '#475569',
  neutral500: '#64748B',
  neutral400: '#94A3B8',
  neutral300: '#CBD5E1',
  neutral200: '#E2E8F0',
  neutral100: '#F1F5F9',
  white: '#FFFFFF',
  amberBg: '#FEF3C7',
  amberFg: '#B45309',
  blueBg: '#DBEAFE',
  blueFg: '#1D4ED8',
  redBg: '#FEF2F2',
  redFg: '#DC2626',
};

type DispatcherTripCardTrip = {
  _id: Id<'trips'>;
  originCity: string;
  destinationCity: string;
  pickupAt: number;
  freightValue?: number;
  advanceValue?: number;
  cargoDescription: string;
  vehicleType?: string;
  status: string;
  acceptedDriver: { fullName: string; vehicleType?: string } | null;
  assignedDriver: { fullName: string; vehicleType?: string } | null;
  offerCount: number;
  pendingOfferCount: number;
  documentSummary?: DocumentSummary;
};

type DispatcherTripCardProps = {
  trip: DispatcherTripCardTrip;
  onView: (tripId: Id<'trips'>) => void;
};

export function DispatcherTripCard({ trip, onView }: DispatcherTripCardProps) {
  const driver = trip.acceptedDriver?.fullName ?? trip.assignedDriver?.fullName;
  const driverVehicleType = trip.acceptedDriver?.vehicleType ?? trip.assignedDriver?.vehicleType;
  const statusTone = getStatusTone(trip.status);
  const docTone = trip.documentSummary ? getDocTone(trip.documentSummary, trip.status) : null;

  return (
    <View style={styles.card}>
      <View style={styles.route}>
        <View style={styles.routeTop}>
          <Text style={styles.city} numberOfLines={1}>{trip.originCity}</Text>
          <View style={styles.connector}>
            <DottedLine />
            <Ionicons name="chevron-forward" size={12} color={palette.neutral400} />
          </View>
          <Text style={styles.city} numberOfLines={1}>{trip.destinationCity}</Text>
        </View>

        <View style={styles.routeBottom}>
          <Text style={styles.cargo} numberOfLines={1}>
            {trip.cargoDescription || 'Sin descripción'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusTone.bg }]}>
            <Text style={[styles.statusText, { color: statusTone.fg }]}>{statusTone.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.innerDivider} />

      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="calendar" size={13} color={palette.neutral400} />
            <Text style={styles.metaText}>{formatPickupDate(trip.pickupAt)}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="truck" size={13} color={trip.vehicleType ? palette.neutral400 : palette.neutral300} />
            <Text style={[styles.metaText, !trip.vehicleType ? styles.metaMuted : null]} numberOfLines={1}>
              Viaje: {trip.vehicleType || 'No registrado'}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Feather name="dollar-sign" size={13} color={trip.freightValue ? palette.neutral400 : palette.neutral300} />
            {trip.freightValue ? (
              <Text style={[styles.metaText, styles.metaStrong]}>{formatCurrency(trip.freightValue)}</Text>
            ) : (
              <Text style={[styles.metaText, styles.metaMuted]}>Sin valor</Text>
            )}
          </View>
          <View style={[styles.metaItem, styles.metaItemFlex]}>
            <Feather name="user" size={13} color={driver ? palette.neutral400 : palette.neutral300} />
            {driver ? (
              <Text style={styles.metaText} numberOfLines={1}>
                {driver}{driverVehicleType ? ` · ${driverVehicleType}` : ' · Tipo no registrado'}
              </Text>
            ) : (
              <Text style={[styles.metaText, styles.metaMuted]} numberOfLines={1}>Sin asignar</Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.tags}>
        {trip.offerCount > 0 ? (
          <View style={[styles.tag, styles.tagPositive]}>
            <Text style={[styles.tagText, { color: palette.green800 }]}>
              {trip.offerCount} oferta{trip.offerCount !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
        <View style={[styles.tag, styles.tagMuted]}>
          <Text style={[styles.tagText, { color: palette.neutral400 }]}>
            {trip.pendingOfferCount} pendiente{trip.pendingOfferCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {docTone ? (
          <View style={[styles.docBadge, { backgroundColor: docTone.bg }]}>
            <Feather name={docTone.icon} size={11} color={docTone.fg} />
            <Text style={[styles.docBadgeText, { color: docTone.fg }]}>{docTone.label}</Text>
          </View>
        ) : (
          <View />
        )}

        <Pressable
          onPress={() => onView(trip._id)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.detailBtn, pressed ? styles.detailPressed : null]}>
          <Text style={styles.detailText}>Ver detalle</Text>
          <Feather name="arrow-right" size={12} color={palette.white} />
        </Pressable>
      </View>
    </View>
  );
}

function DottedLine() {
  return (
    <View style={styles.dottedLine}>
      {Array.from({ length: 14 }).map((_, i) => (
        <View key={i} style={styles.dot} />
      ))}
    </View>
  );
}

function getStatusTone(status: string): { label: string; bg: string; fg: string } {
  switch (status) {
    case 'DRAFT':
      return { label: 'Borrador', bg: palette.neutral100, fg: palette.neutral500 };
    case 'OFFERED':
      return { label: 'Ofertado', bg: palette.blueBg, fg: palette.blueFg };
    case 'ACCEPTED':
      return { label: 'Aceptado', bg: palette.green100, fg: palette.green800 };
    case 'CLOSED':
      return { label: 'Cerrado', bg: palette.neutral800, fg: palette.white };
    case 'CANCELLED':
      return { label: 'Cancelado', bg: palette.redBg, fg: palette.redFg };
    default:
      return { label: 'En tránsito', bg: palette.amberBg, fg: palette.amberFg };
  }
}

type DocIcon = 'check' | 'alert-circle' | 'clock' | 'x-circle';

function getDocTone(
  summary: DocumentSummary,
  tripStatus: string,
): { label: string; bg: string; fg: string; icon: DocIcon } {
  if (summary.totalRequired === 0) {
    return { label: 'Sin requisitos', bg: palette.neutral100, fg: palette.neutral500, icon: 'check' };
  }
  if (summary.hasRejected) {
    return { label: 'Rechazado', bg: palette.redBg, fg: palette.redFg, icon: 'x-circle' };
  }
  if (summary.hasInReview) {
    return { label: 'En revisión', bg: palette.blueBg, fg: palette.blueFg, icon: 'clock' };
  }
  if (summary.hasPending) {
    return { label: 'Pendiente', bg: palette.amberBg, fg: palette.amberFg, icon: 'alert-circle' };
  }
  if (summary.isComplete) {
    const label = tripStatus === 'CLOSED' || tripStatus === 'CANCELLED' ? 'Completo' : 'Listo';
    return { label, bg: palette.green50, fg: palette.green800, icon: 'check' };
  }
  return { label: 'Pendiente', bg: palette.amberBg, fg: palette.amberFg, icon: 'alert-circle' };
}

function formatPickupDate(ts: number): string {
  const d = new Date(ts);
  const datePart = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const timePart = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${capitalize(datePart)} · ${timePart}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  route: {
    paddingTop: 15,
    paddingHorizontal: 16,
    paddingBottom: 13,
  },
  routeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 9,
  },
  city: {
    fontFamily: fontFamily.extrabold,
    fontSize: 16,
    color: palette.neutral900,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  connector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  dottedLine: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: 3,
    height: 1,
    backgroundColor: palette.neutral300,
  },
  routeBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cargo: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: palette.neutral400,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 50,
    flexShrink: 0,
  },
  statusText: {
    fontFamily: fontFamily.extrabold,
    fontSize: 10,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  innerDivider: {
    height: 1,
    backgroundColor: palette.neutral100,
    marginHorizontal: 16,
  },
  meta: {
    paddingTop: 11,
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 7,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaItemFlex: {
    flex: 1,
    minWidth: 0,
  },
  metaText: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: palette.neutral600,
    flexShrink: 1,
  },
  metaStrong: {
    color: palette.neutral800,
    fontFamily: fontFamily.bold,
  },
  metaMuted: {
    color: palette.neutral300,
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 2,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  tag: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
  },
  tagPositive: {
    backgroundColor: palette.green50,
  },
  tagMuted: {
    backgroundColor: palette.neutral100,
  },
  tagText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: palette.neutral100,
  },
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  docBadgeText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: palette.neutral900,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 11,
  },
  detailPressed: {
    opacity: 0.85,
  },
  detailText: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: palette.white,
  },
});
