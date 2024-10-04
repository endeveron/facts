import { useFonts } from 'expo-font';
import { Slot, SplashScreen } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { colors, defaultScheme } from '@/core/constants/colors';
import { AppStateProvider } from '@/core/context/AppStateProvider';
import { LoggingProvider } from '@/core/context/LoggingProvider';
import { PushNotificationsProvider } from '@/core/context/PushNotificationsContext';
import { SessionProvider } from '@/core/context/SessionContext';

// prevent the splash screen from auto-hiding before asset loading is complete
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
    const prepareApp = async () => {
      // change the root view background color
      await SystemUI.setBackgroundColorAsync(colors[scheme].background);

      // app is ready, hide splash screen
      await SplashScreen.hideAsync();
    };

    loaded && prepareApp();
  }, [loaded]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <LoggingProvider>
      <AppStateProvider>
        <SessionProvider>
          <PushNotificationsProvider>
            <Slot />
          </PushNotificationsProvider>
        </SessionProvider>
      </AppStateProvider>
    </LoggingProvider>
  );
};

export default RootLayout;
