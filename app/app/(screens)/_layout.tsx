import { Stack } from 'expo-router';

import { TScreen } from '@/core/types/common';

const screens: TScreen[] = [
  { name: 'categories' },
  { name: 'create' },
  { name: 'facts' },
  { name: 'favourites' },
  { name: 'profile' },
];

const ScreensLayout = () => {
  return (
    <Stack>
      {screens.map((screen: TScreen) => (
        <Stack.Screen
          name={screen.name}
          options={{
            headerShown: false,
          }}
          key={screen.name}
        />
      ))}
    </Stack>
  );
};

export default ScreensLayout;
