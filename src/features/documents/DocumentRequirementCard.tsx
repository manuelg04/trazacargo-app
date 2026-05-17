import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { StatusBadge } from '@/src/components/StatusBadge';
import { RequirementUploadPanel } from '@/src/features/documents/RequirementUploadPanel';
import { DocumentRequirementView } from '@/src/features/documents/documentRequirementTypes';
import {
  documentDirectionLabels,
  documentRequirementStatusLabels,
  documentTypeLabels,
} from '@/src/features/documents/documentLabels';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';
import { colors, fontFamily, fontSize, radius, spacing } from '@/constants/theme';
import { formatDate } from '@/src/utils/formatDate';
import { formatDueDate } from '@/src/utils/formatDueDate';
import { getActionErrorMessage } from '@/src/utils/getActionErrorMessage';

type RequirementActor = 'driver' | 'dispatcher';

type DocumentRequirementCardProps = {
  requirement: DocumentRequirementView;
  actor: RequirementActor;
  onWaive?: (requirementId: Id<'tripDocumentRequirements'>, waiverReason: string) => Promise<void>;
  onReactivate?: (requirementId: Id<'tripDocumentRequirements'>) => Promise<void>;
  onUpdateDueDate?: (requirementId: Id<'tripDocumentRequirements'>, dueAt?: string) => Promise<void>;
  onUploaded?: () => void;
};

export function DocumentRequirementCard({
  requirement,
  actor,
  onWaive,
  onReactivate,
  onUpdateDueDate,
  onUploaded,
}: DocumentRequirementCardProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [showWaiver, setShowWaiver] = useState(false);
  const [showDueEditor, setShowDueEditor] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');
  const [dueAtText, setDueAtText] = useState(requirement.dueAt ? new Date(requirement.dueAt).toISOString().slice(0, 10) : '');
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const document = requirement.satisfiedByDocument ?? requirement.latestDocument;
  const canUpload = canActorUploadRequirement(actor, requirement);
  const canManage = actor === 'dispatcher' && Boolean(onWaive && onReactivate);
  const canManageDueDate = actor === 'dispatcher' && Boolean(onUpdateDueDate);
  const isRejected = requirement.status === 'REJECTED';
  const rejectedReason = requirement.latestDocument?.rejectionReason;
  const dueDate = formatDueDate(requirement.dueAt);
  const shouldWarnDueDate =
    requirement.status !== 'SATISFIED' &&
    requirement.status !== 'WAIVED' &&
    (dueDate.state === 'overdue' || dueDate.state === 'dueSoon');
  const parentDocumentId =
    requirement.status === 'REJECTED' && requirement.latestDocument ? requirement.latestDocument._id : undefined;

  const handleOpen = async (targetDocument: TripDocumentView) => {
    if (!targetDocument.url) {
      Alert.alert('Documento demo', 'Documento demo sin archivo.');
      return;
    }

    try {
      await Linking.openURL(targetDocument.url);
    } catch {
      Alert.alert('No se pudo abrir', 'Intenta nuevamente o revisa tu conexión.');
    }
  };

  const handleWaive = async () => {
    const reason = waiverReason.trim();

    if (!onWaive || !reason) {
      setError('Ingresa el motivo de exención.');
      return;
    }

    setWorking(true);
    setError(undefined);

    try {
      await onWaive(requirement._id, reason);
      setShowWaiver(false);
      setWaiverReason('');
    } catch (waiveError) {
      setError(getActionErrorMessage(waiveError));
    } finally {
      setWorking(false);
    }
  };

  const handleReactivate = async () => {
    if (!onReactivate) {
      return;
    }

    setWorking(true);
    setError(undefined);

    try {
      await onReactivate(requirement._id);
    } catch (reactivateError) {
      setError(getActionErrorMessage(reactivateError));
    } finally {
      setWorking(false);
    }
  };

  const handleUpdateDueDate = async (nextDueAt?: string) => {
    if (!onUpdateDueDate) {
      return;
    }

    setWorking(true);
    setError(undefined);

    try {
      await onUpdateDueDate(requirement._id, nextDueAt);
      setShowDueEditor(false);
      setDueAtText(nextDueAt ?? '');
    } catch (dueDateError) {
      setError(getActionErrorMessage(dueDateError));
    } finally {
      setWorking(false);
    }
  };

  return (
    <AppCard style={isRejected ? styles.cardRejected : undefined}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{requirement.displayName}</Text>
          <Text style={styles.meta}>
            {documentTypeLabels[requirement.documentType]} · {documentDirectionLabels[requirement.direction]}
          </Text>
          <Text style={styles.meta}>{requirement.required ? 'Requerido' : 'Opcional'}</Text>
          {requirement.dueAt ? (
            <Text style={[styles.meta, shouldWarnDueDate ? styles.dueDateWarning : null]}>
              Límite: {shouldWarnDueDate ? dueDate.label : formatDate(requirement.dueAt)}
            </Text>
          ) : null}
        </View>
        <StatusBadge status={requirement.status} />
      </View>

      <View style={styles.stateBox}>
        <Text style={styles.stateText}>{documentRequirementStatusLabels[requirement.status]}</Text>
        {document ? (
          <Text style={styles.documentText}>
            {document.displayName} · {document.url ? 'Archivo disponible' : 'Documento demo sin archivo'}
          </Text>
        ) : (
          <Text style={styles.documentText}>{getEmptyDocumentText(actor, requirement.direction)}</Text>
        )}
      </View>

      {rejectedReason ? (
        <View style={styles.rejectPanel}>
          <Text style={styles.rejectTitle}>Motivo de rechazo</Text>
          <Text style={styles.rejectReason}>{rejectedReason}</Text>
        </View>
      ) : null}

      {requirement.waiverReason ? (
        <View style={styles.waiverPanel}>
          <Text style={styles.waiverTitle}>Motivo de exención</Text>
          <Text style={styles.waiverReason}>{requirement.waiverReason}</Text>
        </View>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.actions}>
        {document ? (
          <AppButton label="Abrir documento" variant="ghost" fullWidth onPress={() => handleOpen(document)} />
        ) : null}
        {canUpload ? (
          <AppButton
            label={showUpload ? 'Ocultar subida' : requirement.status === 'REJECTED' ? 'Reenviar' : 'Subir'}
            variant="secondary"
            fullWidth
            onPress={() => setShowUpload((value) => !value)}
          />
        ) : null}
        {canManage && requirement.status === 'WAIVED' ? (
          <AppButton
            label="Reactivar requisito"
            variant="secondary"
            fullWidth
            loading={working}
            onPress={handleReactivate}
          />
        ) : null}
        {canManage && requirement.status !== 'WAIVED' ? (
          <AppButton
            label={showWaiver ? 'Cancelar exención' : 'Eximir requisito'}
            variant="ghost"
            fullWidth
            disabled={working}
            onPress={() => {
              setShowWaiver((value) => !value);
              setError(undefined);
            }}
          />
        ) : null}
        {canManageDueDate ? (
          <AppButton
            label={showDueEditor ? 'Cancelar fecha límite' : 'Editar fecha límite'}
            variant="ghost"
            fullWidth
            disabled={working}
            onPress={() => {
              setShowDueEditor((value) => !value);
              setDueAtText(requirement.dueAt ? new Date(requirement.dueAt).toISOString().slice(0, 10) : '');
              setError(undefined);
            }}
          />
        ) : null}
      </View>

      {showDueEditor ? (
        <View style={styles.inlinePanel}>
          <AppInput
            label="Fecha límite"
            value={dueAtText}
            onChangeText={setDueAtText}
            placeholder="2026-05-30"
          />
          <AppButton
            label="Guardar fecha límite"
            variant="secondary"
            fullWidth
            loading={working}
            onPress={() => handleUpdateDueDate(dueAtText.trim() || undefined)}
          />
          {requirement.dueAt ? (
            <AppButton
              label="Limpiar fecha límite"
              variant="ghost"
              fullWidth
              disabled={working}
              onPress={() => handleUpdateDueDate(undefined)}
            />
          ) : null}
        </View>
      ) : null}

      {showWaiver ? (
        <View style={styles.inlinePanel}>
          <AppInput
            label="Motivo de exención *"
            value={waiverReason}
            onChangeText={setWaiverReason}
            placeholder="Ej: este cliente no requiere este soporte"
            multiline
          />
          <AppButton label="Confirmar exención" variant="danger" fullWidth loading={working} onPress={handleWaive} />
        </View>
      ) : null}

      {showUpload ? (
        <RequirementUploadPanel
          tripId={requirement.tripId}
          requirement={requirement}
          parentDocumentId={parentDocumentId}
          onUploaded={() => {
            setShowUpload(false);
            onUploaded?.();
          }}
        />
      ) : null}
    </AppCard>
  );
}

function canActorUploadRequirement(actor: RequirementActor, requirement: DocumentRequirementView) {
  if (requirement.status === 'WAIVED' || requirement.status === 'SATISFIED' || requirement.status === 'IN_REVIEW') {
    return false;
  }

  if (actor === 'dispatcher') {
    return requirement.direction === 'COMPANY_TO_DRIVER';
  }

  return requirement.direction === 'DRIVER_TO_COMPANY';
}

function getEmptyDocumentText(actor: RequirementActor, direction: DocumentRequirementView['direction']) {
  if (direction === 'COMPANY_TO_DRIVER') {
    return actor === 'driver' ? 'Pendiente por empresa' : 'Sin documento asociado';
  }

  return actor === 'driver' ? 'Pendiente por enviar' : 'Pendiente por conductor';
}

const styles = StyleSheet.create({
  cardRejected: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing[3],
    justifyContent: 'space-between',
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.base,
  },
  meta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  stateBox: {
    backgroundColor: colors.neutral50,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: spacing[3],
    padding: spacing[3],
  },
  stateText: {
    color: colors.textPrimary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.sm,
  },
  documentText: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  rejectPanel: {
    backgroundColor: colors.errorBg,
    borderColor: colors.errorBd,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: spacing[3],
    padding: spacing[3],
  },
  rejectTitle: {
    color: colors.error,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },
  rejectReason: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  waiverPanel: {
    backgroundColor: colors.neutral50,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 4,
    marginTop: spacing[3],
    padding: spacing[3],
  },
  waiverTitle: {
    color: colors.textSecondary,
    fontFamily: fontFamily.bold,
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
  },
  waiverReason: {
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
  },
  actions: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
  inlinePanel: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
  errorText: {
    backgroundColor: colors.errorBg,
    borderRadius: radius.md,
    color: colors.error,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    marginTop: spacing[3],
    padding: spacing[3],
  },
  dueDateWarning: {
    color: colors.warning,
    fontFamily: fontFamily.bold,
  },
});
