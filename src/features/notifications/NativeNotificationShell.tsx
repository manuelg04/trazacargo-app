import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useCurrentProfile } from '@/src/features/auth/useCurrentProfile';
import { getNotificationNavigationTarget } from './notificationNavigation';
import { usePushNotificationRegistration } from './usePushNotificationRegistration';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function NativeNotificationShell() {
  const router = useRouter();
  const { currentProfile } = useCurrentProfile();

  usePushNotificationRegistration(currentProfile);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const target = getNotificationNavigationTarget(
        response.notification.request.content.data,
        currentProfile?.profile?.role,
      );

      router.push(target as never);
    });

    return () => {
      subscription.remove();
    };
  }, [currentProfile?.profile?.role, router]);

  return null;
}
