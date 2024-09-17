import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const UserIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M53.6667 46C53.6667 52.6275 53.6667 58 32.3333 58C11 58 11 52.6275 11 46C11 39.3725 20.5513 34 32.3333 34C44.1155 34 53.6667 39.3725 53.6667 46Z"
    />
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M32 28C38.6274 28 44 22.6274 44 16C44 9.37258 38.6274 4 32 4C25.3726 4 20 9.37258 20 16C20 22.6274 25.3726 28 32 28Z"
    />
  </Svg>
);

export default UserIcon;
