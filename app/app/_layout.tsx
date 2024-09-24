import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { AppContextProvider } from '@/core/context/AppContext';
import { TScreen } from '@/core/types/common';
import { colors, defaultScheme } from '@/core/constants/colors';

// prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const scheme = useColorScheme() ?? defaultScheme;
  const [loaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-ExtraBold': require('../assets/fonts/Poppins-ExtraBold.ttf'),
    'Poppins-ExtraLight': require('../assets/fonts/Poppins-ExtraLight.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Thin': require('../assets/fonts/Poppins-Thin.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    const appReady = async () => {
      // change the root view background color
      await SystemUI.setBackgroundColorAsync(colors[scheme].background);

      if (loaded) {
        SplashScreen.hideAsync();
      }
    };
    appReady();
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const screens: TScreen[] = [
    { name: 'index' },
    { name: '(auth)' },
    { name: '(screens)' },
  ];

  return (
    <AppContextProvider>
      <Stack>
        {screens.map((screen: TScreen) => (
          <Stack.Screen
            name={screen.name}
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: colors[scheme].background,
              },
            }}
            key={screen.name}
          />
        ))}
      </Stack>
    </AppContextProvider>
  );
};

export default RootLayout;
