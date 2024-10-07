import * as Notifications from 'expo-notifications';

export type TNotification = Notifications.NotificationContentInput;

export type TNotificationSubscription = {
  expoPushToken: string | null;
  isActive: boolean;
  schedule: string | null;
};
