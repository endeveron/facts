import * as SecureStore from 'expo-secure-store';

import {
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_FAVORITES,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
} from '@/core/constants';
import { showAlert } from '@/core/helpers/alert';
import { TAuthData, TUser } from '@/core/types/auth';
import { EFactsStateKey, TFactsState } from '@/core/types/fact';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { consoleClors } from '@/core/constants/colors';
const { gray, green, red, reset } = consoleClors;

/**
 * Retrieves authentication data including token and user information from SecureStore.
 * @returns object { token, user } or null.
 */
export const getAuthDataFromSecureStore = async (): Promise<{
  token: string;
  user: TUser;
} | null> => {
  try {
    const token = await SecureStore.getItemAsync(KEY_AUTH_TOKEN);
    if (token === null) return null;
    const userStr = await SecureStore.getItemAsync(KEY_AUTH_USER);
    if (userStr === null) {
      showAlert('Could not get user data from store.');
      return null;
    }
    const user = JSON.parse(userStr as string);
    // console.log('Auth data retrieved from store.');
    return {
      token,
      user,
    };
  } catch (err: any) {
    console.error(err);
    return null;
  }
};

/**
 * Stores authentication data in SecureStore
 * @param authData - { token: string; user: TUser }
 */
export const saveAuthDataInSecureStore = async ({ token, user }: TAuthData) => {
  try {
    // add auth token
    await SecureStore.setItemAsync(KEY_AUTH_TOKEN, token);
    // add user data
    const userStr = JSON.stringify(user);
    await SecureStore.setItemAsync(KEY_AUTH_USER, userStr);
    // console.log('Auth data saved to storage.');
  } catch (err: any) {
    console.error(err);
    showAlert('Could not save data to storage.');
  }
};

/**
 * Deletes authentication data from SecureStore.
 * @returns a boolean indicating success or failure.
 */
export const deleteAuthDataFromSecureStore = async (): Promise<boolean> => {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_TOKEN);
    await SecureStore.deleteItemAsync(KEY_AUTH_USER);
    console.info(`${red}%s${reset}\n`, 'Auth data deleted from SecureStore');
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Stores facts state in AsyncStorage.
 * @param {TFactsState} state - object of type TFactsState
 * @returns a boolean indicating success or failure.
 */
export const saveFactsStateInAsyncStorage = async ({
  stateKey,
  state,
  favorites,
}: {
  stateKey: EFactsStateKey;
  state: TFactsState;
  favorites: string[];
}): Promise<boolean> => {
  try {
    const stateStr = JSON.stringify(state);
    await AsyncStorage.setItem(stateKey, stateStr);

    const favoritesStr = JSON.stringify(favorites);
    await AsyncStorage.setItem(KEY_FACTS_FAVORITES, favoritesStr);

    console.info(
      `${green}%s${gray}%s${reset}`,
      `Facts state saved in AsyncStorage `,
      `${stateKey}`
    );
    console.info(
      `${gray}%s${reset}`,
      `${state.facts[0].title.slice(0, 30)}...`
    );
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Retrieves facts state from AsyncStorage.
 * @returns data of type TFactsState or null.
 */
export const getFactsStateFromAsyncStorage = async (
  stateKey: EFactsStateKey
): Promise<{
  state: TFactsState;
  favorites: string[];
} | null> => {
  try {
    const stateStr = await AsyncStorage.getItem(stateKey);
    const favoritesStr = await AsyncStorage.getItem(KEY_FACTS_FAVORITES);
    if (!stateStr || !favoritesStr) return null;

    const state: TFactsState = JSON.parse(stateStr);
    const favorites: string[] = JSON.parse(favoritesStr);
    console.info(
      `${green}%s${gray}%s${reset}`,
      `Facts state retrieved from AsyncStorage `,
      `${stateKey}`
    );
    console.info(
      `${gray}%s${reset}`,
      `${state.facts[0].title.slice(0, 30)}...`
    );
    return {
      state,
      favorites,
    };
  } catch (err: any) {
    console.error(err);
    return null;
  }
};

/**
 * Deletes facts data from AsyncStorage.
 * @returns a boolean indicating success or failure.
 */
export const deleteFactsDataFromAsyncStorage = async (): Promise<boolean> => {
  try {
    const clear = async () => {
      await AsyncStorage.removeItem(KEY_FACTS_STATE);
      await AsyncStorage.removeItem(KEY_FACTS_STATE_CAT);
      await AsyncStorage.removeItem(KEY_FACTS_FAVORITES);
    };
    const check = async (): Promise<boolean> => {
      const itemStr = await AsyncStorage.getItem(KEY_FACTS_FAVORITES);
      return itemStr === null;
    };

    await clear();
    const clean = await check();
    if (clean) {
      console.info(`${red}%s${reset}`, 'Facts data deleted from AsyncStorage');
      return true;
    } else {
      return false;
    }
  } catch (err: any) {
    console.error(err);
    return false;
  }
};
