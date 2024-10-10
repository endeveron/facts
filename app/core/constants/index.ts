const API_BASE_URL =
  process.env.API_BASE_URL || process.env.EXPO_PUBLIC_API_BASE_URL || '';
const AUTH_EMAIL =
  process.env.AUTH_EMAIL || process.env.EXPO_PUBLIC_AUTH_EMAIL || '';
const AUTH_PASSWORD =
  process.env.AUTH_PASSWORD || process.env.EXPO_PUBLIC_AUTH_PASSWORD || '';
const NOTIFICATIONS_KEY =
  process.env.NOTIFICATIONS_KEY ||
  process.env.EXPO_PUBLIC_NOTIFICATIONS_KEY ||
  '';

const SHARE_TITLE = 'Did you know this?';
const NOTIFICATION_REMINDER_TITLE = 'Facts';
const NOTIFICATION_REMINDER_BODY = 'Did you know this?';

// const DEFAULT_REDIRECT_URL = '/facts';
// const DEFAULT_REDIRECT_URL = '/dev';
const DEFAULT_REDIRECT_URL = '/profile';

const NOTIFICATION_BACKGROUND_TASK = 'notification_background_task';

const KEY_AUTH_TOKEN = 'auth_token';
const KEY_AUTH_USER = 'auth_user';
const KEY_FACTS_FAVORITES = 'facts_favorites';
const KEY_FACTS_STATE = 'facts_state';
const KEY_FACTS_STATE_CAT = 'facts_state_cat';
const KEY_NOTIF_SUBSCR = 'notif_subscription';
const KEY_NOTIF_SUBSCR_FETCHED = 'notif_subscription_fetched';

export {
  API_BASE_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  DEFAULT_REDIRECT_URL,
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_FAVORITES,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
  KEY_NOTIF_SUBSCR,
  KEY_NOTIF_SUBSCR_FETCHED,
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
  NOTIFICATIONS_KEY,
  SHARE_TITLE,
};

export const HOUR = 20;
export const MINUTE = 0;
