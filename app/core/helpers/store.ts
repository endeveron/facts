import * as SecureStore from 'expo-secure-store';

import {
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_ARRAY,
  KEY_FACTS_CURRENT,
  KEY_FACTS_LIKED,
  KEY_FACTS_NOT_SHOWN,
} from '@/core/constants';
import { showAlert } from '@/core/helpers/alert';
import { TAuthData, TUser } from '@/core/types/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TFactItem, TFactsStorageState } from '@/core/types/fact';

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
    // Add auth token
    await SecureStore.setItemAsync(KEY_AUTH_TOKEN, token);
    // Add user data
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
    console.info('Auth data deleted from SecureStore.');
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Stores facts state in AsyncStorage.
 * @param {TFactsStorageState} state - object of type TFactsStorageState
 * @returns a boolean indicating success or failure.
 */
export const saveFactsStateInAsyncStorage = async ({
  facts,
  current,
  favourites,
  notShownNum,
}: TFactsStorageState): Promise<boolean> => {
  try {
    const factsStr = JSON.stringify(facts);
    const currentStr = JSON.stringify(current);
    const favouritesStr = JSON.stringify(favourites);
    const notShownStr = JSON.stringify(notShownNum);
    await AsyncStorage.setItem(KEY_FACTS_ARRAY, factsStr);
    await AsyncStorage.setItem(KEY_FACTS_CURRENT, currentStr);
    await AsyncStorage.setItem(KEY_FACTS_LIKED, favouritesStr);
    await AsyncStorage.setItem(KEY_FACTS_NOT_SHOWN, notShownStr);
    console.log('Facts state saved in AsyncStorage.');
    return true;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

/**
 * Retrieves facts state from AsyncStorage.
 * @returns data of type TFactsStorageState or null.
 */
export const getFactsStateFromAsyncStorage =
  async (): Promise<TFactsStorageState | null> => {
    try {
      const factsStr = await AsyncStorage.getItem(KEY_FACTS_ARRAY);
      const currentStr = await AsyncStorage.getItem(KEY_FACTS_CURRENT);
      const favouritesStr = await AsyncStorage.getItem(KEY_FACTS_LIKED);
      const notShownStr = await AsyncStorage.getItem(KEY_FACTS_NOT_SHOWN);
      if (
        factsStr === null ||
        currentStr === null ||
        favouritesStr === null ||
        notShownStr === null
      ) {
        return null;
      }
      const facts = JSON.parse(factsStr);
      const current = JSON.parse(currentStr);
      const favourites = JSON.parse(favouritesStr);
      const notShownNum = JSON.parse(notShownStr);
      console.log('Facts state retrieved from AsyncStorage.');
      return {
        facts,
        current,
        favourites,
        notShownNum,
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
      await AsyncStorage.removeItem(KEY_FACTS_ARRAY);
      await AsyncStorage.removeItem(KEY_FACTS_CURRENT);
      await AsyncStorage.removeItem(KEY_FACTS_LIKED);
      await AsyncStorage.removeItem(KEY_FACTS_NOT_SHOWN);
    };
    const check = async (): Promise<boolean> => {
      const currentStr = await AsyncStorage.getItem(KEY_FACTS_CURRENT);
      return currentStr === null;
    };

    await clear();
    const clean = await check();
    if (clean) {
      console.info('Facts data deleted from AsyncStorage.');
      return true;
    } else return false;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};
