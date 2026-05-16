import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Id } from '@/convex/_generated/dataModel';
import { AppButton } from '@/src/components/AppButton';
import { AppInput } from '@/src/components/AppInput';
import {
  DocumentDirection,
  DocumentType,
  getDocumentTypeLabel,
} from '@/src/features/documents/documentLabels';
import { UploadableFile } from '@/src/features/documents/uploadFileToConvex';
import { useUploadDocument } from '@/src/features/documents/useUploadDocument';
import { colors } from '@/src/theme/colors';
import { spacing } from '@/src/theme/spacing';
import { typography } from '@/src/theme/typography';
import { formatFileSize } from '@/src/utils/formatFileSize';

type DocumentTypeOption = {
  value: DocumentType;
  label: string;
};

type DocumentUploadFormProps = {
  tripId: Id<'trips'>;
  direction: DocumentDirection;
  availableDocumentTypes: DocumentTypeOption[];
  onUploaded?: () => void;
  parentDocumentResolver?: (documentType: DocumentType) => Id<'tripDocuments'> | undefined;
};

export function DocumentUploadForm({
  tripId,
  direction,
  availableDocumentTypes,
  onUploaded,
  parentDocumentResolver,
}: DocumentUploadFormProps) {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | undefined>();
  const [displayName, setDisplayName] = useState('');
  const [selectedFile, setSelectedFile] = useState<UploadableFile | undefined>();
  const [localError, setLocalError] = useState<string | undefined>();
  const { uploadDocument, uploading, error, clearError } = useUploadDocument({ tripId, direction });

  const handlePickDocument = async () => {
    setLocalError(undefined);
    clearError();

    const result = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
      type: '*/*',
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];

    setSelectedFile({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
      sizeBytes: asset.size,
      file: asset.file,
    });
  };

  const handleTakePhoto = async () => {
    setLocalError(undefined);
    clearError();

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Autoriza la cámara para tomar una foto.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (result.canceled || result.assets.length === 0) {
      return;
    }

    const asset = result.assets[0];
    const name = asset.fileName ?? `foto-${Date.now()}.jpg`;

    setSelectedFile({
      uri: asset.uri,
      name,
      mimeType: asset.mimeType ?? 'image/jpeg',
      sizeBytes: asset.fileSize,
      file: asset.file,
    });
  };

  const handleSubmit = async () => {
    setLocalError(undefined);
    clearError();

    if (!selectedDocumentType) {
      setLocalError('Selecciona el tipo de documento.');
      return;
    }

    if (!selectedFile) {
      setLocalError('Selecciona un archivo o toma una foto.');
      return;
    }

    try {
      await uploadDocument({
        documentType: selectedDocumentType,
        displayName,
        file: selectedFile,
        parentDocumentId: parentDocumentResolver?.(selectedDocumentType),
      });
      setSelectedDocumentType(undefined);
      setDisplayName('');
      setSelectedFile(undefined);
      onUploaded?.();
    } catch (submitError) {
      const message = submitError instanceof Error && submitError.message ? submitError.message : 'No se pudo guardar el documento.';
      setLocalError(message);
    }
  };

  const selectedFileDetail = selectedFile
    ? [selectedFile.name, formatFileSize(selectedFile.sizeBytes)].filter(Boolean).join(' · ')
    : 'Ningún archivo seleccionado';
  const visibleError = localError ?? error;

  return (
    <View style={styles.container}>
      <View style={styles.typeGrid}>
        {availableDocumentTypes.map((option) => {
          const selected = selectedDocumentType === option.value;

          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              onPress={() => setSelectedDocumentType(option.value)}
              style={({ pressed }) => [
                styles.typeButton,
                selected ? styles.typeButtonSelected : null,
                pressed ? styles.typeButtonPressed : null,
              ]}>
              <Text style={[styles.typeButtonText, selected ? styles.typeButtonTextSelected : null]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <AppInput
        label="Nombre visible"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={selectedDocumentType ? getDocumentTypeLabel(selectedDocumentType) : 'Nombre del documento'}
      />

      <View style={styles.fileBox}>
        <Text style={styles.fileLabel}>Archivo</Text>
        <Text style={styles.fileText}>{selectedFileDetail}</Text>
      </View>

      <View style={styles.pickActions}>
        <AppButton title="Seleccionar archivo" variant="secondary" onPress={handlePickDocument} disabled={uploading} />
        <AppButton title="Tomar foto" variant="secondary" onPress={handleTakePhoto} disabled={uploading} />
      </View>

      {visibleError ? <Text style={styles.error}>{visibleError}</Text> : null}
      <AppButton title="Subir documento" onPress={handleSubmit} loading={uploading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonPressed: {
    opacity: 0.84,
  },
  typeButtonText: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  typeButtonTextSelected: {
    color: colors.surface,
  },
  fileBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    gap: spacing.xs,
    padding: spacing.md,
  },
  fileLabel: {
    ...typography.small,
    color: colors.text,
    fontWeight: '700',
  },
  fileText: {
    ...typography.body,
    color: colors.textMuted,
  },
  pickActions: {
    gap: spacing.sm,
  },
  error: {
    ...typography.body,
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    color: colors.danger,
    padding: spacing.md,
  },
});
