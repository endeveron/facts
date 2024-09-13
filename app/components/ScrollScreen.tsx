import { StatusBar } from 'expo-status-bar';
import { PropsWithChildren } from 'react';
import { ScrollView, View } from 'react-native';

import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';

export type TScrollScreenProps = PropsWithChildren & {
  title?: string;
};

const ScrollScreen = ({ title, children }: TScrollScreenProps) => {
  const backgroundColor = useThemeColor('background');
  // const theme = useColorScheme() ?? 'light';
  // const statusBarBgColor = theme === 'light' ? '#00000007' : '#00000020';

  return (
    <View style={{ backgroundColor }} className="h-full">
      <ScrollView>
        {title && (
          <Text className="p-4 pt-16 text-3xl font-pbold">{title}</Text>
        )}
        {children}
      </ScrollView>
      {/* <StatusBar backgroundColor={statusBarBgColor} /> */}
      <StatusBar backgroundColor="transparent" />
    </View>
  );
};

export default ScrollScreen;
