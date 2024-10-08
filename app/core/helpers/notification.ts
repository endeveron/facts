import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  API_BASE_URL,
  HOUR,
  MINUTE,
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
  getNotifSubFromSecureStore,
  saveNotifSubInSecureStore,
  saveNotifSubIsFetchedInAsyncStorage,
} from '@/core/helpers/store';
import {
  patchSubscription,
  postSubscription,
} from '@/core/services/notifications';
import { TNotificationConfig, TResponse } from '@/core/types/common';
import {
  TNotification,
  TNotificationSubscription,
} from '@/core/types/notification';
import { TaskManagerTaskExecutor } from 'expo-task-manager';

const { cyan, green, gray, yellow, reset } = consoleClors;

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

export const getSchedulrTime = () => {
  const hours = HOUR.toString().padStart(2, '0');
  const minutes = MINUTE.toString().padStart(2, '0');
  return { hours, minutes };
};

export const configureSchedule = (): string => {
  const { hours, minutes } = getSchedulrTime();
  return hours + minutes; // format: 0800
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
    `[ NL ] Foreground notification data: ${JSON.stringify(
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
    logMessage(
      `[ BT ] background task doesn't ran ${error?.message || ''}`,
      'error'
    );
  }
  if (data) {
    logMessage(`[ BT ] background task ran`, 'success');
  }
};

export const handleNotificationClick = (
  response: Notifications.NotificationResponse
) => {
  console.info(`${cyan}%s${reset}`, '[ HN ] notification handler');

  const actionIdentifier = response.actionIdentifier;
  const content = response.notification.request.content;
  const trigger = response.notification.request.trigger;

  console.info(
    `${cyan}%s${yellow}%s${reset}`,
    '[ NR ] actionId ',
    actionIdentifier
  );
  console.info(`${cyan}%s${gray}%s${reset}`, '[ NR ] content ', content);
  console.info(`${cyan}%s${gray}%s${reset}`, '[ NR ] trigger ', trigger);

  writeLog(`[ NR ] User tapped notification`, 'success');
  writeLog(`[ NR ] actionId: ${actionIdentifier}`);
  writeLog(`[ NR ] content: ${JSON.stringify(content)}`);
  writeLog(`[ NR ] trigger: ${JSON.stringify(trigger)}`);

  // Handle different actions based on the identifier
  switch (response.actionIdentifier) {
    case 'first':
      writeLog(`[ NA ] first button clicked`, 'success');
      break;
    case 'second':
      writeLog(`[ NA ] second button clicked`, 'success');
      break;
    default:
      writeLog(`[ NA ] default action`, 'error');
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

export const saveSubscription = async ({
  token,
  userId,
  subscription,
  subscrSource,
}: {
  token: string;
  userId: string;
  subscription: TNotificationSubscription;
  subscrSource: string | null;
}): Promise<TResponse<{ subscription: TNotificationSubscription }>> => {
  logMessage('[ NS ] service registered, saving subscription');
  const errors: string[] = [];

  const saveSubscrInStore = async () => {
    const resData = await saveNotifSubInSecureStore(subscription);
    if (resData.error) {
      errors.push(resData.error.message);
    } else {
      logMessage('[ NS ] subscription saved in store');
    }
  };

  const createSubscrInDatabase = async () => {
    const resData = await postSubscription({
      subscription,
      token,
      userId,
    });
    if (resData.error) {
      errors.push(resData.error.message);
    } else {
      logMessage('[ NS ] subscription created in db');
    }
  };

  const updateSubscrInDatabase = async () => {
    const resData = await patchSubscription({
      subscription,
      token,
      userId,
    });
    if (resData.error) {
      errors.push(resData.error.message);
    }
    logMessage('[ NS ] subscription updated in db');
  };

  switch (subscrSource) {
    case null:
      {
        await saveSubscrInStore();
        await createSubscrInDatabase();
      }
      break;
    case 'store':
      await updateSubscrInDatabase();
      break;
    case 'db':
      await saveSubscrInStore();
      break;
    default: {
      return {
        data: null,
        error: { message: 'Invalid subscription source' },
      };
    }
  }

  if (errors.length) {
    const message = errors.join('. ');
    logMessage(message, 'error');
    return {
      data: null,
      error: { message },
    };
  } else {
    // save
    await saveNotifSubIsFetchedInAsyncStorage(true);
  }

  return {
    data: { subscription },
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
  const schedule = configureSchedule();
  let subscription: TNotificationSubscription;

  try {
    // schedule push notification
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
      logMessage(`[ NS ] unable to scedule notification`, 'error');
      return {
        data: { success: false },
        error: { message: 'Unable to get notification id' },
      };
    }

    const { hours, minutes } = getSchedulrTime();
    logMessage(`[ NS ] notification scheduled for ${hours}:${minutes}`);

    // get subscription from store
    const storeRes = await getNotifSubFromSecureStore();
    if (storeRes.error) {
      logMessage(`[ NS ] subscription: ${storeRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: storeRes.error.message,
        },
      };
    }

    if (!storeRes.data) {
      logMessage(`[ NS ] subscription: unable to get data from store`, 'error');
      return {
        data: { success: false },
        error: {
          message: 'Unable to get data from store',
        },
      };
    }

    // update
    subscription = storeRes.data;
    subscription.isActive = true;
    subscription.schedule = schedule;

    // save subscription in store
    const saveRes = await saveNotifSubInSecureStore(subscription);
    if (saveRes.error) {
      logMessage(`[ NS ] subscription: ${saveRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: saveRes.error.message,
        },
      };
    }
    logMessage(`[ NS ] subscription updated in store`);

    // save subscription in db
    const dbRes = await patchSubscription({
      subscription,
      token,
      userId,
    });

    if (dbRes.error) {
      logMessage(`[ NS ] subscription: ${dbRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: dbRes.error.message,
        },
      };
    }

    if (!dbRes.data) {
      logMessage(`[ NS ] subscription: unable to save data in db`, 'error');
      return {
        data: { success: false },
        error: {
          message: 'Unable to save data in db',
        },
      };
    }

    logMessage(`[ NS ] subscription updated in db`);

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? 'Unable to schedule notification',
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
  try {
    const storeRes = await getNotifSubFromSecureStore();
    if (storeRes.error) {
      logMessage(`[ NS ] unschedule: ${storeRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: storeRes.error.message,
        },
      };
    }

    if (!storeRes.data) {
      logMessage(`[ NS ] unschedule: unable to get data from store`, 'error');
      return {
        data: { success: false },
        error: {
          message: 'Unable to get data from store',
        },
      };
    }

    // cancel subscription
    const subscription = storeRes.data;
    subscription.isActive = false;
    subscription.schedule = null;

    await Notifications.cancelAllScheduledNotificationsAsync();
    logMessage(`[ NS ] subscription canceled`);

    // save subscription to store
    const saveRes = await saveNotifSubInSecureStore(subscription);
    if (saveRes.error) {
      logMessage(
        `[ NS ] cancel subscription: ${saveRes.error.message}`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: saveRes.error.message,
        },
      };
    }
    logMessage(`[ NS ] subscription updated in store`);

    const dbRes = await patchSubscription({
      subscription,
      token,
      userId,
    });

    if (dbRes.error) {
      logMessage(`[ NS ] cancel subscription: ${dbRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: dbRes.error.message,
        },
      };
    }

    if (!dbRes.data) {
      logMessage(
        `[ NS ] cancel subscription: unable to save data in db`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: 'Unable to save data in db',
        },
      };
    }
    logMessage(`[ NS ] subscription updated in db`);

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(error);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? 'Could not cancel subscription',
      },
    };
  }
};

const handleRegistrationError = (errorMessage: string) => {
  logMessage(
    `Push notification service registration error: ${errorMessage}`,
    'error'
  );
  return {
    data: null,
    error: {
      message: errorMessage,
    },
  };
};

/**
 * Handles the registration process for push notifications.
 * @param {TNotifications} Notifications - is used to interact with the notification system of the device and manage push notifications.
 * @returns a `Promise` that resolves to a `string` (the Expo push token) or `undefined`.
 */
export const registerPushNotificationService = async ({
  token,
  userId,
  subscription,
  subscrSource,
}: {
  token: string;
  userId: string;
  subscription: TNotificationSubscription | null;
  subscrSource: string | null;
}): Promise<
  | TResponse<{
      subscription: TNotificationSubscription;
    }>
  | undefined
> => {
  let expoPushToken = null;

  // init subscription
  subscription = subscription ?? {
    expoPushToken,
    isActive: true,
    schedule: configureSchedule(),
  };

  try {
    if (Platform.OS === 'android') {
      // register background task
      logMessage('[ NS ] register notification background task');
      await Notifications.registerTaskAsync(NOTIFICATION_BACKGROUND_TASK);

      // set up notification chanel
      logMessage('[ NS ] set up notification chanel');
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // set up notification category 'fact'
      // using the same category as in `registerForPushNotificationsAsync`
      logMessage('[ NS ] set up notification category');
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
        return handleRegistrationError(
          'Permission not granted to get push token'
        );
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        return handleRegistrationError('Project ID not found');
      }

      expoPushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (expoPushToken) {
        logMessage('[ NS ] generated expo push token');
        subscription.expoPushToken = expoPushToken;
        // save subscription
        const subRes = await saveSubscription({
          token,
          userId,
          subscription,
          subscrSource,
        });

        if (subRes.error) {
          return handleRegistrationError(subRes.error.message);
        } else {
          logMessage('[ NS ] notification service is ready', 'success');
        }
      }

      return {
        data: { subscription },
        error: null,
      };
    }
  } catch (error: any) {
    return handleRegistrationError(
      error?.message ?? 'Unable to register service'
    );
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
