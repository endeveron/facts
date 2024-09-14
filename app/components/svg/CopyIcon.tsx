import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const CopyIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M20 24C20 20.134 23.134 17 27 17H51C54.866 17 58 20.134 58 24V53C58 56.866 54.866 60 51 60H27C23.134 60 20 56.866 20 53V24Z"
    />
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M14 5C10.134 5 7 8.13401 7 12V44C7 47.866 10.134 51 14 51H14.0709C14.0242 50.6734 14 50.3395 14 50V18C14 14.134 17.134 11 21 11H44.9291C44.4439 7.60771 41.5265 5 38 5H14Z"
    />
  </Svg>
);

export default CopyIcon;
