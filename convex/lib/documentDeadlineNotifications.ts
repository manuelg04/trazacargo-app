export const DOCUMENT_DUE_SOON_WINDOW_MS = 24 * 60 * 60 * 1000;

type RequirementDeadlineStatus = 'PENDING' | 'IN_REVIEW' | 'SATISFIED' | 'REJECTED' | 'WAIVED';
type RequirementDeadlineDirection = 'COMPANY_TO_DRIVER' | 'DRIVER_TO_COMPANY';
type TripDeadlineStatus =
  | 'DRAFT'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'IN_LOADING'
  | 'LOADED'
  | 'IN_TRANSIT'
  | 'IN_UNLOADING'
  | 'UNLOADED'
  | 'DOCUMENTS_PENDING'
  | 'DOCUMENTS_SUBMITTED'
  | 'DOCUMENTS_APPROVED'
  | 'CLOSED'
  | 'CANCELLED';

export type DeadlineRequirementInput = {
  required: boolean;
  status: RequirementDeadlineStatus;
  dueAt?: number;
  direction: RequirementDeadlineDirection;
};

export type DeadlineTripInput = {
  status: TripDeadlineStatus;
  acceptedByDriverId?: string;
  assignedDriverId?: string;
};

export function getResponsibleDriverIdForDeadline(trip: DeadlineTripInput) {
  return trip.acceptedByDriverId ?? trip.assignedDriverId;
}

export function shouldNotifyDocumentDueSoon(
  requirement: DeadlineRequirementInput,
  trip: DeadlineTripInput,
  now: number,
  windowMs = DOCUMENT_DUE_SOON_WINDOW_MS,
) {
  return (
    isRequirementActionableByDriver(requirement) &&
    isActiveTripForDeadline(trip) &&
    getResponsibleDriverIdForDeadline(trip) !== undefined &&
    requirement.dueAt !== undefined &&
    requirement.dueAt > now &&
    requirement.dueAt <= now + windowMs
  );
}

export function shouldNotifyDocumentOverdue(requirement: DeadlineRequirementInput, trip: DeadlineTripInput, now: number) {
  return (
    isRequirementActionableByDriver(requirement) &&
    isActiveTripForDeadline(trip) &&
    getResponsibleDriverIdForDeadline(trip) !== undefined &&
    requirement.dueAt !== undefined &&
    requirement.dueAt <= now
  );
}

export function isRequirementActionableByDriver(requirement: DeadlineRequirementInput) {
  return (
    requirement.required &&
    requirement.direction === 'DRIVER_TO_COMPANY' &&
    (requirement.status === 'PENDING' || requirement.status === 'REJECTED')
  );
}

export function isActiveTripForDeadline(trip: DeadlineTripInput) {
  return trip.status !== 'CLOSED' && trip.status !== 'CANCELLED';
}
