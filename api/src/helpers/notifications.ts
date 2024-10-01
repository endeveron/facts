import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

import { TNotification } from '../types/notification.js';

// see https://github.com/expo/expo-server-sdk-node
// see https://docs.expo.io/push-notifications/sending-notifications

// create a new Expo SDK client
let expo = new Expo();

export const sendNotificationToSingleClient = async (
  notification: TNotification,
  expoPushToken: string
) => {
  // construct a message
  const message: ExpoPushMessage = { to: expoPushToken };
  if (notification?.body) message.body = notification.body;
  if (notification?.title) message.title = notification.title;
  if (notification?.data) message.data = notification.data;

  if (!Expo.isExpoPushToken(expoPushToken)) {
    return {
      data: null,
      error: `Push token ${expoPushToken} is not a valid Expo push token`,
    };
  }

  // batch notifications to reduce the number of requests
  let chunk = expo.chunkPushNotifications([message]);
  let ticket: ExpoPushTicket;
  // send the chunks to the expo push notification service
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk[0]);
    ticket = ticketChunk[0];
    // error codes https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
  } catch (error: unknown) {
    console.error(error);
    return {
      data: null,
      error: `Could not send chunk`,
    };
  }

  return {
    data: { ticket },
    error: null,
  };
};

export const sendNotificationToClients = async (
  notification: TNotification,
  expoPushTokens: string[]
) => {
  let errors = [];

  // create the messages
  let messages = [];

  for (let pushToken of expoPushTokens) {
    // check that all push tokens appear to be valid expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      errors.push(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }

    // construct a message
    const message: ExpoPushMessage = { to: pushToken };
    if (notification?.body) message.body = notification.body;
    if (notification?.title) message.title = notification.title;
    if (notification?.data) message.data = notification.data;

    messages.push(message);
  }

  // batch notifications to reduce the number of requests
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  // send the chunks to the expo push notification service
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      // console.log(ticketChunk);
      tickets.push(...ticketChunk);
      // error codes https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
    } catch (error: unknown) {
      console.error(error);
      errors.push('Could not send chunk');
    }
  }

  return {
    data: { tickets },
    error: errors.length ? errors.join('') : null,
  };
};
