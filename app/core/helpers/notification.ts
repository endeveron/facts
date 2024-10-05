import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  API_BASE_URL,
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
} from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { consoleClors } from '@/core/constants/colors';
import { factActions } from '@/core/constants/facts';
import { writeLog } from '@/core/context/LoggingProvider';
import { logMessage } from '@/core/helpers/misc';
import {
  getNotifScheduleFromAsyncStorage,
  getNotifSubscrDataFromSecureStore,
  removeNotifScheduleFromAsyncStorage,
  saveNotifScheduleInAsyncStorage,
} from '@/core/helpers/store';
import { deleteSchedule, postSchedule } from '@/core/services/notifications';
import { postNotificationsSubscription } from '@/core/services/users';
import { TNotificationConfig, TResponse } from '@/core/types/common';
import { TNotification } from '@/core/types/notification';
import { TaskManagerTaskExecutor } from 'expo-task-manager';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

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
    writeLog(
      `New notification: [ ${notification.request.content.title} ] ${notification.request.content.body}`,
      'success'
    );
  } else {
    const dataStr = JSON.stringify(notification.request.content.data);
    console.info(
      `${cyan}%s${yellow}%s${reset}`,
      `New data-only notification `,
      `${dataStr}`
    );
    writeLog(`New data-only notification: ${dataStr}`, 'success');
  }
};

/**
 * Handles the behavior of notifications received when the app is in the foreground.
 * @param notification - an object that represents the notification and contains
 * information such as the title, body, data payload, and other relevant details of the notification.
 * @returns An object is being returned with three properties: shouldShowAlert, shouldPlaySound, and shouldSetBadge, each with a boolean value.
 */
export const handleForegroundNotification = async (
  notification: Notifications.Notification
): Promise<Notifications.NotificationBehavior> => {
  logMessage(
    `Foreground notification data: ${JSON.stringify(
      notification.request.content.data
    )}`
  );
  return {
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  };
};

/**
 * Handles the behavior when notifications are received while the app is in the background.
 */
export const handleNotificationBackgroundTask: TaskManagerTaskExecutor = ({
  data,
  error,
  executionInfo,
}) => {
  if (error) {
    logMessage(`Background task doesn't ran ${error?.message || ''}`, 'error');
  }
  if (data) {
    logMessage(`Background task successfully ran`, 'success');
  }
};

export const handleNotificationClick = (
  response: Notifications.NotificationResponse
) => {
  console.info(`${cyan}%s${reset}`, '[T] User tapped notification');

  const actionIdentifier = response.actionIdentifier;
  const content = response.notification.request.content;
  const trigger = response.notification.request.trigger;

  console.info(
    `${cyan}%s${yellow}%s${reset}`,
    '[T] actionIdentifier ',
    actionIdentifier
  );
  console.info(`${cyan}%s${gray}%s${reset}`, '[T] content ', content);
  console.info(`${cyan}%s${gray}%s${reset}`, '[T] trigger ', trigger);

  writeLog(`[T] User tapped notification`, 'success');
  writeLog(`[T] actionId: ${actionIdentifier}`);
  writeLog(`[T] content: ${JSON.stringify(content)}`);
  writeLog(`[T] trigger: ${JSON.stringify(trigger)}`);

  // Handle different actions based on the identifier
  switch (response.actionIdentifier) {
    case 'first':
      writeLog(`[T] First button clicked`, 'success');
      break;
    case 'second':
      writeLog(`[T] Second button clicked`, 'success');
      break;
    default:
      writeLog(`[T] Default action`, 'success');
  }

  // if (response.actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER)
  //   console.info(`${cyan}%s${reset}`, 'User tapped notification');

  //   // // Handle different actions based on the identifier
  //   // switch (response.actionIdentifier) {
  //   //   case 'chat':
  //   //     // Open chat screen
  //   //     break;
  //   //   case 'profile':
  //   //     // Open profile screen
  //   //     break;
  //   //   default:
  //   //     // Handle unknown actions
  //   // }
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
      logMessage('Push notification successfully sent', 'success');
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
export const saveSubscription = async ({
  token,
  userId,
  expoPushToken,
}: {
  token: string;
  userId: string;
  expoPushToken: string;
}): Promise<TResponse<TSaveSubResultData>> => {
  // check if the subscription already saved in the storage
  const storeRes = await getNotifSubscrDataFromSecureStore();
  if (storeRes.data?.expoPushToken === expoPushToken) {
    // token from storage is valid, nothing to save
    return { data: { success: true }, error: null };
  }

  try {
    const result = await postNotificationsSubscription({
      expoPushToken,
      token,
      userId,
    });

    if (result.error) {
      console.error(result.error.message);
      writeLog(result.error.message, 'error');
      return {
        data: null,
        error: { message: result.error.message },
      };
    }
    if (result.data) {
      return {
        data: result.data,
        error: null,
      };
    }

    let errorMsg = 'Unable to save subscription';
    console.error(errorMsg);
    writeLog(errorMsg, 'error');
    return {
      data: null,
      error: { message: errorMsg },
    };
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

const saveNotificationSchedule = async ({
  schedule,
  token,
  userId,
}: {
  schedule: string;
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // save in db
  const dbRes = await postSchedule({ schedule, token, userId });
  if (dbRes.error) {
    logMessage(dbRes.error.message, 'error');
    return { data: { success: false }, error: dbRes.error };
  }
  logMessage('Notifications schedule saved in db', 'success');

  // save in store
  const storeRes = await saveNotifScheduleInAsyncStorage(schedule);
  if (storeRes.error) {
    logMessage(storeRes.error.message, 'error');
    return { data: { success: false }, error: storeRes.error };
  }
  logMessage('Notifications schedule saved in storage', 'success');

  return {
    data: { success: true },
    error: null,
  };
};

const deleteNotificationSchedule = async ({
  schedule,
  token,
  userId,
}: {
  schedule: string;
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // delete from db
  const dbRes = await deleteSchedule({ schedule, token, userId });
  if (dbRes.error) {
    logMessage(dbRes.error.message, 'error');
    return { data: { success: false }, error: dbRes.error };
  }
  logMessage('Notifications schedule removed from db', 'success');

  // remove from store
  await removeNotifScheduleFromAsyncStorage();
  logMessage('Notifications schedule removed from storage', 'success');

  return {
    data: { success: true },
    error: null,
  };
};

export const scheduleNotification = async ({
  hour,
  minute,
  token,
  userId,
}: {
  hour: number;
  minute: number;
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // create schedule
  const hours = hour.toString().padStart(2, '0');
  const minutes = minute.toString().padStart(2, '0');
  const schedule = hours + minutes; // format: 0800

  // dev: clean storage
  // await AsyncStorage.removeItem(KEY_NOTIF_SCHEDULE);

  // check if the schedule saved in the storage
  const storeRes = await getNotifScheduleFromAsyncStorage();
  if (storeRes.data && storeRes.data === schedule) {
    // schedule from the storage is relevant, nothing to save
    return { data: { success: true }, error: null };
  }

  const defaultErrMsg = 'Unable to schedule notification';

  try {
    // schedule a push notification
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

    await saveNotificationSchedule({ schedule, token, userId });

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? defaultErrMsg,
      },
    };
  }
};

export const unscheduleNotification = async ({
  token,
  userId,
}: {
  token: string;
  userId: string;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // check if the schedule saved in the storage
  const storeRes = await getNotifScheduleFromAsyncStorage();
  if (storeRes.data === null) {
    // nothing to unschedule
    return { data: { success: true }, error: null };
  }

  const schedule = storeRes.data;
  const defaultErrMsg = 'Unable to unschedule notification';

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await deleteNotificationSchedule({ schedule, token, userId });
    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? defaultErrMsg,
      },
    };
  }
};

const handleRegistrationError = (errorMessage: string) => {
  console.error(errorMessage);
  logMessage(
    `Push notification service registration error: ${errorMessage}`,
    'error'
  );
  throw new Error(errorMessage);
};

/**
 * Handles the registration process for push notifications.
 * @param {TNotifications} Notifications - is used to interact with the notification system of the device and manage push notifications.
 * @returns a `Promise` that resolves to a `string` (the Expo push token) or `undefined`.
 */
export const registerPushNotificationService = async ({
  token,
  userId,
}: // Notifications,
{
  token: string;
  userId: string;
  // Notifications: TNotifications;
}): Promise<string | undefined> => {
  if (Platform.OS === 'android') {
    // register background task
    await Notifications.registerTaskAsync(NOTIFICATION_BACKGROUND_TASK);

    // set up notification chanel
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // set up notification category 'fact'
    // using the same category as in `registerForPushNotificationsAsync`
    await Notifications.setNotificationCategoryAsync('fact', factActions);
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
        // save subscription
        const result = await saveSubscription({
          token,
          userId,
          expoPushToken,
        });

        if (result.error) {
          logMessage(result.error.message, 'error');
        } else {
          logMessage('Push notifications service is ready', 'success');
        }
      }

      return expoPushToken;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError('Must use physical device for push notifications');
  }
};
