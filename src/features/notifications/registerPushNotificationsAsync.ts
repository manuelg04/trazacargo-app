import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type PushRegistrationResult = {
  expoPushToken: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
  projectId?: string;
  appOwnership?: string;
  deviceName?: string;
};

export async function registerPushNotificationsAsync(): Promise<PushRegistrationResult | null> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('viajes', {
        name: 'Viajes',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }

    const existingPermissions = await Notifications.getPermissionsAsync();
    const finalPermissions =
      existingPermissions.status === 'granted'
        ? existingPermissions
        : await Notifications.requestPermissionsAsync();

    if (finalPermissions.status !== 'granted') {
      return null;
    }

    const projectId = getProjectId();

    if (!projectId) {
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });

    return {
      expoPushToken: token.data,
      platform: getPlatform(),
      projectId,
      appOwnership: Constants.appOwnership ?? undefined,
      deviceName: getDeviceName(),
    };
  } catch {
    return null;
  }
}

function getProjectId() {
  return Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
}

function getPlatform() {
  if (Platform.OS === 'ios' || Platform.OS === 'android' || Platform.OS === 'web') {
    return Platform.OS;
  }

  return 'unknown';
}

function getDeviceName() {
  const constantsWithDeviceName = Constants as typeof Constants & { deviceName?: string };
  return constantsWithDeviceName.deviceName;
}
