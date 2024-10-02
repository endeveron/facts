import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren, useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  ScrollView,
  useColorScheme,
  View,
} from 'react-native';

import Navbar, { Tnavbar } from '@/components/Navbar';
import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';

export type TScreenProps = PropsWithChildren & {
  title?: string;
  navbar?: Tnavbar;
};

const baseAnimConfig = {
  duration: 250,
  useNativeDriver: true,
};

const Screen = ({ title, navbar, children }: TScreenProps) => {
  const backgroundColor = useThemeColor('background');
  const theme = useColorScheme() ?? 'light';

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      ...baseAnimConfig,
    }).start();

    return () => {
      Animated.timing(opacity, {
        toValue: 0,
        ...baseAnimConfig,
      }).start();
    };
  }, []);

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
      <Animated.View className="relative h-full z-10" style={{ opacity }}>
        {navbarEl}
        {title && (
          <Text className="px-4 pt-16 pb-6 text-2xl font-pbold">{title}</Text>
        )}
        {children}
      </Animated.View>
      {bgImage}
    </View>
  );
};

export default Screen;
