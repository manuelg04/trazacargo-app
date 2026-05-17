import { Id } from '@/convex/_generated/dataModel';
import {
  DocumentDirection,
  DocumentRequirementStatus,
  DocumentType,
} from '@/src/features/documents/documentLabels';
import { TripDocumentView } from '@/src/features/documents/DocumentCard';

export type DocumentSummary = {
  totalRequired: number;
  pendingRequired: number;
  inReviewRequired: number;
  rejectedRequired: number;
  satisfiedRequired: number;
  waivedRequired: number;
  isComplete: boolean;
  hasRejected: boolean;
  hasPending: boolean;
  hasInReview: boolean;
};

export type DocumentRequirementView = {
  _id: Id<'tripDocumentRequirements'>;
  companyId: Id<'companies'>;
  tripId: Id<'trips'>;
  direction: DocumentDirection;
  documentType: DocumentType;
  displayName: string;
  required: boolean;
  status: DocumentRequirementStatus;
  dueAt?: number;
  latestDocumentId?: Id<'tripDocuments'>;
  satisfiedByDocumentId?: Id<'tripDocuments'>;
  waivedByUserId?: Id<'users'>;
  waivedAt?: number;
  waiverReason?: string;
  createdByUserId?: Id<'users'>;
  createdAt: number;
  updatedAt: number;
  latestDocument: TripDocumentView | null;
  satisfiedByDocument: TripDocumentView | null;
};
