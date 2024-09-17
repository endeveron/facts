import { usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren } from 'react';
import { Image, useColorScheme, View } from 'react-native';

import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import Navbar from '@/components/Navbar';
import { HIDE_NAVBAR_PATH_ARRAY } from '@/core/constants';

export type TScreenProps = PropsWithChildren & {
  title?: string;
};

const Screen = ({ title, children }: TScreenProps) => {
  const pathname = usePathname();
  const backgroundColor = useThemeColor('background');
  const theme = useColorScheme() ?? 'light';

  const renderNavbar = () => {
    if (HIDE_NAVBAR_PATH_ARRAY.includes(pathname)) {
      return null;
    } else {
      return <Navbar />;
    }
  };

  const renderBgImage = (theme: 'light' | 'dark') => {
    const imgSource =
      theme === 'light'
        ? require('@/assets/images/backgrounds/starwars-light.png')
        : require('@/assets/images/backgrounds/starwars-dark.png');
    return (
      <View className="absolute inset-x-0 inset-y-0 z-0">
        <Image
          className="w-full h-full"
          source={imgSource}
          resizeMode="cover"
        />
      </View>
    );
  };

  const navbar = renderNavbar();
  const bgImage = renderBgImage(theme);

  return (
    <View style={{ backgroundColor }} className="relative h-full">
      <StatusBar backgroundColor="transparent" />
      <View className="relative flex-1 z-10">
        {navbar}
        {title && (
          <Text className="px-4 pt-16 pb-6 text-2xl font-pbold">{title}</Text>
        )}
        {children}
      </View>
      {bgImage}
    </View>
  );
};

export default Screen;
