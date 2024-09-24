import { View } from 'react-native';

import Favorites from '@/components/Favorites';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import PlusSquaredIcon from '@/components/svg/PlusSquaredIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import { Text } from '@/components/Text';
import { useAppContext } from '@/core/context/AppContext';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { Href } from 'expo-router';

const profile = () => {
  const { auth } = useAppContext();
  const accentColor = useThemeColor('accent');

  const title = auth.session?.user.account.name ?? 'Profile';
  const email = auth.session?.user.account.email;

  const navItems: TNavbarItem[] = [
    {
      name: NavItemName.categories,
      href: '/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: NavItemName.create,
      href: '/create',
      icon: <PlusSquaredIcon color={accentColor} />,
    },
    {
      name: NavItemName.facts,
      href: '/facts',
      icon: <TextFileIcon />,
    },
  ];

  return (
    <ScrollScreen title={title} navbar={{ navItems }}>
      {email && (
        <View className="flex-row justify-between px-4">
          <Text colorName="muted" className="text-sm -translate-y-6">
            {email}
          </Text>
          <Text
            onPress={auth.signOut}
            colorName="muted"
            className="text-base -translate-y-12"
          >
            Sign Out
          </Text>
        </View>
      )}
      <Favorites />
    </ScrollScreen>
  );
};

export default profile;
