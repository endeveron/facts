import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  API_BASE_URL,
  HOUR,
  MINUTE,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
} from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { consoleClors } from '@/core/constants/colors';
import { TNotifications } from '@/core/context/PushNotificationsContext';
import {
  getNotifScheduleFromAsyncStorage,
  getNotifSubscrDataFromSecureStore,
  saveNotifScheduleInAsyncStorage,
  saveNotifSubscrDataInSecureStore,
} from '@/core/helpers/store';
import { handleServiceResult } from '@/core/services/handler';
import { postNotificationsSubscription } from '@/core/services/user';
import { TNotificationConfig, TResponse } from '@/core/types/common';
import { TNotification } from '@/core/types/notification';
import { TaskManagerTaskExecutor } from 'expo-task-manager';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

export const handleBackgroundNotification: TaskManagerTaskExecutor = ({
  data,
  error,
  // executionInfo,
}) => {
  if (error) console.error(error);
  if (data) console.log('Background Notification', data);
};

export const logNotificationData = (
  notification: Notifications.Notification
) => {
  const content = notification.request.content;
  if (content.title && content.body) {
    console.info(
      `${cyan}%s${green}%s${reset}`,
      `New notification `,
      `[ ${notification.request.content.title} ] ${notification.request.content.body}`
    );
  } else {
    const dataStr = JSON.stringify(notification.request.content.data);
    console.info(
      `${cyan}%s${yellow}%s${reset}`,
      `New data-only notification `,
      `${dataStr}`
    );
  }
};

export const handleNotificationClick = (
  response: Notifications.NotificationResponse
) => {
  if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER) {
    console.info(`${cyan}%s${reset}`, 'User tapped notification');

    console.log('content', response.notification.request.content);
    // console.log('trigger', response.notification.request.trigger);

    // const data = response.notification.request.content.data;
    // if (data) {
    //   router.replace({
    //     pathname: '/facts',
    //     params: { nextItemId: data.nextItemId },
    //   });
    // }
  }
};

export const sendPushNotification = async ({
  notification,
  userId,
  token,
}: {
  notification: TNotification;
  userId: string;
  token: string;
}): Promise<TResponse<{ success: boolean }>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ...commonHeaders,
      },
      body: JSON.stringify({
        notification,
        userId,
      }),
    });
    if (!response.ok) {
      return { data: null, error: { message: 'Unable to send.' } };
    }
    const result = await response.json();
    if (result?.data?.tickets?.length) {
      console.info(`${green}%s${reset}`, `Push notification successfully sent`);
    }
    return { data: result.data, error: null };
  } catch (err: any) {
    console.error(err);
    return { data: null, error: { message: err.message } };
  }
};

/**
 * Sends a push notification using Expo's push notification service with
 * the provided configuration and Expo push token.
 */
export const sendPushNotificationUsingExpo = async ({
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

// /**
//  * Retrieves a fact data from AsyncStorage and updates the
//  * body of the notification with the fact's title if available
//  * @returns An object with `title` and `body` properties
//  */
// const getNextFactItemData = async () => {
//   const result = await getNextFactFromAsyncStorage();
//   if (result.error) console.error(result.error.message);
//   return {
//     title: NOTIFICATION_REMINDER_TITLE,
//     body: result.data?.title ?? NOTIFICATION_REMINDER_BODY,
//   };
// };

// export const cancelAllScheduledNotifications = async () => {
//   await Notifications.cancelAllScheduledNotificationsAsync();
//   console.info(`${green}%s${reset}`, `All scheduled notifications canceled`);
// };

export const scheduleReminderNotification = async ({
  hour,
  minute,
}: {
  hour: number;
  minute: number;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // check if the schedule saved in the storage
  const storeRes = await getNotifScheduleFromAsyncStorage();
  if (
    storeRes.data &&
    storeRes.data.hour === hour &&
    storeRes.data?.minute === minute
  ) {
    // schedule from the storage is relevant, nothing to save
    return { data: { success: true }, error: null };
  }

  const defaultErrMsg = 'Unable to schedule a push notification';

  // schedule a push notification
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: NOTIFICATION_REMINDER_TITLE,
        body: NOTIFICATION_REMINDER_BODY,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    if (!notificationId) {
      return {
        data: { success: false },
        error: { message: defaultErrMsg },
      };
    }

    await saveNotifScheduleInAsyncStorage({ hour, minute });

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? 'Unable to schedule a push notification',
      },
    };
  }
};

const handleRegistrationError = (errorMessage: string) => {
  console.error(errorMessage);
  throw new Error(errorMessage);
};

/**
 * Handles the registration process for push notifications.
 * @param {TNotifications} Notifications - is used to interact with the notification system of the device and manage push notifications.
 * @returns a `Promise` that resolves to a `string` (the Expo push token) or `undefined`.
 */
export const registerPushNotificationsService = async ({
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

        if (result.error) {
          console.info(`${red}%s${reset}`, result.error.message);
        } else {
          console.info(
            `${green}%s${reset}`,
            `Push notifications service is ready`
          );
        }

        await scheduleReminderNotification({ hour: HOUR, minute: MINUTE });
      }

      return expoPushToken;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
};
