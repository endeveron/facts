import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import {
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_FACTS_FAVORITES,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
  KEY_LOCAL_DB_FACTS_INIT,
  KEY_NOTIF_SUBSCR,
  KEY_NOTIF_SUBSCR_FETCHED,
  KEY_NOTIF_SUBSCR_INIT,
} from '@/core/constants';
import { logMessage } from '@/core/helpers/misc';
import { TUserAuthData } from '@/core/types/auth';
import { TResponse, TStatus } from '@/core/types/common';
import { TNotificationSubscription } from '@/core/types/notification';

/**
 * Retrieves authentication data including token and user information from SecureStore.
 * @returns a Promise that resolves to an object of type `TResponse` { token, user }
 */
export const getAuthDataFromSecureStore = async (): Promise<
  TResponse<TUserAuthData>
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
 * @param authData TUserAuthData
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const saveAuthDataInSecureStore = async ({
  token,
  user,
}: TUserAuthData): Promise<TResponse<TStatus>> => {
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
 * `TResponse` TStatus indicating success or failure.
 */
export const deleteAuthDataFromSecureStore = async (): Promise<
  TResponse<TStatus>
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
    // console.info(
    //   `${gray}%s${reset}`,
    //   'Notification subscription data saved in secure store'
    // );
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
export const saveNotifSubFetchedInAsyncStorage = async (
  isFetched: boolean
): Promise<TResponse<TStatus>> => {
  try {
    await AsyncStorage.setItem(KEY_NOTIF_SUBSCR_FETCHED, `${isFetched}`);
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
          err.message ?? 'Could not save subscription fetched status in store',
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
      '[ NS ] unable to get the notification subscription fetched status from storage',
      'error'
    );
    return null;
  }
};

/** Local DB */

export const saveLocalDbFactsInitInAsyncStorage =
  async (): Promise<boolean> => {
    try {
      await AsyncStorage.setItem(KEY_LOCAL_DB_FACTS_INIT, 'true');
      return true;
    } catch (error: any) {
      logMessage('[ AS ] unable to store facts init value', 'error');
      console.error(error);
      return false;
    }
  };

export const getLocalDbFactsInitFromAsyncStorage = async (): Promise<
  string | null
> => {
  try {
    return await AsyncStorage.getItem(KEY_LOCAL_DB_FACTS_INIT);
  } catch (err: any) {
    console.error(err);
    logMessage('[ AS ] unable to get facts init value', 'error');
    return null;
  }
};

// /**
//  * Stores notifications schedule in AsyncStorage.
//  * @param args - object of type { hour: number }
//  * @returns a Promise that resolves to an object of type
//  * `TResponse` TStatus indicating success or failure.
//  */
// export const saveNotifScheduleInAsyncStorage = async (
//   schedule: string
// ): Promise<TResponse<TStatus>> => {
//   try {
//     const subResult = await getNotifSubFromSecureStore();
//     if (subResult.error) {
//       logMessage(
//         `[ NS ] get subscription from store: ${subResult.error.message}`,
//         'error'
//       );
//       return {
//         data: null,
//         error: { message: subResult.error.message },
//       };
//     }
//     const getErrMessage = 'Could not get schedule from store';
//     if (!subResult || !subResult.data) {
//       logMessage(
//         `[ NS ] get subscription from store: ${getErrMessage}`,
//         'error'
//       );
//       return {
//         data: null,
//         error: { message: getErrMessage },
//       };
//     }

//     const subscription = subResult.data;
//     subscription.schedule = schedule;

//     const saveRes = await saveNotifSubInSecureStore(subscription);
//     if (saveRes.error) {
//       logMessage(
//         `[ NS ] save subscription in store: ${saveRes.error.message}`,
//         'error'
//       );
//       return {
//         data: null,
//         error: { message: saveRes.error.message },
//       };
//     }
//     const saveErrMessage = 'Could not save subscription in store';
//     if (!saveRes || !saveRes.data) {
//       logMessage(
//         `[ NS ] save subscription in store: ${saveErrMessage}`,
//         'error'
//       );
//       return {
//         data: null,
//         error: { message: saveErrMessage },
//       };
//     }

//     return {
//       data: { success: true },
//       error: null,
//     };
//   } catch (err: any) {
//     console.error(err);
//     return {
//       data: null,
//       error: { message: 'Could not save schedule' },
//     };
//   }
// };

// /**
//  * Retrieves notifications schedule from AsyncStorage.
//  * @returns a Promise that resolves to an object of type
//  * `TResponse` schedule: string
//  */
// export const getNotifScheduleFromAsyncStorage = async (): Promise<
//   TResponse<string | null>
// > => {
//   const result = await AsyncStorage.getItem(KEY_NOTIF_SUBSCR);
//   if (!result) {
//     return {
//       data: null,
//       error: { message: 'Unable to get data from store' },
//     };
//   }
//   const subscription = JSON.parse(result);
//   return {
//     data: subscription.schedule,
//     error: null,
//   };
// };

// export const removeNotifScheduleFromAsyncStorage =
//   async (): Promise<void> => {};

/**
 * Deletes facts data from AsyncStorage.
 * @returns a Promise that resolves to an object of type
 * `TResponse` TStatus indicating success or failure.
 */
export const deleteFactsDataFromAsyncStorage = async (): Promise<
  TResponse<TStatus>
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
