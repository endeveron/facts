import { Stack } from 'expo-router';

type TScreen = {
  name: string;
};

const screens: TScreen[] = [
  { name: 'create' },
  { name: 'facts' },
  { name: 'favourites' },
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
