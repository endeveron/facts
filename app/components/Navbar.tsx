import { Href, router, useLocalSearchParams, usePathname } from 'expo-router';
import { ReactElement } from 'react';
import { TouchableOpacity, View } from 'react-native';
// import Animated, { FadeIn } from 'react-native-reanimated';

import Card from '@/components/Card';

export enum NavItemName {
  create = 'create',
  categories = 'categories',
  facts = 'facts',
  home = 'home',
  profile = 'profile',
  dev = 'dev',
}

export type TNavbarItem = {
  name: NavItemName;
  href: string;
  icon: ReactElement;
  className?: string;
  onPress?: () => void;
};

export type Tnavbar = {
  navItems: TNavbarItem[];
  onPress?: (name: NavItemName) => Promise<void>;
};

const Navbar = ({ navItems, onPress }: Tnavbar) => {
  const { category } = useLocalSearchParams();
  const pathname = usePathname();

  if (!navItems?.length) return null;

  const handlePress = async (name: NavItemName, path: string) => {
    if (onPress) await onPress(name);
    router.push(path as Href<string>);
  };

  return (
    <View
      // <Animated.View>
      // entering={FadeIn.duration(400)}
      // exiting={FadeOut.duration(500)}
      className="absolute bottom-8 inset-x-0 flex-row justify-center z-50"
    >
      <Card addClassName="flex-row p-4 rounded-full">
        {navItems.map((data) => {
          // exclude the `facts` item for the `/facts` route
          // if the `category` url search param is not provided
          if (
            data.name === NavItemName.facts &&
            pathname === '/facts' &&
            !category
          ) {
            return null;
          }
          return (
            <NavbarItem
              {...data}
              onPress={() => handlePress(data.name, data.href)}
              key={data.name}
            />
          );
        })}
      </Card>
    </View>
  );
};

const NavbarItem = ({ href, icon, className, onPress }: TNavbarItem) => {
  const handlePress = () => {
    if (onPress) onPress();
    else router.push(href as Href<string>);
  };

  return (
    <TouchableOpacity
      className={`mx-4 ${className ?? ''}`}
      onPress={handlePress}
    >
      {icon}
    </TouchableOpacity>
  );
};

export default Navbar;
