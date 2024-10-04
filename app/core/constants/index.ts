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

const DEFAULT_REDIRECT_URL = '/facts';
// const DEFAULT_REDIRECT_URL = '/dev';
// const DEFAULT_REDIRECT_URL = '/profile';

const NOTIFICATION_BACKGROUND_TASK = 'notification_background_task';
const NOTIFICATION_REMINDER_BODY = 'Did you know this?';
const NOTIFICATION_REMINDER_TITLE = 'Facts';

const KEY_AUTH_TOKEN = 'auth_token';
const KEY_AUTH_USER = 'auth_user';
const KEY_FACTS_FAVORITES = 'facts_favorites';
const KEY_FACTS_NEXT_ITEM = 'facts_next_item';
const KEY_FACTS_STATE = 'facts_state';
const KEY_FACTS_STATE_CAT = 'facts_state_cat';
const KEY_NOTIF_SCHEDULE = 'notif_schedule';
const KEY_SUBSCR_NOTIF = 'subscr_notif';

export {
  API_BASE_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  DEFAULT_REDIRECT_URL,
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_FAVORITES,
  KEY_FACTS_NEXT_ITEM,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
  KEY_NOTIF_SCHEDULE,
  KEY_SUBSCR_NOTIF,
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
  NOTIFICATIONS_KEY,
};

export const HOUR = 14;
export const MINUTE = 5;
