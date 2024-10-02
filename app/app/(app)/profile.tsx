import { View } from 'react-native';

import Favorites from '@/components/Favorites';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import PlusSquaredIcon from '@/components/svg/PlusSquaredIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import { Text } from '@/components/Text';
import { useSession } from '@/core/context/SessionContext';
import { useThemeColor } from '@/core/hooks/useThemeColor';

const profile = () => {
  const { session, signOut } = useSession();
  const accentColor = useThemeColor('accent');

  // only admin can create a new fact
  const isAdmin = session?.user.account.role.index === 3;

  // const { expoPushToken, response, sendNotification } = useNotifications();

  // useEffect(() => {
  //   // console.info('expoPushToken', expoPushToken);
  //   // console.log('response', response);
  // }, [expoPushToken, response]);

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
      icon: <PlusSquaredIcon color={accentColor} />,
    });
  }

  return (
    <ScrollScreen title={title} navbar={{ navItems }}>
      {email && (
        <View className="flex-row justify-between px-4">
          <Text colorName="muted" className="text-sm -translate-y-6">
            {email}
          </Text>
          <Text
            onPress={signOut}
            colorName="muted"
            className="text-base -translate-y-12"
          >
            Sign Out
          </Text>
        </View>
      )}
      {/* <View className="flex-row justify-center">
        <Button
          title="Push"
          containerClassName="w-40"
          handlePress={() =>
            sendNotification({
              title: 'Super title',
              body: 'Sheamless and positive body',
              data: { secretMessage: 'oki-doki' },
            })
          }
        />
      </View> */}
      {/* <View className="flex-row justify-center">
        <Button
          title="Cancel Scheduled"
          containerClassName="w-40"
          handlePress={async () => {
            await cancelAllScheduledNotifications();
          }}
        />
      </View> */}
      <Favorites />
    </ScrollScreen>
  );
};

export default profile;
