import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { KEY_NOTIF_SUBSCR } from '@/core/constants';
import { consoleClors } from '@/core/constants/colors';
import { addLogToDB } from '@/core/helpers/db/logs';
import { TLogType } from '@/core/types/common';

const { cyan, green, gray, red, yellow, reset } = consoleClors;

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getTime = (timestamp?: number) => {
  const now = timestamp ? new Date(timestamp) : new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  return {
    date: `${day}-${month} ${hour}:${minute}`,
    timestamp: timestamp || Date.now(),
  };
};
export const getTimeFromNow = (timeShiftInMiliseconds: number) => {
  const curTimestamp = Date.now();
  const newTimestamp = curTimestamp + timeShiftInMiliseconds;
  const newDate = new Date(newTimestamp);
  return {
    hour: newDate.getHours(),
    minute: newDate.getMinutes(),
  };
};

export const saveLog = async (message: string, type?: TLogType) => {
  // configure log item
  const { date, timestamp } = getTime();
  const log = {
    date,
    message,
    timestamp,
    type: type ?? 'info',
  };

  // // get logs from storage
  // let logsFromStorage: TLogItem[] = [];
  // const logsFromStorageStr = await AsyncStorage.getItem(KEY_DEV_LOGS);
  // if (logsFromStorageStr) logsFromStorage = JSON.parse(logsFromStorageStr);
  // // add new log
  // const newLogs = [log, ...logsFromStorage];
  // // save to storage
  // const logsStr = JSON.stringify(newLogs);
  // await AsyncStorage.setItem(KEY_DEV_LOGS, logsStr);

  await addLogToDB(log);
};

/**
 * Logs messages with different colors based on the type provided
 * (error, success, or default).
 * @param {string} message a string containing the message to be logged.
 * @param {TLogType} [type] an optional parameter of type "info" | "success" | "error".
 */
export const logMessage = async (message: string, type?: TLogType) => {
  try {
    switch (type) {
      case 'error': {
        console.info(`${red}%s${reset}`, message);
        await saveLog(message, 'error');
        break;
      }
      case 'success': {
        console.info(`${green}%s${reset}`, message);
        await saveLog(message, 'success');
        break;
      }
      case 'warning': {
        console.info(`${yellow}%s${reset}`, message);
        await saveLog(message, 'warning');
        break;
      }
      default: {
        console.info(`${cyan}%s${reset}`, message);
        await saveLog(message);
      }
    }
  } catch (error: any) {
    console.error(`logMessage: ${error}`);
  }
};

/**
 * Logs the keys stored in AsyncStorage and SecureStore.
 */
export const logStoreData = async () => {
  const asyncKeys = await AsyncStorage.getAllKeys();
  console.info(`${cyan}%s${reset}`, `[ ST ] async storage:`);
  if (asyncKeys.length) {
    for (let key of asyncKeys) {
      console.info(`${cyan}%s${reset}`, `[ ST ] - ${key}`);
    }
  } else {
    console.info(`${cyan}%s${reset}`, `[ ST ] - no items`);
  }

  console.info(`${cyan}%s${reset}`, `[ SS ] secure store:`);
  const notifSub = await SecureStore.getItemAsync(KEY_NOTIF_SUBSCR);
  if (notifSub) {
    console.info(`${cyan}%s${reset}`, `[ SS ] - ${KEY_NOTIF_SUBSCR}`);
  } else {
    console.info(`${cyan}%s${reset}`, `[ SS ] - no items`);
  }
};

/**
 * Converts object keys from snake_case to camelCase.
 * @param obj - Record<string, any>
 * @returns a new object where the keys are converted from snake_case to camelCase.
 */
export const formatObjectKeys = <O extends Record<string, any>>(
  obj: Record<string, any>
): { [K in keyof O]: O[K] } => {
  const toCamelCase = (str: string): string => {
    return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
  };

  return Object.keys(obj).reduce((acc, key) => {
    const newKey = toCamelCase(key) as keyof O;
    acc[newKey] = obj[key];
    return acc;
  }, {} as { [K in keyof O]: O[K] });
};

/**
 * Converts an enum object into an array of its string values.
 * @param {any} enumObj - an object representing an enum.
 */
export const enumToArray = (enumObj: any): string[] =>
  Object.keys(enumObj).map((category) => category);
