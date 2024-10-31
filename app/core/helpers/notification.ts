import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import {
  API_BASE_URL,
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
  NOTIFICATION_TIME_SHIFT,
} from '@/core/constants';
import { commonHeaders } from '@/core/constants/api';
import { consoleClors } from '@/core/constants/colors';
import { factActions } from '@/core/constants/facts';
import { getTimeFromNow, logMessage, wait } from '@/core/helpers/misc';
import {
  getNotifSubFetchedFromAsyncStorage,
  getNotifSubFromSecureStore,
  saveNotifSubFetchedInAsyncStorage,
  saveNotifSubInSecureStore,
} from '@/core/helpers/store';
import {
  patchSubscription,
  postSubscription,
} from '@/core/services/notifications';
import { TAuthData } from '@/core/types/auth';
import { TNotificationConfig, TResponse, TStatus } from '@/core/types/common';
import {
  TNotification,
  TNotificationSubscription,
} from '@/core/types/notification';
import { TaskManagerTaskExecutor } from 'expo-task-manager';
import { Alert, Linking } from 'react-native';

export const logNotificationData = async (
  notification: Notifications.Notification
) => {
  try {
    const content = notification.request.content;
    if (content.title && content.body) {
      const title = notification.request.content.title;
      const body = notification.request.content.body;
      await logMessage(
        `[ NL ] new notification [ ${title} ] ${body}`,
        'warning'
      );
    } else {
      const dataStr = JSON.stringify(notification.request.content.data);
      await logMessage(
        `[ NL ] new data-only notification: ${dataStr}`,
        'warning'
      );
    }
  } catch (error: any) {
    console.error(`logNotificationData ${error}`);
  }
};

export const getScheduleTime = () => {
  const { hour, minute } = getTimeFromNow(NOTIFICATION_TIME_SHIFT);
  const hours = hour.toString().padStart(2, '0');
  const minutes = minute.toString().padStart(2, '0');
  return { hours, minutes };
};

export const createScheduleString = (): string => {
  const { hours, minutes } = getScheduleTime();
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
): Promise<Notifications.NotificationBehavior> => ({
  shouldShowAlert: true,
  shouldPlaySound: false,
  shouldSetBadge: false,
});

/**  Handles the behavior when notifications are received while the app is in the background. */
export const handleBackgroundNotification: TaskManagerTaskExecutor = async ({
  data,
  error,
  executionInfo,
}) => {
  if (error) {
    await logMessage(
      `[ BT ] background notification: ${error?.message || ''}`,
      'error'
    );
  }
  if (data) {
    await logMessage(
      `[ BT ] background notification data: ${JSON.stringify(data)}`
    );
  }
};

export const handleNotificationClick = async (
  response: Notifications.NotificationResponse
) => {
  await logMessage(`[ NR ] user tapped notification`, 'warning');

  // const actionIdentifier = response.actionIdentifier;
  // const content = response.notification.request.content;
  // const trigger = response.notification.request.trigger;
  // await logMessage(`[ NR ] actionId: ${actionIdentifier}`);
  // await logMessage(`[ NR ] content: ${JSON.stringify(content)}`);
  // await logMessage(`[ NR ] trigger: ${JSON.stringify(trigger)}`);

  // Handle different actions based on the identifier
  switch (response.actionIdentifier) {
    case 'first':
      await logMessage(`[ NA ] first button clicked`, 'success');
      break;
    case 'second':
      await logMessage(`[ NA ] second button clicked`, 'success');
      break;
    // default:
    //   await logMessage(`[ NA ] default action`, 'warning');
  }
};

export const sendPushNotification = async ({
  notification,
  userId,
  token,
}: TAuthData & {
  notification: TNotification;
}): Promise<TResponse<TStatus>> => {
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
      if (response.status === 401) {
        return { data: null, error: { message: 'unauthenticated' } };
      }
      return { data: null, error: { message: 'unable to send.' } };
    }
    const result = await response.json();
    if (result?.data?.tickets?.length) {
      await logMessage('Push notification successfully sent', 'success');
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
}: // subscrSource,
TAuthData & {
  subscription: TNotificationSubscription;
  // subscrSource: string | null;
}): Promise<TResponse<{ subscription: TNotificationSubscription }>> => {
  const errors: string[] = [];

  try {
    const saveSubscrInStore = async () => {
      const resData = await saveNotifSubInSecureStore(subscription);
      if (resData.error) {
        errors.push(resData.error.message);
      } else {
        await logMessage('[ NS ] subscription saved in store');
      }
    };

    const saveSubscrInRemoteDb = async () => {
      const resData = await postSubscription({
        subscription,
        token,
        userId,
      });
      if (resData.error) {
        errors.push(resData.error.message);
      } else {
        await logMessage('[ NS ] subscription saved in db');
      }
    };

    await saveSubscrInStore();
    await saveSubscrInRemoteDb();

    if (errors.length) {
      const message = errors.join('. ');
      await logMessage(message, 'error');
      return {
        data: null,
        error: { message },
      };
    } else {
      await saveNotifSubFetchedInAsyncStorage();
      await logMessage('[ NS ] subscription created', 'success');
      return {
        data: { subscription },
        error: null,
      };
    }

    // const updateSubscrInDatabase = async () => {
    //   const resData = await patchSubscription({
    //     subscription,
    //     token,
    //     userId,
    //   });
    //   if (resData.error) {
    //     errors.push(resData.error.message);
    //   }
    //   await logMessage('[ NS ] subscription updated in db');
    // };

    // switch (subscrSource) {
    //   case null:
    //     {
    //       await saveSubscrInStore();
    //       await createSubscrInDatabase();
    //     }
    //     break;
    //   case 'store':
    //     await updateSubscrInDatabase();
    //     break;
    //   case 'db':
    //     await saveSubscrInStore();
    //     break;
    //   default: {
    //     return {
    //       data: null,
    //       error: { message: 'Invalid subscription source' },
    //     };
    //   }
    // }
  } catch (error: any) {
    console.error(error);
    return {
      data: null,
      error: { message: 'unable to save subscription' },
    };
  }
};

export const checkNotifPermissions = async (): Promise<boolean | null> => {
  try {
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        // notify user and provide a way to enable notifications
        Alert.alert(
          'Notification Permission',
          'Please allow app notifications in your settings',
          [
            {
              text: 'Go to Settings',
              onPress: () => {
                Linking.openSettings(); // for android
              },
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }

      await wait(2000);
      const { status: newStatus } = await Notifications.getPermissionsAsync();
      return newStatus === 'granted';
    }
    return null;
  } catch (error: any) {
    console.error(`askForNotifPermissions ${error}`);
    logMessage('unable to get notification permissions', 'error');
    return null;
  }
};

export const scheduleNotification = async ({
  hour,
  minute,
  token,
  userId,
}: TAuthData & {
  hour: number;
  minute: number;
}): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // - create schedule string
  // - schedule local notification
  // - get subscription from secure store
  // - update it and save in secure store
  // - update subscription in remote db

  let subscription: TNotificationSubscription;

  try {
    // create schedule string
    const schedule = createScheduleString();

    // schedule local notification (also with buttons)
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
      await logMessage(`[ NS ] unable to scedule notification`, 'error');
      return {
        data: { success: false },
        error: { message: 'unable to get notification id' },
      };
    }

    const { hours, minutes } = getScheduleTime();
    await logMessage(`[ NS ] notification scheduled for ${hours}:${minutes}`);

    // get subscription from store
    const storeRes = await getNotifSubFromSecureStore();
    if (storeRes.error) {
      await logMessage(
        `[ NS ] subscription: ${storeRes.error.message}`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: storeRes.error.message,
        },
      };
    }

    if (!storeRes.data) {
      await logMessage(
        `[ NS ] subscription: unable to get data from store`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: 'unable to get data from store',
        },
      };
    }

    // update subscription
    subscription = storeRes.data;
    subscription.isActive = true;
    subscription.schedule = schedule;

    // save subscription in secure store
    const saveRes = await saveNotifSubInSecureStore(subscription);
    if (saveRes.error) {
      await logMessage(
        `[ NS ] subscription: ${saveRes.error.message}`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: saveRes.error.message,
        },
      };
    }
    await logMessage(`[ NS ] subscription updated in store`);

    // update subscription in remote db
    const dbRes = await patchSubscription({
      subscription,
      token,
      userId,
    });

    if (dbRes.error) {
      await logMessage(`[ NS ] subscription: ${dbRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: dbRes.error.message,
        },
      };
    }

    if (!dbRes.data) {
      await logMessage(
        `[ NS ] subscription: unable to save data in db`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: 'Unable to save data in db',
        },
      };
    }

    await logMessage(`[ NS ] subscription updated in db`);

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(`scheduleNotification: ${error}`);
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
}: TAuthData): Promise<
  TResponse<{
    success: boolean;
  }>
> => {
  // - get subscription from secure store
  // - cancel it, update in store
  // - cancel all push- and locally scheduled notifications
  // - update subscription in remote db

  try {
    // get subscription from secure store
    const storeRes = await getNotifSubFromSecureStore();
    if (storeRes.error) {
      await logMessage(`[ NS ] unschedule: ${storeRes.error.message}`, 'error');
      return {
        data: { success: false },
        error: {
          message: storeRes.error.message,
        },
      };
    }

    if (!storeRes.data) {
      await logMessage(
        `[ NS ] unschedule: unable to get data from store`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: 'unable to get data from store',
        },
      };
    }

    // cancel subscription
    const subscription = storeRes.data;
    subscription.isActive = false;
    subscription.schedule = null;

    // save subscription to store
    const saveRes = await saveNotifSubInSecureStore(subscription);
    if (saveRes.error) {
      await logMessage(
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
    await logMessage(`[ NS ] subscription updated in store`);

    // cancel all push- and locally scheduled notifications
    const isResetSussess = await resetNotificationSubscriptions();
    if (isResetSussess) {
      await logMessage(`[ NS ] subscription canceled`, 'success');
    }

    // update subscription in remote db
    const dbRes = await patchSubscription({
      subscription,
      token,
      userId,
    });

    if (dbRes.error) {
      await logMessage(
        `[ NS ] cancel subscription: ${dbRes.error.message}`,
        'error'
      );
      return {
        data: { success: false },
        error: {
          message: dbRes.error.message,
        },
      };
    }

    if (!dbRes.data) {
      await logMessage(
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
    await logMessage(`[ NS ] subscription updated in db`);

    return {
      data: { success: true },
      error: null,
    };
  } catch (error: any) {
    console.error(`unscheduleNotification: ${error}`);
    return {
      data: { success: false },
      error: {
        message: error?.message ?? 'could not cancel subscription',
      },
    };
  }
};

const handleRegistrationError = async (errorMessage: string) => {
  await logMessage(`[ NS ] ${errorMessage}`, 'error');
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
}: TAuthData & {
  subscription: TNotificationSubscription | null;
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
    schedule: createScheduleString(),
  };

  try {
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
          'permission not granted to get push token'
        );
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        return handleRegistrationError('project id not found');
      }

      expoPushToken = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      if (expoPushToken) {
        await logMessage('[ NS ] generated expo push token');
        subscription.expoPushToken = expoPushToken;

        // register background task
        await logMessage('[ NS ] register notification background task');
        await Notifications.registerTaskAsync(NOTIFICATION_BACKGROUND_TASK);

        // set up notification chanel
        await logMessage('[ NS ] set up notification chanel');
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });

        // specify action buttons, set up notification category 'fact'
        // using the same category as in `registerForPushNotificationsAsync`
        await logMessage('[ NS ] set up notification category');
        await Notifications.setNotificationCategoryAsync('fact', factActions);

        // save subscription
        const subRes = await saveSubscription({
          token,
          userId,
          subscription,
          // subscrSource,
        });

        if (subRes.error) {
          return handleRegistrationError(subRes.error.message);
        } else {
          await logMessage('[ NS ] notification service is ready', 'success');
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

export const resetNotificationSubscriptions = async (): Promise<boolean> => {
  try {
    // cancel all push notifications, unsubscribe the user from receiving them.
    // local notifications can still be scheduled and triggered within the app
    await Notifications.unregisterForNotificationsAsync();
    await logMessage(`[ NS ] push notifications canceled`);

    // cancel all locally scheduled notifications.
    // push notifications can still be recieved, if the app is subscribed for them
    await Notifications.cancelAllScheduledNotificationsAsync();
    await logMessage(`[ NS ] local notifications canceled`);

    return true;
  } catch (error: any) {
    await logMessage('[ NS ] unable to clear subscriptions', 'error');
    console.error(`clearSubscriptions ${error}`);
    return false;
  }
};

export const logScheduledNotifications = async () => {
  try {
    const notifications: any =
      await Notifications.getAllScheduledNotificationsAsync();
    if (notifications && notifications.length) {
      await logMessage(`[ NS ] scheduled notifications:`);
      for (let data of notifications) {
        let time = '';
        let info = '';
        const hh = data?.trigger?.hour;
        const mm = data?.trigger?.minute;
        const hours = hh ? hh.toString().padStart(2, '0') : null;
        const minutes = mm ? mm.toString().padStart(2, '0') : null;
        const title = data?.content?.title;
        const body = data?.content?.body;
        if (hours && minutes) time = ` ${hours}:${minutes}`;
        if (title && body) info = ` [ ${title} ] ${body}`;
        if (time || info) {
          await logMessage(`[ NS ] -${time}${info}`);
        } else {
          const dataStr = JSON.stringify(data);
          await logMessage(`[ NS ] - ${dataStr}`);
        }
      }
    } else if (notifications) {
      await logMessage(`[ NS ] no scheduled notifications`);
    } else {
      await logMessage(`[ NS ] unable to get notifications`, 'error');
    }
  } catch (error: any) {
    await logMessage(`[ NS ] unable to get notifications`, 'error');
    console.error(`logScheduledNotifications ${error}`);
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
