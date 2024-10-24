import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// https://github.com/expo/expo-server-sdk-node
// https://docs.expo.io/push-notifications/sending-notifications
// error codes https://docs.expo.io/push-notifications/sending-notifications/#individual-errors

// create a new Expo SDK client
let expo = new Expo();

export const sendNotificationToSingleClient = async (
  message: Omit<ExpoPushMessage, 'to'>,
  expoPushToken: string
) => {
  // check expo push token validity
  if (!Expo.isExpoPushToken(expoPushToken)) {
    return {
      data: null,
      error: `Push token '${expoPushToken}' is not a valid Expo push token`,
    };
  }

  // construct a message
  const msg: ExpoPushMessage = {
    to: expoPushToken,
    ...message,
  };

  // batch notifications to reduce the number of requests
  let chunk = expo.chunkPushNotifications([msg]);
  let ticket: ExpoPushTicket;
  // send the chunks to the expo push notification service
  try {
    let ticketChunk = await expo.sendPushNotificationsAsync(chunk[0]);
    ticket = ticketChunk[0];
  } catch (error: unknown) {
    console.error(`sendNotificationToSingleClient: ${error}`);
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
  message: Omit<ExpoPushMessage, 'to'>,
  expoPushTokens: string[]
) => {
  let errors = [];
  let messages = [];

  for (let pushToken of expoPushTokens) {
    // check that all push tokens appear to be valid expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
      errors.push(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    // construct a message
    const msg: ExpoPushMessage = {
      to: pushToken,
      ...message,
    };
    messages.push(msg);
  }

  // batch notifications to reduce the number of requests
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  // send the chunks to the expo push notification service
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error: unknown) {
      console.error(`sendNotificationToClients: ${error}`);
      errors.push('Could not send chunk');
    }
  }

  return {
    data: { tickets },
    error: errors.length ? errors.join('') : null,
  };
};
