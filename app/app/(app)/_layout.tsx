import { Redirect, Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

import { colors, defaultScheme } from '@/core/constants/colors';
import { TScreen } from '@/core/types/common';
import { useSession } from '@/core/context/SessionProvider';
import NotificProvider from '@/core/context/NotificProvider';
import AppSync from '@/core/context/AppSync';

/**
 * This layout checks whether users are authenticated before
 * rendering the child route components and redirects users
 * to the sign-in screen if they are not authenticated.
 */

const screens: TScreen[] = [
  { name: 'categories' },
  { name: 'create' },
  { name: 'facts' },
  { name: 'profile' },
  { name: 'dev' },
];

const AppLayout = () => {
  const scheme = useColorScheme() ?? defaultScheme;
  const { session } = useSession();

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    //<NotificProvider>
    //<AppSync>
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
    //</AppSync>
    //</NotificProvider>
  );
};

export default AppLayout;
