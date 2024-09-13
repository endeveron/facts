import { StatusBar } from '@/components/StatusBar';
import { Stack } from 'expo-router';

type TScreen = {
  name: string;
};

const screens: TScreen[] = [{ name: 'sign-in' }, { name: 'sign-up' }];

const AuthLayout = () => {
  return (
    <>
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
      <StatusBar />
    </>
  );
};

export default AuthLayout;
