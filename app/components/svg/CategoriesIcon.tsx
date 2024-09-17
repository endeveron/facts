import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const CategoriesIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M6.33333 18.6667C6.33333 11.6711 12.0044 6 19 6C25.9956 6 31.6667 11.6711 31.6667 18.6667C31.6667 25.6623 25.9956 31.3333 19 31.3333C12.0044 31.3333 6.33333 25.6623 6.33333 18.6667Z"
    />
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M33 45.6667C33 38.6709 38.6709 33 45.6667 33C52.6624 33 58.3333 38.6709 58.3333 45.6667C58.3333 52.6624 52.6624 58.3333 45.6667 58.3333C38.6709 58.3333 33 52.6624 33 45.6667Z"
    />
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M58.3333 18.6667C58.3333 11.6711 52.6624 6 45.6667 6C38.6709 6 33 11.6711 33 18.6667C33 25.6623 38.6709 31.3333 45.6667 31.3333C52.6624 31.3333 58.3333 25.6623 58.3333 18.6667Z"
    />
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M31.3333 45.6667C31.3333 38.6709 25.6623 33 18.6667 33C11.6711 33 6 38.6709 6 45.6667C6 52.6624 11.6711 58.3333 18.6667 58.3333C25.6623 58.3333 31.3333 52.6624 31.3333 45.6667Z"
    />
  </Svg>
);

export default CategoriesIcon;
