import * as Notifications from 'expo-notifications';

export type TNotifSchedule = {
  hour: number;
  minute: number;
};

export type TNotification = Notifications.NotificationContentInput;
