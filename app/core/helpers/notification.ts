import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';

import { TNotificationConfig, TResponse } from '@/core/types/common';
import { consoleClors } from '@/core/constants/colors';
import { TNotifications } from '@/core/context/NotificationsContext';
import { postNotificationsSubscription } from '@/core/services/user';
import { handleServiceResult } from '@/core/services/handler';
import {
  getNotifSubscrDataFromSecureStore,
  saveNotifSubscrDataInSecureStore,
} from '@/core/helpers/store';

const { cyan, green, gray, reset } = consoleClors;

const handleRegistrationError = (errorMessage: string) => {
  console.error(errorMessage);
  throw new Error(errorMessage);
};

type TSaveSubResultData = {
  success: boolean;
};
export const saveSubscriptionInDb = async ({
  token,
  userId,
  expoPushToken,
}: {
  token: string;
  userId: string;
  expoPushToken: string;
}): Promise<TResponse<TSaveSubResultData>> => {
  // check whether the expo token saved in the storage
  const storeRes = await getNotifSubscrDataFromSecureStore();
  if (storeRes.data?.expoPushToken === expoPushToken) {
    // token from storage is valid, nothing to save
    return { data: { success: true }, error: null };
  }

  // save token in storage
  const saveRes = await saveNotifSubscrDataInSecureStore({ expoPushToken });
  if (saveRes.error) console.error(saveRes.error);

  try {
    const result = await postNotificationsSubscription({
      expoPushToken,
      token,
      userId,
    });
    return handleServiceResult<TSaveSubResultData>({
      result,
      errorMsg: 'Could not save subscription in db',
    });
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message },
    };
  }
};

/**
 * Handles the registration process for push notifications.
 * @param {TNotifications} Notifications - is used to interact with the notification system of the device and manage push notifications.
 * @returns a `Promise` that resolves to a `string` (the Expo push token) or `undefined`.
 */
export const registerService = async ({
  token,
  userId,
  Notifications,
}: {
  token: string;
  userId: string;
  Notifications: TNotifications;
}): Promise<string | undefined> => {
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      handleRegistrationError(
        'Permission not granted to get push token for push notification!'
      );
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError('Project ID not found');
    }
    try {
      const expoPushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (expoPushToken) {
        // save token to db
        const result = await saveSubscriptionInDb({
          token,
          userId,
          expoPushToken,
        });

        console.info(
          `${green}%s${reset}`,
          `Push notifications service is ready`
        );
      }

      return expoPushToken;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
};

/**
 * Sends a push notification using Expo's push notification service with
 * the provided configuration and Expo push token.
 */
export const sendPushNotification = async ({
  config,
  expoPushToken,
}: {
  config: TNotificationConfig;
  expoPushToken: string;
}) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: config.title,
    body: config.body,
    data: config.data,
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};
