import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Dimensions, Platform, StatusBar } from 'react-native';

import { consoleClors } from '@/core/constants/colors';
import { TFactItem } from '@/core/types/fact';

import { KEY_DEV_LOGS, KEY_NOTIF_SUBSCR } from '@/core/constants';
import { TLogItem, TLogType } from '@/core/types/common';

const { cyan, green, gray, red, reset } = consoleClors;

export const getFullScreenHeight = () => {
  const { height: windowHeight } = Dimensions.get('window');

  let statusBarHeight = 0;
  if (Platform.OS === 'ios') {
    statusBarHeight = +Platform.Version >= 11 ? 44 : 20;
  } else if (Platform.OS === 'android') {
    statusBarHeight = StatusBar.currentHeight as number;
  }

  return windowHeight + statusBarHeight;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const logItem = (title: string, items: TFactItem[], itemId?: string) => {
  if (!items.length || !itemId) return;
  if (!itemId) return console.log('No item id provided');

  const index = items.findIndex((item) => item.id === itemId);
  if (index >= items.length) return console.log('Bad index');
  if (index === -1) return console.log('No item found');

  const current = items[index];
  console.info(
    `${cyan}%s${gray}%s${reset}`,
    `${title} `,
    `${current.title.slice(0, 30)}...`
  );
};

export async function writeLog(message: string, type?: TLogType) {
  // configure log item
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const log = {
    date: `${day}-${month} ${hour}:${minute}`,
    message,
    timestamp: Date.now(),
    type: type ?? 'info',
  };

  // get logs from storage
  let logsFromStorage: TLogItem[] = [];
  const logsFromStorageStr = await AsyncStorage.getItem(KEY_DEV_LOGS);
  if (logsFromStorageStr) logsFromStorage = JSON.parse(logsFromStorageStr);
  // add new log
  const newLogs = [log, ...logsFromStorage];
  // save to storage
  const logsStr = JSON.stringify(newLogs);
  await AsyncStorage.setItem(KEY_DEV_LOGS, logsStr);

  return newLogs;
}

/**
 * Logs messages with different colors based on the type provided
 * (error, success, or default).
 * @param {string} message a string containing the message to be logged.
 * @param {TLogType} [type] an optional parameter of type "info" | "success" | "error".
 */
export const logMessage = (message: string, type?: TLogType) => {
  switch (type) {
    case 'error': {
      console.info(`${red}%s${reset}`, message);
      writeLog(message, 'error');
      break;
    }
    case 'success': {
      console.info(`${green}%s${reset}`, message);
      writeLog(message, 'success');
      break;
    }
    default: {
      console.info(`${cyan}%s${reset}`, message);
      writeLog(message);
    }
  }
};

/**
 * Logs the keys stored in AsyncStorage and SecureStore.
 */
export const logStoreData = async () => {
  const asyncKeys = await AsyncStorage.getAllKeys();
  console.info(`${cyan}%s${reset}`, `[ AS ] async storage:`);
  if (asyncKeys.length) {
    for (let key of asyncKeys) {
      console.info(`${cyan}%s${reset}`, `[ AS ] - ${key}`);
    }
  } else {
    console.info(`${cyan}%s${reset}`, `[ AS ] - no items`);
  }

  console.info(`${cyan}%s${reset}`, `[ SS ] secure store:`);
  const notifSub = await SecureStore.getItemAsync(KEY_NOTIF_SUBSCR);
  if (notifSub) {
    console.info(`${cyan}%s${reset}`, ` ${KEY_NOTIF_SUBSCR}`);
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
