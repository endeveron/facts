import { Href, router } from 'expo-router';
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
}

export type TNavbarItem = {
  name: NavItemName;
  href: Href<string>;
  icon: ReactElement;
  className?: string;
  onPress?: () => void;
};

export type Tnavbar = {
  navItems: TNavbarItem[];
  onPress?: (name: NavItemName) => Promise<void>;
};

const Navbar = ({ navItems, onPress }: Tnavbar) => {
  if (!navItems?.length) return null;

  const handlePress = async (name: NavItemName, path: Href<string>) => {
    if (onPress) await onPress(name);
    router.push(path);
  };

  return (
    <View
      // <Animated.View>
      // entering={FadeIn.duration(400)}
      // exiting={FadeOut.duration(500)}
      className="absolute bottom-8 inset-x-0 flex-row justify-center z-50"
    >
      <Card addClassName="flex-row p-4 rounded-full">
        {navItems.map((data) => (
          <NavbarItem
            {...data}
            onPress={() => handlePress(data.name, data.href)}
            key={data.name}
          />
        ))}
      </Card>
    </View>
  );
};

const NavbarItem = ({ href, icon, className, onPress }: TNavbarItem) => {
  const handlePress = () => {
    if (onPress) onPress();
    else router.push(href);
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
