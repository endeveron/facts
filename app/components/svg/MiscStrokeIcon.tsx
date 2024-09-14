import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { TStrokeIconProps } from '@/core/types/common';

const MiscStrokeIcon = ({
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
      d="M5 13C5 8.58172 8.58172 5 13 5C17.4183 5 21 8.58172 21 13C21 17.4183 17.4183 21 13 21C8.58172 21 5 17.4183 5 13Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M27 35C27 30.5818 30.5818 27 35 27C39.4182 27 43 30.5818 43 35C43 39.4182 39.4182 43 35 43C30.5818 43 27 39.4182 27 35Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M43 13C43 9.22876 43 7.34314 41.8284 6.17158C40.6568 5 38.7712 5 35 5C31.2288 5 29.3432 5 28.1716 6.17158C27 7.34314 27 9.22876 27 13C27 16.7712 27 18.6569 28.1716 19.8284C29.3432 21 31.2288 21 35 21C38.7712 21 40.6568 21 41.8284 19.8284C43 18.6569 43 16.7712 43 13Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M21 35C21 31.2288 21 29.3432 19.8284 28.1716C18.6569 27 16.7712 27 13 27C9.22876 27 7.34314 27 6.17158 28.1716C5 29.3432 5 31.2288 5 35C5 38.7712 5 40.6568 6.17158 41.8284C7.34314 43 9.22876 43 13 43C16.7712 43 18.6569 43 19.8284 41.8284C21 40.6568 21 38.7712 21 35Z"
    />
  </Svg>
);

export default MiscStrokeIcon;
