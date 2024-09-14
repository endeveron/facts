import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const ProfileIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M32,59.175A27.175,27.175,0,1,1,59.175,32,27.175,27.175,0,0,1,32,59.175ZM32,15.82a8.152,8.152,0,1,0,8.152,8.152A8.152,8.152,0,0,0,32,15.82ZM45.54,41.808c-1.853-3.561-5.672-5.78-13.54-5.78s-11.687,2.218-13.54,5.78a3.937,3.937,0,0,0,1.3,4.938c3.481,2.51,7.7,4.478,12.24,4.478s8.758-1.968,12.239-4.478A3.937,3.937,0,0,0,45.54,41.808Z"
    />
  </Svg>
);

export default ProfileIcon;
