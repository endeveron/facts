import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_FAVORITES,
  // KEY_FACTS_NEXT_ITEM,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
  KEY_NOTIF_SCHEDULE,
  KEY_SUBSCR_NOTIF,
} from '@/core/constants';
import { TAuthData, TUser } from '@/core/types/auth';
import { EFactsStateKey, TFactItem, TFactsState } from '@/core/types/fact';

import { consoleClors } from '@/core/constants/colors';
import { TResponse } from '@/core/types/common';

const { gray, green, red, reset } = consoleClors;

/**
 * Retrieves authentication data including token and user information from SecureStore.
 * @returns a Promise that resolves to an object of type `TResponse` { token, user }
 */
export const getAuthDataFromSecureStore = async (): Promise<
  TResponse<{
    token: string;
    user: TUser;
  }>
> => {
  try {
    const token = await SecureStore.getItemAsync(KEY_AUTH_TOKEN);
    if (!token)
      return {
        data: null,
        error: null,
      };
    const userStr = await SecureStore.getItemAsync(KEY_AUTH_USER);
    if (!userStr) {
      return {
        data: null,
        error: { message: 'Could not get user data from store.' },
      };
    }
    const user = JSON.parse(userStr as string);
    // console.log('Auth data retrieved from store.');
    return {
      data: {
        token,
        user,
      },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not get user data from store.' },
    };
  }
};

/**
 * Stores authentication data in SecureStore
 * @param authData - { token: string; user: TUser }
 * @returns a Promise that resolves to an object of type
 * `TResponse` { success: boolean } indicating success or failure.
 */
export const saveAuthDataInSecureStore = async ({
  token,
  user,
}: TAuthData): Promise<TResponse<{ success: boolean }>> => {
  try {
    // add auth token
    await SecureStore.setItemAsync(KEY_AUTH_TOKEN, token);
    // add user data
    const userStr = JSON.stringify(user);
    await SecureStore.setItemAsync(KEY_AUTH_USER, userStr);
    // console.log('Auth data saved to storage.');
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not save data to storage' },
    };
  }
};

/**
 * Deletes authentication data from SecureStore.
 * @returns a Promise that resolves to an object of type
 * `TResponse` { success: boolean } indicating success or failure.
 */
export const deleteAuthDataFromSecureStore = async (): Promise<
  TResponse<{ success: boolean }>
> => {
  try {
    await SecureStore.deleteItemAsync(KEY_AUTH_TOKEN);
    await SecureStore.deleteItemAsync(KEY_AUTH_USER);
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
 * Retrieves notification subscription data from SecureStore.
 * @returns a Promise that resolves to an object of type `TResponse` { expoPushToken }
 */
export const getNotifSubscrDataFromSecureStore = async (): Promise<
  TResponse<{
    expoPushToken: string;
  }>
> => {
  try {
    const expoPushToken = await SecureStore.getItemAsync(KEY_SUBSCR_NOTIF);
    if (!expoPushToken)
      return {
        data: null,
        error: null,
      };
    // console.info(
    //   `${gray}%s${reset}`,
    //   'Notification subscription data retrieved from secure store'
    // );
    return {
      data: {
        expoPushToken,
      },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Could not get user data from store.' },
    };
  }
};

/**
 * Stores notifications schedule in AsyncStorage.
 * @param args - object of type { hour: number }
 * @returns a Promise that resolves to an object of type
 * `TResponse` { success: boolean } indicating success or failure.
 */
export const saveNotifScheduleInAsyncStorage = async (
  schedule: string
): Promise<TResponse<{ success: boolean }>> => {
  try {
    await AsyncStorage.setItem(KEY_NOTIF_SCHEDULE, schedule);
    // console.info(
    //   `${green}%s${reset}`,
    //   `Notifications schedule saved in AsyncStorage`
    // );
    // writeLog('Notifications schedule saved in AsyncStorage', 'success');
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not save schedule' },
    };
  }
};

/**
 * Retrieves notifications schedule from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` { hour: number }
 */
export const getNotifScheduleFromAsyncStorage = async (): Promise<
  TResponse<string | null>
> => {
  const schedule = await AsyncStorage.getItem(KEY_NOTIF_SCHEDULE);
  return {
    data: schedule,
    error: null,
  };
};
export const removeNotifScheduleFromAsyncStorage = async (): Promise<void> => {
  await AsyncStorage.removeItem(KEY_NOTIF_SCHEDULE);
};

// /**
//  * Stores facts state in AsyncStorage.
//  * @param factItem - object of type TFactItem
//  * @returns a Promise that resolves to an object of type
//  * `TResponse` { success: boolean } indicating success or failure.
//  */
// export const saveNextFactInAsyncStorage = async (
//   factItem: TFactItem
// ): Promise<TResponse<{ success: boolean }>> => {
//   try {
//     const nextFactItemStr = JSON.stringify(factItem);
//     await AsyncStorage.setItem(KEY_FACTS_NEXT_ITEM, nextFactItemStr);
//     // console.info(
//     //   `${green}%s${gray}%s${reset}`,
//     //   `The next fact item saved in AsyncStorage `,
//     //   `${factItem.title.slice(0, 30)}...`
//     // );
//     return {
//       data: { success: true },
//       error: null,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return {
//       data: null,
//       error: { message: 'Could not save the fact item' },
//     };
//   }
// };

/**
 * Stores facts state in AsyncStorage.
 * @param {TFactsState} state - object of type TFactsState
 * @returns a Promise that resolves to an object of type
 * `TResponse` { success: boolean } indicating success or failure.
 */
export const saveFactsStateInAsyncStorage = async ({
  stateKey,
  state,
  favorites,
}: {
  stateKey: EFactsStateKey;
  state: TFactsState;
  favorites: string[];
}): Promise<TResponse<{ success: boolean }>> => {
  try {
    const stateStr = JSON.stringify(state);
    await AsyncStorage.setItem(stateKey, stateStr);

    const favoritesStr = JSON.stringify(favorites);
    await AsyncStorage.setItem(KEY_FACTS_FAVORITES, favoritesStr);

    // console.info(
    //   `${green}%s${gray}%s${reset}`,
    //   `Facts state saved in AsyncStorage `,
    //   `${stateKey}`
    // );
    // console.info(
    //   `${gray}%s${reset}`,
    //   `${state.facts[0].title.slice(0, 30)}...`
    // );
    return {
      data: { success: true },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: 'Could not save facts' },
    };
  }
};

/**
 * Retrieves facts state from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` { state: TFactsState; favorites: string[] }
 */
export const getFactsStateFromAsyncStorage = async (
  stateKey: EFactsStateKey
): Promise<
  TResponse<{
    state: TFactsState;
    favorites: string[];
  }>
> => {
  try {
    const stateStr = await AsyncStorage.getItem(stateKey);
    const favoritesStr = await AsyncStorage.getItem(KEY_FACTS_FAVORITES);
    if (!stateStr || !favoritesStr) {
      return {
        data: null,
        error: null,
      };
    }

    const state: TFactsState = JSON.parse(stateStr);
    const favorites: string[] = JSON.parse(favoritesStr);
    // console.info(
    //   `${green}%s${gray}%s${reset}`,
    //   `Facts state retrieved from AsyncStorage `,
    //   `${stateKey}`
    // );
    // console.info(
    //   `${gray}%s${reset}`,
    //   `${state.facts[0].title.slice(0, 30)}...`
    // );
    return {
      data: {
        state,
        favorites,
      },
      error: null,
    };
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? 'Unable to restore facts' },
    };
  }
};

/**
 * Deletes facts data from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` { success: boolean } indicating success or failure.
 */
export const deleteFactsDataFromAsyncStorage = async (): Promise<
  TResponse<{ success: boolean }>
> => {
  const errMessage = 'Could not clear facts data';
  try {
    const clear = async () => {
      // await AsyncStorage.removeItem(KEY_FACTS_NEXT_ITEM);
      await AsyncStorage.removeItem(KEY_FACTS_FAVORITES);
      await AsyncStorage.removeItem(KEY_FACTS_STATE);
      await AsyncStorage.removeItem(KEY_FACTS_STATE_CAT);
    };
    const check = async (): Promise<boolean> => {
      const itemStr = await AsyncStorage.getItem(KEY_FACTS_FAVORITES);
      return itemStr === null;
    };

    await clear();
    const clean = await check();
    if (clean) {
      // console.info(`${red}%s${reset}`, 'Facts data deleted from AsyncStorage');
      return {
        data: { success: true },
        error: null,
      };
    } else {
      console.error(errMessage);
      return {
        data: null,
        error: { message: errMessage },
      };
    }
  } catch (err: any) {
    console.error(err);
    return {
      data: null,
      error: { message: err.message ?? errMessage },
    };
  }
};

// /**
//  * Retrieves the next fact item from AsyncStorage.
//  * @returns a Promise that resolves to an object of type
//  * `TResponse` { nextFactItem: TFactItem }
//  */
// export const getNextFactFromAsyncStorage = async (): Promise<
//   TResponse<TFactItem>
// > => {
//   let data = null;
//   try {
//     const nextFactItemStr = await AsyncStorage.getItem(KEY_FACTS_NEXT_ITEM);

//     if (nextFactItemStr) {
//       const nextFactItem: TFactItem = JSON.parse(nextFactItemStr);
//       data = nextFactItem;
//       console.info(
//         `${green}%s${gray}%s${reset}`,
//         `The next fact item fetched from AsyncStorage `,
//         `${nextFactItem.title.slice(0, 30)}...`
//       );
//     }

//     return {
//       data,
//       error: null,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return {
//       data: null,
//       error: { message: err.message ?? 'Unable to restore the next fact item' },
//     };
//   }
// };
