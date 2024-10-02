import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { TStrokeIconProps } from '@/core/types/common';

const UserStrokeIcon = ({
  color,
  strokeWidth = 2,
  opacity = 1,
  size = 32,
}: TStrokeIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 48 48`}>
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M24 21C28.4183 21 32 17.4183 32 13C32 8.58172 28.4183 5 24 5C19.5817 5 16 8.58172 16 13C16 17.4183 19.5817 21 24 21Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M40 35C40 39.4183 40 43 24 43C8 43 8 39.4183 8 35C8 30.5817 15.1634 27 24 27C32.8366 27 40 30.5817 40 35Z"
    />
  </Svg>
);

export default UserStrokeIcon;
