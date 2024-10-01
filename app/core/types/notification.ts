import * as Notifications from 'expo-notifications';

export type TNotifSchedule = {
  id: string;
  hour: number;
  minute: number;
};

export type TNotification = Notifications.NotificationContentInput;
