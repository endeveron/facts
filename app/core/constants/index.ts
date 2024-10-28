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

const LOCAL_DB_NAME = 'facts.db';

const SHARE_TITLE = 'Did you know this?';
const NOTIFICATION_REMINDER_TITLE = 'Facts';
const NOTIFICATION_REMINDER_BODY = 'Did you know this?';

const NOTIFICATION_TIME_SHIFT = 1 * 60 * 1000; // 1 min

const DEFAULT_REDIRECT_URL = '/facts';
// const DEFAULT_REDIRECT_URL = '/profile';

const NOTIFICATION_BACKGROUND_TASK = 'notification_background_task';

const KEY_AUTH_TOKEN = 'auth_token';
const KEY_AUTH_USER = 'auth_user';
const KEY_LOCAL_DB_FACTS_INIT = 'local_db_facts_init';
const KEY_FACTS_STATE_TIMESTAMP = 'facts_state_timestamp';
const KEY_NOTIF_SUBSCR = 'notif_subscription';
const KEY_NOTIF_SUBSCR_FETCHED = 'notif_subscription_fetched';
const KEY_NOTIF_PERMISSION_GRANTED = 'notif_permission_granted';

export {
  API_BASE_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  LOCAL_DB_NAME,
  DEFAULT_REDIRECT_URL,
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_LOCAL_DB_FACTS_INIT,
  KEY_FACTS_STATE_TIMESTAMP,
  KEY_NOTIF_SUBSCR,
  KEY_NOTIF_SUBSCR_FETCHED,
  KEY_NOTIF_PERMISSION_GRANTED,
  NOTIFICATION_BACKGROUND_TASK,
  NOTIFICATION_REMINDER_BODY,
  NOTIFICATION_REMINDER_TITLE,
  NOTIFICATIONS_KEY,
  NOTIFICATION_TIME_SHIFT,
  SHARE_TITLE,
};

export const HOUR = 20;
export const MINUTE = 0;
