import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, useColorScheme, View } from 'react-native';

import Navbar from '@/components/Navbar';
import { TScreenProps } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';

const ScrollScreen = ({ title, navbar, children }: TScreenProps) => {
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
      <View className="relative h-full z-10">
        {navbarEl}
        <ScrollView>
          {title && (
            <Text className="px-4 pt-16 pb-6 text-2xl font-pbold">{title}</Text>
          )}
          {children}
        </ScrollView>
      </View>
      {bgImage}
    </View>
  );
};

export default ScrollScreen;
