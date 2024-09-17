import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const PlusSquaredIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M54.761,54.761C50.856,58.667,44.571,58.667,32,58.667s-18.856,0-22.761-3.905S5.333,44.571,5.333,32s0-18.856,3.905-22.761S19.429,5.333,32,5.333s18.856,0,22.761,3.905S58.667,19.429,58.667,32,58.667,50.856,54.761,54.761ZM40,30H34V24a2,2,0,0,0-4,0v6H24a2,2,0,0,0,0,4h6v6a2,2,0,0,0,4,0V34h6A2,2,0,0,0,40,30Z"
    />
  </Svg>
);

export default PlusSquaredIcon;
