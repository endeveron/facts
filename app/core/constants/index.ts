const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const FACTS_LENGTH_TO_FETCH_NEW_ITEMS = 2;

const KEY_AUTH_TOKEN = 'auth_token';
const KEY_AUTH_USER = 'auth_user';
const KEY_FACTS_ARRAY = 'facts_array';
const KEY_FACTS_LIKED = 'facts_favourites';
const KEY_FACTS_CURRENT = 'facts_current';
const KEY_FACTS_NOT_SHOWN = 'facts_not_shown';

const SIGN_IN_SUCCESS_REDIRECT_URL = '/facts';
const SIGN_OUT_REDIRECT_URL = '/sign-in';

export {
  API_BASE_URL,
  FACTS_LENGTH_TO_FETCH_NEW_ITEMS,
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_ARRAY,
  KEY_FACTS_LIKED,
  KEY_FACTS_CURRENT,
  KEY_FACTS_NOT_SHOWN,
  SIGN_IN_SUCCESS_REDIRECT_URL,
  SIGN_OUT_REDIRECT_URL,
};
