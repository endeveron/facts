import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';

export type TScreenProps = PropsWithChildren & {
  title?: string;
};

const Screen = ({ title, children }: TScreenProps) => {
  const backgroundColor = useThemeColor('background');
  // const theme = useColorScheme() ?? 'light';
  // const statusBarBgColor = theme === 'light' ? '#00000007' : '#00000020';

  return (
    <View style={{ backgroundColor }} className="h-full">
      {title && <Text className="p-4 pt-16 text-3xl font-pbold">{title}</Text>}
      {children}
      {/* <StatusBar backgroundColor={statusBarBgColor} /> */}
      <StatusBar backgroundColor="transparent" />
    </View>
  );
};

export default Screen;
