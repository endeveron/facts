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

import { consoleClors } from '@/core/constants/colors';
import { useSession } from '@/core/context/SessionContext';
import {
  handleBackgroundNotification,
  handleNotificationClick,
  logNotificationData,
  registerPushNotificationsService,
  sendPushNotification,
} from '@/core/helpers/notification';
import { TNotificationConfig } from '@/core/types/common';
import { NOTIFICATION_BACKGROUND_TASK } from '@/core/constants';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

// when app is foregrounded - handle the behavior when notifications are received
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// when app is backgrounded - define a task to handle the behavior when notifications are received
// ! background event listeners are not supported in Expo Go
// see https://docs.expo.dev/versions/latest/sdk/notifications/#notification-events-listeners
TaskManager.defineTask(
  NOTIFICATION_BACKGROUND_TASK,
  handleBackgroundNotification
);
Notifications.registerTaskAsync(NOTIFICATION_BACKGROUND_TASK);

export type TNotifications = typeof Notifications;

type TPushNotificationsContextProps = {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  response: Notifications.NotificationResponse | null;
  sendNotification: (config: TNotificationConfig) => Promise<void>;
};

const PushNotificationsContext = createContext<TPushNotificationsContextProps>({
  expoPushToken: '',
  notification: undefined,
  response: null,
  sendNotification: async () => {},
});

export const useNotifications = () => {
  return useContext(PushNotificationsContext);
};

export const PushNotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();

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
      const expoToken = await registerPushNotificationsService({
        token: session?.token as string,
        userId: session?.user.id as string,
        Notifications,
      });
      expoToken && setExpoPushToken(expoToken);

      // create a listener for recieved notifications
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
          logNotificationData(notification);
        });

      // create a listener for notification click
      // not supported in Expo Go
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          handleNotificationClick(response);
          setResponse(response);
        });
    } catch (err: any) {
      console.error(err);
      setExpoPushToken(`${err}`);
    }
  };

  const sendNotification = async (notification: TNotificationConfig) => {
    // await sendPushNotificationUsingExpo({ config, expoPushToken });
    await sendPushNotification({
      notification,
      token: session?.token as string,
      userId: session?.user.id as string,
    });
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

      // TaskManager.unregisterAllTasksAsync();
    };
  }, []);

  // // dev
  // useEffect(() => {
  //   const getTasks = async () => {
  //     const tasks = await TaskManager.getRegisteredTasksAsync();
  //     if (tasks.length) {
  //       const formatedTasks = tasks.reduce((acc: string[], cur) => {
  //         acc.push(`[ ${cur.taskName}, type: ${cur.taskType} ]`);
  //         return acc;
  //       }, []);
  //       console.info(
  //         `${cyan}%s${gray}%s${reset}`,
  //         'Registered tasks: ',
  //         formatedTasks.join(', ')
  //       );
  //     }
  //   };
  //   getTasks();
  // }, []);

  const value = {
    expoPushToken,
    notification,
    response,
    sendNotification,
  };

  return (
    <PushNotificationsContext.Provider value={value}>
      {children}
    </PushNotificationsContext.Provider>
  );
};
