import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { colors, defaultScheme } from '@/core/constants/colors';
import { TScreen } from '@/core/types/common';

const screens: TScreen[] = [
  { name: 'categories' },
  { name: 'create' },
  { name: 'facts' },
  { name: 'profile' },
];

const ScreensLayout = () => {
  const scheme = useColorScheme() ?? defaultScheme;

  return (
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
  );
};

export default ScreensLayout;
