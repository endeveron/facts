/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { colors } from '@/core/constants/colors';

export function useThemeColor(
  colorName: keyof typeof colors.light & keyof typeof colors.dark,
  props?: { light?: string; dark?: string }
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromTheme = colors[theme][colorName];

  if (props) {
    const colorFromProps = props[theme];
    if (colorFromProps) return colorFromProps;
  }

  return colorFromTheme;
}
