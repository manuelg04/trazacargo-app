import { useMutation } from 'convex/react';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { api } from '@/convex/_generated/api';
import { registerPushNotificationsAsync } from './registerPushNotificationsAsync';

type CurrentProfile = {
  profile: {
    _id: string;
    role: 'DRIVER' | 'DISPATCHER' | 'ADMIN';
    status: 'ACTIVE' | 'DISABLED';
  } | null;
} | null | undefined;

export function usePushNotificationRegistration(currentProfile: CurrentProfile) {
  const registerToken = useMutation(api.pushTokens.registerForCurrentProfile);
  const registeredKeysRef = useRef(new Set<string>());
  const activeProfile = currentProfile?.profile?.status === 'ACTIVE' ? currentProfile.profile : null;

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    if (!activeProfile) {
      return;
    }

    let isMounted = true;
    const profile = activeProfile;

    async function registerCurrentToken() {
      const result = await registerPushNotificationsAsync();

      if (!isMounted || !result) {
        return;
      }

      await registerTokenIfNeeded(result.expoPushToken, result);
    }

    async function registerTokenIfNeeded(
      expoPushToken: string,
      metadata: Awaited<ReturnType<typeof registerPushNotificationsAsync>>,
    ) {
      if (!metadata) {
        return;
      }

      const key = `${profile._id}:${expoPushToken}`;

      if (registeredKeysRef.current.has(key)) {
        return;
      }

      registeredKeysRef.current.add(key);

      try {
        await registerToken({
          expoPushToken,
          platform: metadata.platform,
          projectId: metadata.projectId,
          appOwnership: metadata.appOwnership,
          deviceName: metadata.deviceName,
        });
      } catch {
        registeredKeysRef.current.delete(key);
      }
    }

    registerCurrentToken();

    const addPushTokenListener = (Notifications as typeof Notifications & {
      addPushTokenListener?: (listener: (token: { data?: string } | string) => void) => { remove: () => void };
    }).addPushTokenListener;
    const subscription = addPushTokenListener?.((token) => {
      const expoPushToken = typeof token === 'string' ? token : token.data;

      if (!expoPushToken) {
        return;
      }

      registerTokenIfNeeded(expoPushToken, {
        expoPushToken,
        platform: 'unknown',
      });
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [activeProfile, registerToken]);
}
