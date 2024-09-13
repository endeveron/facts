import { type ViewProps } from 'react-native';
import { SafeAreaView as ReactNativeSafeAreaView } from 'react-native-safe-area-context';

import { useThemeColor } from '@/core/hooks/useThemeColor';

export type TSafeAreaViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function SafeAreaView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: TSafeAreaViewProps) {
  const backgroundColor = useThemeColor('background');

  return (
    <ReactNativeSafeAreaView
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
