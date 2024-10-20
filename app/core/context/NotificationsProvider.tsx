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

import { HOUR, MINUTE, NOTIFICATION_BACKGROUND_TASK } from '@/core/constants';
import { useSession } from '@/core/context/SessionProvider';
import { openNextFact } from '@/core/helpers/db';
import { logMessage } from '@/core/helpers/misc';
import {
  handleForegroundNotification,
  handleNotificationBackgroundTask,
  handleNotificationClick,
  logNotificationData,
  registerPushNotificationService,
  scheduleNotification,
  unscheduleNotification,
} from '@/core/helpers/notification';
import {
  getNotifSubFetchedFromAsyncStorage,
  getNotifSubFromSecureStore,
} from '@/core/helpers/store';
import { useToast } from '@/core/hooks/useToast';
import { getSubscription } from '@/core/services/notifications';
import { TNotificationSubscription } from '@/core/types/notification';
import { useSQLiteContext } from 'expo-sqlite';

// define a task to handle the behavior when notifications are received when app is backgrounded
// ! background event listeners are not supported in Expo Go
TaskManager.defineTask(
  NOTIFICATION_BACKGROUND_TASK,
  handleNotificationBackgroundTask
);

// handle the behavior when notifications are received when app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: handleForegroundNotification,
});

type TNotifContextProps = {
  isSubscription: boolean;
  setIsSubscription: (value: boolean) => void;
  scheduleDailyNotification: () => Promise<void>;
  unscheduleDailyNotification: () => Promise<void>;
  // expoPushToken: string;
  // notification: Notifications.Notification | undefined;
  // response: Notifications.NotificationResponse | null;
  // sendNotification: (config: TNotificationConfig) => Promise<void>;
};

const NotificationsContext = createContext<TNotifContextProps>({
  isSubscription: false,
  setIsSubscription: () => {},
  scheduleDailyNotification: async () => {},
  unscheduleDailyNotification: async () => {},
  // expoPushToken: '',
  // notification: undefined,
  // response: null,
  // sendNotification: async () => {},
});

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();
  const db = useSQLiteContext();
  const { showToast } = useToast();

  const [isSubscription, setIsSubscription] = useState(false);
  // const [expoPushToken, setExpoPushToken] = useState('');
  // const [notification, setNotification] = useState<
  //   Notifications.Notification | undefined
  // >(undefined);
  // const [response, setResponse] =
  //   useState<Notifications.NotificationResponse | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const userId = session?.user.id;
  const token = session?.token;

  const registerService = async (
    subscription: TNotificationSubscription | null,
    subscrSource: string | null
  ) => {
    if (!token || !userId) return;
    try {
      // get the token for expo push notifications
      const serviceRes = await registerPushNotificationService({
        token,
        userId,
        subscription,
        subscrSource,
      });

      if (!serviceRes) {
        logMessage(`[ NS ] service is not registered`);
      }

      if (serviceRes?.error) {
        logMessage(serviceRes.error.message);
      }
      if (serviceRes?.data) {
        const expoPushToken = serviceRes.data.subscription.expoPushToken;
        const isSubActive = serviceRes.data.subscription.isActive;
        setIsSubscription(isSubActive);

        if (expoPushToken && isSubActive) {
          await scheduleDailyNotification();
        }
      }

      // create a listener for recieved notifications
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          // setNotification(notification);
          logNotificationData(notification);
        });

      // create a listener for notification click
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener(
          async (response) => {
            // setResponse(response);
            await handleNotificationClick(response);
            await openNextFact(db, router);
          }
        );
    } catch (error: any) {
      logMessage(error?.message ?? 'Unable to register service');
      // setExpoPushToken(`${error}`);
    }
  };

  const initService = async () => {
    let subscription: TNotificationSubscription | null = null;
    let subscrSource: string | null = null;
    const defaultErrorMsg = 'Could not handle subscription';

    logMessage('[ NS ] notification service is launched');

    const loadSubscriptionDataFromStore = async () => {
      const result = await getNotifSubFromSecureStore();
      if (result.error) {
        logMessage(`[ NS ] ${result.error.message}`, 'error');
        return;
      }
      if (!result || result.error) {
        showToast('Unable to get subscription state');
        return;
      }
      if (!result.data) return;

      logMessage('[ NS ] data already recieved');

      // update local state
      const isActive = result.data.isActive;
      setIsSubscription(isActive);
      logMessage(`[ NS ] subscription is ${isActive ? 'active' : 'inactive'}`);

      return {
        subscription: result.data,
        subscrSource: 'store',
      };
    };

    const fetchSubscriptionDataFromRemoteDb = async () => {
      logMessage('[ NS ] no data in store, fetch from db');

      if (!userId || !token) {
        logMessage(`[ NS ] ${defaultErrorMsg}. Invalid auth data`, 'error');
        showToast(defaultErrorMsg);
        return;
      }

      // fetch data
      const result = await getSubscription({ token, userId });
      if (!result) {
        logMessage(
          `[ NS ] ${defaultErrorMsg}. Unable to fetch subscription from db`,
          'error'
        );
        return;
      }
      if (result.error) {
        logMessage(`[ NS ] ${result.error.message}`, 'error');
        return;
      }
      if (result.data) {
        if (result.data.isActive === false) {
          logMessage('[ NS ] subscription is not active, exit');
          return;
        }

        logMessage('[ NS ] data fetched from db');
        subscription = result.data;
        subscrSource = 'db';
      } else {
        // subscription is not created
        logMessage('[ NS ] no subscription in db');
      }

      return {
        subscription: result.data,
        subscrSource: 'db',
      };
    };

    try {
      // prevent the receipt of unnecessary data
      const isSubFetched = await getNotifSubFetchedFromAsyncStorage();

      // try to get subscription data from the secure store
      if (isSubFetched) {
        const data = await loadSubscriptionDataFromStore();
        if (data) {
          subscription = data.subscription;
          subscrSource = data.subscrSource;
        }
      }

      // try to fetch data from the remote db
      if (!subscrSource) {
        const data = await fetchSubscriptionDataFromRemoteDb();
        if (!data) return;
        subscription = data.subscription;
        subscrSource = data.subscrSource;
      }

      registerService(subscription, subscrSource);
    } catch (error: any) {
      logMessage(`[ NS ] ${error.message || defaultErrorMsg}`, 'error');
      showToast(defaultErrorMsg);
    }
  };

  const scheduleDailyNotification = async () => {
    if (!token || !userId) return;
    try {
      const result = await scheduleNotification({
        hour: HOUR,
        minute: MINUTE,
        token,
        userId,
      });
      if (result.error) {
        logMessage(`[ NS ] schedule: ${result.error.message}`, 'error');
        showToast(result.error.message);
      }
      if (result.data?.success) {
        logMessage(`[ NS ] schedule activated`, 'success');
        // showToast('Daily notification activated');
        setIsSubscription(true);
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
      logMessage(`[ NS ] unschedule: ${result.error.message}`, 'error');
      showToast(result.error.message);
    }
    if (result.data?.success) {
      logMessage(`[ NS ] schedule canceled`, 'success');
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

  // init
  useEffect(() => {
    if (session) initService();
  }, [session]);

  // clean up before dismount
  useEffect(() => {
    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // dev
  useEffect(() => {
    const getTasks = async () => {
      const tasks = await TaskManager.getRegisteredTasksAsync();
      if (tasks.length) {
        const formatedTasks = tasks.reduce((acc: string[], cur) => {
          acc.push(cur.taskName);
          return acc;
        }, []);
        logMessage(`[ TM ] tasks: ${formatedTasks.join(', ')}`);
      }
    };
    getTasks();
  }, []);

  const value = {
    isSubscription,
    setIsSubscription,
    scheduleDailyNotification,
    unscheduleDailyNotification,
    // expoPushToken,
    // notification,
    // response,
    // sendNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;
