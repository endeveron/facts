import { Text as ReactNativeText, type TextProps } from 'react-native';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { colors } from '@/core/constants/colors';

export type TTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  colorName?: keyof typeof colors.light & keyof typeof colors.dark;
};

export function Text({
  style,
  lightColor,
  darkColor,
  colorName,
  ...rest
}: TTextProps) {
  const color = useThemeColor(colorName ?? 'text', {
    light: lightColor,
    dark: darkColor,
  });

  return <ReactNativeText style={[{ color }, style]} {...rest} />;
}
