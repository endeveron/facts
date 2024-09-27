import * as Notifications from 'expo-notifications';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { useSession } from '@/core/context/AuthContext';
import {
  registerService,
  saveSubscriptionInDb,
  sendPushNotification,
} from '@/core/helpers/notification';
import { TNotificationConfig } from '@/core/types/common';
import { useToast } from '@/core/hooks/useToast';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export type TNotifications = typeof Notifications;

type TNotificationsContextProps = {
  expoPushToken: string;
  notification: Notifications.Notification | undefined;
  response: Notifications.NotificationResponse | null;
  sendNotification: (config: TNotificationConfig) => Promise<void>;

  saveSubscription: () => Promise<void>;
};

const NotificationsContext = createContext<TNotificationsContextProps>({
  expoPushToken: '',
  notification: undefined,
  response: null,
  sendNotification: async () => {},

  saveSubscription: async () => {},
});

export const useNotifications = () => {
  return useContext(NotificationsContext);
};

export const NotificationsProvider = ({ children }: PropsWithChildren) => {
  const { session } = useSession();

  const { showToast } = useToast();

  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const [response, setResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  const registerSubscription = async () => {
    try {
      // get the token for expo push notifications
      const expoToken = await registerService({
        token: session?.token as string,
        userId: session?.user.id as string,
        Notifications,
      });
      expoToken && setExpoPushToken(expoToken);

      // create a listener for recieved notifications
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification);
        });

      // create a listener for notification click
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((resp) => {
          setResponse(resp);
        });
    } catch (err: any) {
      console.error(err);
      setExpoPushToken(`${err}`);
    }
  };

  const sendNotification = async (config: TNotificationConfig) => {
    await sendPushNotification({ config, expoPushToken });
  };

  const saveSubscription = async () => {
    const result = await saveSubscriptionInDb({
      expoPushToken,
      token: session?.token as string,
      userId: session?.user.id as string,
    });
    if (result.error) showToast(result.error.message);
  };

  // register subscription
  useEffect(() => {
    if (!session || notificationListener.current) return;
    registerSubscription();
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

  const value = {
    expoPushToken,
    notification,
    response,
    sendNotification,

    saveSubscription,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
