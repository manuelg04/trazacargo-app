import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';

export type UploadableFile = {
  uri: string;
  name: string;
  mimeType?: string;
  sizeBytes?: number;
  file?: Blob;
};

type UploadFileToConvexInput = {
  uploadUrl: string;
  file: UploadableFile;
};

type ConvexUploadResponse = {
  storageId?: string;
};

export async function uploadFileToConvex({ uploadUrl, file }: UploadFileToConvexInput) {
  const body = file.file ?? new File(file.uri);
  const response = await expoFetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Type': file.mimeType ?? 'application/octet-stream',
    },
    body,
  });

  if (!response.ok) {
    throw new Error('No se pudo subir el archivo.');
  }

  const result = (await response.json()) as ConvexUploadResponse;

  if (!result.storageId) {
    throw new Error('Convex no devolvió el identificador del archivo.');
  }

  return result.storageId;
}
