import { Platform, StatusBar, Dimensions } from 'react-native';

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

// export const sleep = (ms: number) =>
//   new Promise((resolve) => setTimeout(resolve, ms));
