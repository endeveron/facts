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
      d="M24 20C28.4183 20 32 16.4183 32 12C32 7.58172 28.4183 4 24 4C19.5817 4 16 7.58172 16 12C16 16.4183 19.5817 20 24 20Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M40 35C40 39.9706 40 44 24 44C8 44 8 39.9706 8 35C8 30.0294 15.1634 26 24 26C32.8366 26 40 30.0294 40 35Z"
    />
  </Svg>
);

export default UserStrokeIcon;
