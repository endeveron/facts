import { Href, router, usePathname } from 'expo-router';
import { ReactElement } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import Card from '@/components/Card';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { useThemeColor } from '@/core/hooks/useThemeColor';

export enum NavItemName {
  home = 'home',
  categories = 'categories',
  facts = 'facts',
  profile = 'profile',
}

type TNavbarItem = {
  name: NavItemName;
  targetPath: Href<string>;
  icon: ReactElement;
  activeIcon: ReactElement;
  currentPath?: string;
  className?: string;
  onPress?: () => void;
};

type TNavbarProps = {
  onPress?: (name: NavItemName) => Promise<void>;
};

const Navbar = ({ onPress }: TNavbarProps) => {
  const pathname = usePathname();
  const iconActiveColor = useThemeColor('iconActive');

  const navItems: TNavbarItem[] = [
    // {
    //   name: NavItemName.home,
    //   targetPath: '/',
    //   icon: <HomeIcon />,
    //   activeIcon: <HomeIcon color={iconActiveColor} />,
    // },
    {
      name: NavItemName.categories,
      targetPath: '/categories',
      icon: <CategoriesIcon />,
      activeIcon: <CategoriesIcon color={iconActiveColor} />,
    },
    {
      name: NavItemName.facts,
      targetPath: '/facts',
      icon: <TextFileIcon />,
      activeIcon: <TextFileIcon color={iconActiveColor} />,
    },
    {
      name: NavItemName.profile,
      targetPath: '/profile',
      icon: <UserIcon />,
      activeIcon: <UserIcon color={iconActiveColor} />,
      className: 'w-6 -translate-x-[6px]',
    },
  ];

  const handlePress = async (name: NavItemName, path: Href<string>) => {
    if (path === pathname) return;
    if (onPress) await onPress(name);
    router.push(path);
  };

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      // exiting={FadeOut.duration(500)}
      className="absolute bottom-8 inset-x-0 flex-row justify-center z-50"
    >
      <Card addClassName="flex-row space-x-10 py-4 px-2 rounded-full">
        {navItems.map((data) => (
          <NavbarItem
            {...data}
            currentPath={pathname}
            onPress={() => handlePress(data.name, data.targetPath)}
            key={data.name}
          />
        ))}
      </Card>
    </Animated.View>
  );
};

const NavbarItem = ({
  currentPath,
  targetPath,
  icon,
  activeIcon,
  className,
  onPress,
}: TNavbarItem) => {
  const handlePress = () => {
    if (onPress) onPress();
    else router.push(targetPath);
  };

  return (
    <TouchableOpacity
      className={`mx-4 ${className ?? ''}`}
      onPress={handlePress}
    >
      {targetPath === currentPath ? activeIcon : icon}
    </TouchableOpacity>
  );
};

export default Navbar;
