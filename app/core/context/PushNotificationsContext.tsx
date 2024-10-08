import * as Notifications from 'expo-notifications';
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
import { consoleClors } from '@/core/constants/colors';
import { useLogging, writeLog } from '@/core/context/LoggingProvider';
import { useSession } from '@/core/context/SessionContext';
import {
  handleForegroundNotification,
  handleNotificationBackgroundTask,
  handleNotificationClick,
  logNotificationData,
  registerPushNotificationService,
  scheduleNotification,
  unscheduleNotification,
} from '@/core/helpers/notification';
import { useToast } from '@/core/hooks/useToast';
import { TNotificationConfig } from '@/core/types/common';
import {
  getNotifSubFromSecureStore,
  getNotifSubIsFetchedFromAsyncStorage,
} from '@/core/helpers/store';
import { getSubscription } from '@/core/services/notifications';
import { TNotificationSubscription } from '@/core/types/notification';
import { logMessage } from '@/core/helpers/misc';

const { cyan, gray, reset } = consoleClors;

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

type TPushNotificationsContextProps = {
  isSubscription: boolean;
  setIsSubscription: (value: boolean) => void;
  scheduleDailyNotification: () => Promise<void>;
  unscheduleDailyNotification: () => Promise<void>;
  // expoPushToken: string;
  // notification: Notifications.Notification | undefined;
  // response: Notifications.NotificationResponse | null;
  // sendNotification: (config: TNotificationConfig) => Promise<void>;
};

const PushNotificationsContext = createContext<TPushNotificationsContextProps>({
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
  return useContext(PushNotificationsContext);
};

export const PushNotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();
  const { addLog } = useLogging();
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

  const registerService = async (
    subscription: TNotificationSubscription | null,
    subscrSource: string | null
  ) => {
    try {
      // get the token for expo push notifications
      const serviceRes = await registerPushNotificationService({
        token: session?.token as string,
        userId: session?.user.id as string,
        subscription,
        subscrSource,
      });

      if (!serviceRes) {
        const message = 'Could not register service';
        showToast(message);
        logMessage(message);
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
          addLog(
            `[ NL ] new notification [ ${notification.request.content.title} ] ${notification.request.content.body}`
          );
        });

      // create a listener for notification click
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          handleNotificationClick(response);
          // setResponse(response);
        });
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

    try {
      // check if the subscription already saved in SecureStore
      const storeRes = await getNotifSubFromSecureStore();
      if (storeRes.error) {
        writeLog(storeRes.error.message, 'error');
        showToast(defaultErrorMsg);
        return;
      }

      // handle data from SecureStore
      if (storeRes.data) {
        logMessage('[ NS ] handle data from store');
        if (storeRes.data.isActive === false) {
          // subscription is not active, exit
          logMessage('[ NS ] subscription is not active, exit');
          return;
        }

        // prevent the receipt of unnecessary data
        const isSubFetched = await getNotifSubIsFetchedFromAsyncStorage();
        if (isSubFetched) {
          const subStoreRes = await getNotifSubFromSecureStore();
          if (!subStoreRes) {
            logMessage(
              `[ NS ] unable to get subscription state from atorage`,
              'error'
            );
          }
          if (subStoreRes.error) {
            logMessage(`[ NS ] ${subStoreRes.error.message}`, 'error');
          }
          if (!subStoreRes || subStoreRes.error) {
            showToast('Unable to get subscription state');
            return;
          }

          logMessage('[ NS ] data already recieved');

          const isActive = subStoreRes.data?.isActive as boolean;
          setIsSubscription(isActive);
          logMessage(
            `[ NS ] subscription is ${isActive ? 'active' : 'inactive'}`
          );

          return;
        }

        subscription = storeRes.data;
        subscrSource = 'store';
      }

      // try to fetch data from db
      if (!storeRes.data) {
        logMessage('[ NS ] no data in store, fetch from db');
        const userId = session?.user.id;
        const token = session?.token;
        if (!userId || !token) {
          logMessage(`[ NS ] ${defaultErrorMsg}. Invalid auth data`, 'error');
          showToast(defaultErrorMsg);
          return;
        }
        // fetch data
        const subscrRes = await getSubscription({ token, userId });
        if (!subscrRes) {
          logMessage(
            `[ NS ] ${defaultErrorMsg}. Unable to fetch subscription from db`,
            'error'
          );
          return;
        }
        if (subscrRes.error) {
          logMessage(`[ NS ] ${subscrRes.error.message}`, 'error');
          return;
        }
        if (subscrRes.data) {
          if (subscrRes.data.isActive === false) {
            // subscription is not active, exit
            logMessage('[ NS ] subscription is not active, exit');
            return;
          }
          subscription = subscrRes.data;
          subscrSource = 'db';
        } else {
          // subscription is not created
          logMessage('[ NS ] no subscription in db');
        }
      }

      registerService(subscription, subscrSource);
    } catch (error: any) {
      writeLog(`${error.message || defaultErrorMsg}`, 'error');
      showToast(defaultErrorMsg);
    }
  };

  const scheduleDailyNotification = async () => {
    if (!session?.token || !session.user.id) {
      showToast('Not authenticated');
      logMessage('[ NS ] schedule: not authenticated', 'error');
      return;
    }
    const result = await scheduleNotification({
      hour: HOUR,
      minute: MINUTE,
      token: session.token,
      userId: session.user.id,
    });
    if (result.error) {
      logMessage(`[ NS ] schedule: ${result.error.message}`, 'error');
      showToast(result.error.message);
    }
    if (result.data?.success) {
      logMessage(`[ NS ] schedule activated`, 'success');
      showToast('Daily notification activated');
      setIsSubscription(true);
    }
  };

  const unscheduleDailyNotification = async () => {
    if (!session?.token || !session.user.id) {
      showToast('Not authenticated');
      logMessage('[ NS ] unschedule: not authenticated', 'error');
      return;
    }
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
      showToast('Daily notification canceled');
      setIsSubscription(false);
    }
  };

  // const sendNotification = async (notification: TNotificationConfig) => {
  //   // await sendPushNotificationUsingExpo({ config, expoPushToken });
  //   // await sendPushNotification({
  //   //   notification,
  //   //   token: session?.token as string,
  //   //   userId: session?.user.id as string,
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
        console.info(
          `${cyan}%s${gray}%s${reset}`,
          '[ TM ] tasks: ',
          formatedTasks.join(', ')
        );
        addLog(`[ TM ] tasks: ${formatedTasks.join(', ')}`);
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
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
};
