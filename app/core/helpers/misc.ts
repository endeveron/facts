import { Dimensions, Platform, StatusBar } from 'react-native';

import { consoleClors } from '@/core/constants/colors';
import { TFactItem } from '@/core/types/fact';
import { TLogType, writeLog } from '@/core/context/LoggingProvider';

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
  if (index === -1) {
    return console.log('No item found');
  }
  const current = items[index];
  console.info(
    `${cyan}%s${gray}%s${reset}`,
    `${title} `,
    `${current.title.slice(0, 30)}...`
  );
};

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
