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
import { useLogging } from '@/core/context/LoggingProvider';
import { useSession } from '@/core/context/SessionContext';
import {
  handleNotificationBackgroundTask,
  handleForegroundNotification,
  handleNotificationClick,
  logNotificationData,
  registerPushNotificationService,
  scheduleNotification,
  unscheduleNotification,
} from '@/core/helpers/notification';
import { useToast } from '@/core/hooks/useToast';
import { TNotificationConfig } from '@/core/types/common';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

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

export type TNotifications = typeof Notifications;

type TPushNotificationsContextProps = {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  response: Notifications.NotificationResponse | null;
  sendNotification: (config: TNotificationConfig) => Promise<void>;
  scheduleDailyNotification: ({
    hour,
    minute,
  }: {
    hour?: number;
    minute?: number;
  }) => Promise<void>;
  unscheduleDailyNotification: () => Promise<void>;
};

const PushNotificationsContext = createContext<TPushNotificationsContextProps>({
  expoPushToken: '',
  notification: undefined,
  response: null,
  sendNotification: async () => {},
  scheduleDailyNotification: async () => {},
  unscheduleDailyNotification: async () => {},
});

export const useNotifications = () => {
  return useContext(PushNotificationsContext);
};

export const PushNotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();
  const { addLog } = useLogging();
  const { showToast } = useToast();

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [response, setResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const registerService = async () => {
    try {
      // get the token for expo push notifications
      const expoToken = await registerPushNotificationService({
        token: session?.token as string,
        userId: session?.user.id as string,
        // Notifications,
      });
      expoToken && setExpoPushToken(expoToken);

      // create a listener for recieved notifications
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
          logNotificationData(notification);
          addLog(
            `New notification [ ${notification.request.content.title} ] ${notification.request.content.body}`
          );
        });

      // create a listener for notification click
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          handleNotificationClick(response);
          // setResponse(response);
        });
    } catch (err: any) {
      console.error(err);
      setExpoPushToken(`${err}`);
    }
  };

  const sendNotification = async (notification: TNotificationConfig) => {
    // await sendPushNotificationUsingExpo({ config, expoPushToken });
    // await sendPushNotification({
    //   notification,
    //   token: session?.token as string,
    //   userId: session?.user.id as string,
    // });
  };

  const scheduleDailyNotification = async ({
    hour = HOUR,
    minute = MINUTE,
  }: {
    hour?: number;
    minute?: number;
  }) => {
    if (!session?.token || !session.user.id) {
      showToast('Not authenticated');
      return;
    }

    const scheduleRes = await scheduleNotification({
      hour,
      minute,
      token: session.token,
      userId: session.user.id,
    });
    if (scheduleRes.error) showToast(scheduleRes.error.message);
    if (scheduleRes.data?.success) showToast('Notification scheduled');
  };

  const unscheduleDailyNotification = async () => {
    if (!session?.token || !session.user.id) {
      showToast('Not authenticated');
      return;
    }

    const scheduleRes = await unscheduleNotification({
      token: session.token,
      userId: session.user.id,
    });
    if (scheduleRes.error) showToast(scheduleRes.error.message);
    if (scheduleRes.data?.success) showToast('Notification unscheduled');
  };

  // register service
  useEffect(() => {
    if (!session || notificationListener.current) return;
    registerService();
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
          'Registered tasks: ',
          formatedTasks.join(', ')
        );
        addLog(`Tasks: ${formatedTasks.join(', ')}`);
      }
    };
    getTasks();
  }, []);

  const value = {
    expoPushToken,
    notification,
    response,
    sendNotification,
    scheduleDailyNotification,
    unscheduleDailyNotification,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
};
