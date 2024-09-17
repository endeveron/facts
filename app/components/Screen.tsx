import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren } from 'react';
import { Image, useColorScheme, View } from 'react-native';

import Navbar, { Tnavbar } from '@/components/Navbar';
import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';

export type TScreenProps = PropsWithChildren & {
  title?: string;
  navbar?: Tnavbar;
};

const Screen = ({ title, navbar, children }: TScreenProps) => {
  const backgroundColor = useThemeColor('background');
  const theme = useColorScheme() ?? 'light';

  const renderNavbar = () => {
    if (navbar) {
      return <Navbar {...navbar} />;
    } else {
      return null;
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

  const navbarEl = renderNavbar();
  const bgImage = renderBgImage(theme);

  return (
    <View style={{ backgroundColor }} className="relative h-full">
      <StatusBar backgroundColor="transparent" />
      <View className="relative z-10">
        {navbarEl}
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
