const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
const AUTH_EMAIL = process.env.EXPO_PUBLIC_AUTH_EMAIL ?? '';
const AUTH_PASSWORD = process.env.EXPO_PUBLIC_AUTH_PASSWORD ?? '';
const NOTIFICATIONS_KEY = process.env.EXPO_PUBLIC_NOTIFICATIONS_KEY ?? '';

const KEY_AUTH_TOKEN = 'auth_token';
const KEY_AUTH_USER = 'auth_user';
const KEY_FACTS_STATE = 'facts_state';
const KEY_FACTS_STATE_CAT = 'facts_state_cat';
const KEY_FACTS_FAVORITES = 'facts_favorites';
const KEY_SUBSCR_NOTIF = 'subscr_notif';

// const DEFAULT_REDIRECT_URL = '/facts';
const DEFAULT_REDIRECT_URL = '/profile';

export {
  API_BASE_URL,
  AUTH_EMAIL,
  AUTH_PASSWORD,
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
  KEY_FACTS_FAVORITES,
  KEY_SUBSCR_NOTIF,
  NOTIFICATIONS_KEY,
  DEFAULT_REDIRECT_URL,
};
