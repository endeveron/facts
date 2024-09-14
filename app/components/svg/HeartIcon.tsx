import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const HeartIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M3 26.9973C3 41.1212 14.6563 48.6477 23.189 55.3846C27.65 58.9067 32 60 32 60C32 60 36.35 58.9067 40.8111 55.3846C49.3437 48.6477 61 41.1212 61 26.9973C61 12.8732 45.0494 2.85671 32 16.4354C18.9505 2.85671 3 12.8732 3 26.9973Z"
    />
  </Svg>
);

export default HeartIcon;
