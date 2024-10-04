import * as Notifications from 'expo-notifications';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import Favorites from '@/components/Favorites';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import LogsIcon from '@/components/svg/LogsIcon';
import PlusSquaredIcon from '@/components/svg/PlusSquaredIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import { Text } from '@/components/Text';
import { useNotifications } from '@/core/context/PushNotificationsContext';
import { useSession } from '@/core/context/SessionContext';
import { useThemeColor } from '@/core/hooks/useThemeColor';

const profile = () => {
  const { session, signOut } = useSession();
  const { scheduleDailyNotification, unscheduleDailyNotification } =
    useNotifications();
  const accentColor = useThemeColor('accent');

  // only admin can create a new fact
  const isAdmin = session?.user.account.role.index === 3;

  const title = session?.user.account.name ?? 'Profile';
  const email = session?.user.account.email;

  const navItems: TNavbarItem[] = [
    {
      name: NavItemName.categories,
      href: '/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: NavItemName.facts,
      href: '/facts',
      icon: <TextFileIcon />,
    },
  ];

  if (isAdmin) {
    navItems.splice(1, 0, {
      name: NavItemName.create,
      href: '/create',
      icon: <PlusSquaredIcon />,
    });
    navItems.push({
      name: NavItemName.dev,
      href: '/dev',
      icon: <LogsIcon />,
    });
  }

  const scheduleNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Facts',
        body: 'Hey there!',
        data: { status: 'ok' },
      },
      trigger: { seconds: 1 },
    });
  };

  return (
    <ScrollScreen title={title} navbar={{ navItems }}>
      <View className="flex-row justify-between px-4">
        {!!email ? (
          <Text colorName="muted" className="text-sm -translate-y-6">
            {email}
          </Text>
        ) : null}
        <Text
          onPress={signOut}
          colorName="muted"
          className="flex text-base -translate-y-12"
        >
          Sign Out
        </Text>
      </View>

      <View className="flex-col items-center">
        <Button
          title="Send one-time notification"
          containerClassName="mb-4 w-80"
          handlePress={scheduleNotification}
        />
        <Button
          title="Schedule daily notification"
          containerClassName="mb-4 w-80"
          handlePress={() => scheduleDailyNotification({})}
        />
        <Button
          title="Unschedule notification"
          containerClassName="mb-8 w-80"
          handlePress={async () => unscheduleDailyNotification()}
        />
      </View>
      <Favorites />
    </ScrollScreen>
  );
};

export default profile;
