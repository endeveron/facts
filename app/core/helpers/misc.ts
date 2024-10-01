import { Dimensions, Platform, StatusBar } from 'react-native';

import { consoleClors } from '@/core/constants/colors';
import { TFactItem } from '@/core/types/fact';

const { cyan, gray, reset } = consoleClors;

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

// export const subtractMinute = ([hours, minutes]: number[]): number[] => {
//   if (hours === 0 && minutes === 0) return [23, 59];

//   // calculate total minutes
//   let totalMinutes = hours * 60 + minutes;
//   // subtract one minute
//   totalMinutes -= 1;

//   // calculate new hours and minutes
//   const newHours = Math.floor(totalMinutes / 60);
//   const newMinutes = totalMinutes % 60;

//   return [newHours, newMinutes];
// };

// export const sleep = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));
