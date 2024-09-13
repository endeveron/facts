import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { useColorScheme } from 'react-native';

export type TStatusBarProps = {
  lightColor?: string;
  darkColor?: string;
};

export function StatusBar({
  lightColor,
  darkColor,
  ...otherProps
}: TStatusBarProps) {
  const theme = useColorScheme() ?? 'light';

  const backgroundColor = useThemeColor('background');

  return (
    <ExpoStatusBar
      style={theme === 'light' ? 'dark' : 'light'}
      backgroundColor={backgroundColor}
      {...otherProps}
    />
  );
}
