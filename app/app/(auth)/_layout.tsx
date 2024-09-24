import { StatusBar } from '@/components/StatusBar';
import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { colors, defaultScheme } from '@/core/constants/colors';

type TScreen = {
  name: string;
};

const screens: TScreen[] = [{ name: 'sign-in' }, { name: 'sign-up' }];

const AuthLayout = () => {
  const scheme = useColorScheme() ?? defaultScheme;

  return (
    <>
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
      <StatusBar />
    </>
  );
};

export default AuthLayout;
