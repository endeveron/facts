import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  KEY_AUTH_DATA,
  KEY_FACTS_STATE_TIMESTAMP,
  KEY_LOCAL_DB_FACTS_INIT,
  KEY_NOTIF_SUBSCR,
  KEY_NOTIF_SUBSCR_FETCHED,
  KEY_SHOW_STATISTICS,
} from '@/core/constants';
import { logMessage } from '@/core/helpers/misc';
import { TStoreAuthData, TUserAuthData } from '@/core/types/auth';
import { TResponse, TStatus } from '@/core/types/common';
import { TNotificationSubscription } from '@/core/types/notification';

/**
 * Retrieves authentication data including token and user information from SecureStore.
 * @returns a Promise that resolves to an object of type `TResponse` { token, user }
 */
export const getAuthDataFromSecureStore = async (): Promise<
  TResponse<TStoreAuthData>
> => {
  try {
    const authDataStr = await SecureStore.getItemAsync(KEY_AUTH_DATA);
    if (!authDataStr)
      return {
        data: null,
        error: null,
      };
    const data = JSON.parse(authDataStr as string);
    return {
      data,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not get auth data from store' },
    };
  }
};

/**
 * Stores authentication data in SecureStore
 * @param authData TStoreAuthData
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const saveAuthDataInSecureStore = async (
  authData: TUserAuthData
): Promise<TResponse<TStatus>> => {
  try {
    const data = {
      ...authData,
      timestamp: Date.now(),
    };
    const authDataStr = JSON.stringify(data);
    await SecureStore.setItemAsync(KEY_AUTH_DATA, authDataStr);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not save auth data in store' },
    };
  }
};

/**
 * Deletes authentication data from SecureStore.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const deleteAuthDataFromSecureStore = async (): Promise<
  TResponse<TStatus>
> => {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_DATA);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not clear auth data' },
    };
  }
};

/**
 * Saves notification subscription in SecureStore.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const saveNotifSubInSecureStore = async (
  subscription: TNotificationSubscription
): Promise<TResponse<TStatus>> => {
  try {
    const subscrDataStr = JSON.stringify(subscription);
    await SecureStore.setItemAsync(KEY_NOTIF_SUBSCR, subscrDataStr);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not save subscription in store' },
    };
  }
};

/**
 * Retrieves notification subscription data from SecureStore.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const getNotifSubFromSecureStore = async (): Promise<
  TResponse<TNotificationSubscription>
> => {
  try {
    const subscrDataStr = await SecureStore.getItemAsync(KEY_NOTIF_SUBSCR);
    if (!subscrDataStr) return { data: null, error: null };
    const subscription = JSON.parse(subscrDataStr);
    return {
      data: subscription,
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message: err.message ?? 'Could not get subscription from store',
      },
    };
  }
};

/**
 * Delete notification subscription from SecureStore.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const deleteNotifSubFromSecureStore = async (): Promise<
  TResponse<TStatus>
> => {
  try {
    await SecureStore.deleteItemAsync(KEY_NOTIF_SUBSCR);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not save subscription in store' },
    };
  }
};

/**
 * Saves notification subscription fetched status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const saveNotifSubFetchedInAsyncStorage = async (): Promise<
  TResponse<TStatus>
> => {
  try {
    await AsyncStorage.setItem(KEY_NOTIF_SUBSCR_FETCHED, 'true');
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'could not remove subscription status from storage',
      },
    };
  }
};

/**
 * Removes notification subscription fetched from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const removeNotifSubFetchedFromAsyncStorage = async (): Promise<
  TResponse<TStatus>
> => {
  try {
    await AsyncStorage.removeItem(KEY_NOTIF_SUBSCR_FETCHED);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'could not remove subscription status from storage',
      },
    };
  }
};

/**
 * Get notification subscription fetched status in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` isFetched: boolean
 */
export const getNotifSubFetchedFromAsyncStorage = async (): Promise<
  string | null
> => {
  try {
    const result = await AsyncStorage.getItem(KEY_NOTIF_SUBSCR_FETCHED);
    return result;
  } catch (err: any) {
    console.error(err);
    logMessage(
      '[ NS ] unable to get the notification subscription status from storage',
      'error'
    );
    return null;
  }
};

/**
 * Saves the facts latest update timestamp in AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const saveFactsUpdTimestampInAsyncStorage = async (
  updatedAt: number
): Promise<TResponse<TStatus>> => {
  try {
    await AsyncStorage.setItem(KEY_FACTS_STATE_TIMESTAMP, `${updatedAt}`);
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: {
        message:
          err.message ?? 'Could not save the facts update timestamp in storage',
      },
    };
  }
};

/**
 * Get the facts latest update timestamp from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` isFetched: boolean
 */
export const getFactsUpdTimestampFromAsyncStorage = async (): Promise<
  number | null
> => {
  try {
    const result = await AsyncStorage.getItem(KEY_FACTS_STATE_TIMESTAMP);
    if (!result) return null;
    return +result;
  } catch (err: any) {
    console.error(err);
    logMessage(
      '[ NS ] unable to get the facts update timestamp from storage',
      'error'
    );
    return null;
  }
};

export const saveLocalDbFactsInitInAsyncStorage =
  async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(KEY_LOCAL_DB_FACTS_INIT, 'true');
      return true;
    } catch (error: any) {
      logMessage('[ ST ] unable to store facts init value', 'error');
      console.error(`saveLocalDbFactsInitInAsyncStorage: ${error}`);
      return false;
    }
  };

export const getLocalDbFactsInitFromAsyncStorage = async (): Promise<
  boolean | null
> => {
  try {
    const isInit = await AsyncStorage.getItem(KEY_LOCAL_DB_FACTS_INIT);
    return isInit === 'true';
  } catch (err: any) {
    console.error(err);
    logMessage('[ ST ] unable to get facts init value', 'error');
    return null;
  }
};

export const saveShowStatisticsInAsyncStorage = async (
  isShow: boolean
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(KEY_SHOW_STATISTICS, `${isShow}`);
    return true;
  } catch (error: any) {
    logMessage(`[ ST ] unable save 'show statistics' in storage`, 'error');
    console.error(`saveShowStatisticsInAsyncStorage: ${error}`);
    return false;
  }
};

export const getShowStatisticsFromAsyncStorage = async (): Promise<
  boolean | null
> => {
  try {
    const isShow = await AsyncStorage.getItem(KEY_SHOW_STATISTICS);
    if (isShow === null) return null;
    return isShow === 'true';
  } catch (err: any) {
    console.error(err);
    logMessage(`[ ST ] unable get 'show statistics' from storage`, 'error');
    return null;
  }
};
