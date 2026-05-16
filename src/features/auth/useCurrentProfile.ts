import { useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export function useCurrentProfile() {
  const auth = useConvexAuth();
  const currentProfile = useQuery(api.users.getCurrentUserProfile, auth.isAuthenticated ? {} : 'skip');

  return {
    ...auth,
    currentProfile,
    isProfileLoading: auth.isAuthenticated && currentProfile === undefined,
  };
}
