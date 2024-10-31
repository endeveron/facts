import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import * as TaskManager from 'expo-task-manager';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_TIME_SHIFT,
} from '@/core/constants';
import { useSession } from '@/core/context/SessionProvider';
import { openNextFact } from '@/core/helpers/db/main';
import { getTimeFromNow, logMessage } from '@/core/helpers/misc';
import {
  checkNotifPermissions,
  handleBackgroundNotification,
  handleForegroundNotification,
  handleNotificationClick,
  logNotificationData,
  logScheduledNotifications,
  registerPushNotificationService,
  scheduleNotification,
  unscheduleNotification,
} from '@/core/helpers/notification';
import {
  getNotifSubFetchedFromAsyncStorage,
  getNotifSubFromSecureStore,
  saveNotifSubInSecureStore,
} from '@/core/helpers/store';
import { useToast } from '@/core/hooks/useToast';
import { getSubscription } from '@/core/services/notifications';
import { TNotificationSubscription } from '@/core/types/notification';

// define a task to handle the behavior when notifications are received when app is backgrounded
// needs to be called in the global scope
// ! background event listeners are not supported in Expo Go
TaskManager.defineTask(
  NOTIFICATION_BACKGROUND_TASK,
  handleBackgroundNotification
);

// handle the behavior when notifications are received when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: handleForegroundNotification,
});

type TNotificContextProps = {
  isSubscription: boolean;
  setIsSubscription: (value: boolean) => void;
  scheduleDailyNotification: () => Promise<void>;
  unscheduleDailyNotification: () => Promise<void>;
};

const NotificContext = createContext<TNotificContextProps>({
  isSubscription: false,
  setIsSubscription: () => {},
  scheduleDailyNotification: async () => {},
  unscheduleDailyNotification: async () => {},
});

export const useNotifications = () => {
  const value = useContext(NotificContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error(
        'useNotifications must be wrapped in a <NotificProvider />'
      );
    }
  }
  return value;
};

const NotificProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();
  const { showToast } = useToast();

  const [isSubscription, setIsSubscription] = useState(false);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const userId = session!.user.id;
  const token = session!.token;

  const registerService = async (
    subscription: TNotificationSubscription | null
  ) => {
    if (!token || !userId) return;

    try {
      // get the token for expo push notifications
      const serviceRes = await registerPushNotificationService({
        token,
        userId,
        subscription,
      });

      if (!serviceRes) {
        await logMessage(`[ NS ] service is not registered`);
      }

      if (serviceRes?.error) {
        await logMessage(serviceRes.error.message);
      }
      if (serviceRes?.data) {
        const expoPushToken = serviceRes.data.subscription.expoPushToken;
        const isSubActive = serviceRes.data.subscription.isActive;
        setIsSubscription(isSubActive);

        if (expoPushToken && isSubActive) {
          await scheduleDailyNotification();
        }
      }

      await logScheduledNotifications();

      // create a listener for recieved notifications
      notificationListener.current =
        Notifications.addNotificationReceivedListener(async (notification) => {
          await logNotificationData(notification);
        });

      // create a listener for notification click
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            await handleNotificationClick(response);
            await openNextFact(router);
          }
        );
    } catch (error: any) {
      await logMessage(error?.message ?? 'Unable to register service');
    }
  };

  const initService = async () => {
    const defaultErrorMsg = 'unable to handle subscription';

    try {
      await logMessage('[ NS ] start notification service');

      const loadSubscriptionDataFromStore = async () => {
        const result = await getNotifSubFromSecureStore();

        if (result.error) {
          await logMessage(`[ NS ] ${result.error.message}`, 'error');
          return;
        }
        if (!result || result.error) {
          showToast('Unable to get subscription state');
          return;
        }
        if (!result.data) return;

        await logMessage('[ NS ] subscription data already recieved');

        // update local state
        const isActive = result.data.isActive;
        setIsSubscription(isActive);
        await logMessage(
          `[ NS ] subscription is ${isActive ? 'enabled' : 'disabled'}`
        );

        return {
          subscription: result.data,
          subscrSource: 'store',
        };
      };

      const fetchSubscriptionDataFromRemoteDb = async () => {
        await logMessage('[ NS ] fetching subscription data');

        // fetch data
        const result = await getSubscription({ token, userId });
        if (result.error) {
          await logMessage(`[ NS ] ${result.error.message}`, 'error');
          return null;
        }

        const subscription = result.data;

        if (subscription === null) {
          await logMessage('[ NS ] no subscription in remote db');
          return null;
        }

        await logMessage('[ NS ] subscription fetched from remote db');

        if (subscription.isActive === false) {
          await logMessage('[ NS ] subscription is disabled');
        }

        // save subscription data in the secure store
        await saveNotifSubInSecureStore(subscription);

        return subscription;
      };

      // exit if subscription already exists
      const isSubFetched = await getNotifSubFetchedFromAsyncStorage();

      // if data has already been fetched, get it from the secure store
      if (isSubFetched) {
        await loadSubscriptionDataFromStore();
      } else {
        // fetch data from the remote db
        const subscription = await fetchSubscriptionDataFromRemoteDb();
        await registerService(subscription);
      }
    } catch (error: any) {
      await logMessage(`[ NS ] ${error.message || defaultErrorMsg}`, 'error');
      showToast(defaultErrorMsg);
    }
  };

  const scheduleDailyNotification = async () => {
    if (!token || !userId) return;
    try {
      // check / ask for permissions
      const permissionResult = await checkNotifPermissions();
      if (!permissionResult) return;

      // check if the subscription is already created
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync();
      if (scheduledNotifications.length) return;

      // schedule notification
      const { hour, minute } = getTimeFromNow(NOTIFICATION_TIME_SHIFT);
      const result = await scheduleNotification({
        // hour: NOTIFICATION_HOUR,
        // minute: NOTIFICATION_MINUTE,
        hour,
        minute,
        token,
        userId,
      });
      if (result.error) {
        await logMessage(`[ NS ] schedule: ${result.error.message}`, 'error');
        showToast(result.error.message);
      }
      if (result.data?.success) {
        await logMessage(`[ NS ] schedule enabled`, 'success');
        setIsSubscription(permissionResult);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const unscheduleDailyNotification = async () => {
    if (!session?.token || !session?.user.id) return;
    const result = await unscheduleNotification({
      token: session.token,
      userId: session.user.id,
    });
    if (result.error) {
      await logMessage(`[ NS ] unschedule: ${result.error.message}`, 'error');
      showToast(result.error.message);
    }
    if (result.data?.success) {
      await logMessage(`[ NS ] schedule canceled`, 'success');
      // showToast('Daily notification canceled');
      setIsSubscription(false);
    }
  };

  // const sendNotification = async (notification: TNotificationConfig) => {
  //   // await sendPushNotificationUsingExpo({ config, expoPushToken });
  //   // await sendPushNotification({
  //   //   notification,
  //   //   token: session.token,
  //   //   userId: session.user.id,
  //   // });
  // };

  useEffect(() => {
    initService();
  }, []);

  useEffect(() => {
    // dev
    const getTasks = async () => {
      try {
        const tasks = await TaskManager.getRegisteredTasksAsync();
        if (tasks.length) {
          const formatedTasks = tasks.reduce((acc: string[], cur) => {
            acc.push(cur.taskName);
            return acc;
          }, []);
          await logMessage(`[ TM ] tasks: ${formatedTasks.join(', ')}`);
        }
      } catch (err: any) {
        console.error(err);
      }
    };
    getTasks();

    // clean up before dismount
    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const value = {
    isSubscription,
    setIsSubscription,
    scheduleDailyNotification,
    unscheduleDailyNotification,
  };

  return (
    <NotificContext.Provider value={value}>{children}</NotificContext.Provider>
  );
};

export default NotificProvider;
