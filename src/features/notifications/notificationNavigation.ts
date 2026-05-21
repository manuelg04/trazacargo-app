type UserRole = 'DRIVER' | 'DISPATCHER' | 'ADMIN';
type NotificationData = {
  type?: unknown;
  tripId?: unknown;
};

export function getNotificationNavigationTarget(data: NotificationData | undefined, role: UserRole | undefined) {
  if (!role) {
    return '/';
  }

  const tripId = typeof data?.tripId === 'string' ? data.tripId : undefined;

  switch (data?.type) {
    case 'new_trip_available':
      return role === 'DRIVER'
        ? tripId
          ? { pathname: '/(driver)/trip/[tripId]', params: { tripId } }
          : '/(driver)/offers'
        : getRoleHome(role);
    case 'trip_accepted':
    case 'driver_document_uploaded':
    case 'documentation_complete':
      return role === 'DISPATCHER' || role === 'ADMIN'
        ? tripId
          ? { pathname: '/(dispatcher)/trip/[tripId]', params: { tripId } }
          : '/(dispatcher)/dashboard'
        : getRoleHome(role);
    case 'document_reviewed':
    case 'company_document_available':
    case 'document_due_soon':
      return role === 'DRIVER'
        ? tripId
          ? { pathname: '/(driver)/trip/[tripId]', params: { tripId } }
          : '/(driver)/trips'
        : getRoleHome(role);
    case 'trip_cancelled':
      return role === 'DRIVER' ? '/(driver)/trips' : getRoleHome(role);
    case 'offer_no_longer_available':
      return role === 'DRIVER' ? '/(driver)/offers' : getRoleHome(role);
    case 'document_overdue':
      if (role === 'DRIVER') {
        return tripId ? { pathname: '/(driver)/trip/[tripId]', params: { tripId } } : '/(driver)/trips';
      }

      return tripId ? { pathname: '/(dispatcher)/trip/[tripId]', params: { tripId } } : '/(dispatcher)/dashboard';
    default:
      return getRoleHome(role);
  }
}

function getRoleHome(role: UserRole) {
  return role === 'DRIVER' ? '/(driver)/offers' : '/(dispatcher)/dashboard';
}
