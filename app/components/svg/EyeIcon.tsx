import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const EyeIcon = ({ color, opacity = 1, size = 24 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 24 24`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M12,20.554C4.273,20.554-.02,13.035-0.02,12c0-1.129,4.293-8.554,12.02-8.554S24.02,10.965,24.02,12C24.02,13,19.727,20.554,12,20.554ZM12,6.832A5.316,5.316,0,0,0,6.545,12,5.316,5.316,0,0,0,12,17.163,5.316,5.316,0,0,0,17.455,12,5.316,5.316,0,0,0,12,6.832Z"
    />
  </Svg>
);

export default EyeIcon;
