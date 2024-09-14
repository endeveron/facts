import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const HomeIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M54.924,54.819c-3.042,3.147-7.938,3.147-17.731,3.147H26.807c-9.792,0-14.689,0-17.731-3.147s-3.042-8.211-3.042-18.34v-3.95c0-5.942,0-8.913,1.348-11.376s3.811-3.992,8.737-7.049l5.193-3.223C26.52,7.65,29.123,6.034,32,6.034s5.48,1.616,10.688,4.847L47.881,14.1c4.926,3.057,7.389,4.586,8.737,7.049s1.348,5.434,1.348,11.376v3.95C57.966,46.608,57.966,51.673,54.924,54.819ZM40,34a4,4,0,0,0-4-4H28a4,4,0,0,0-4,4V46a4,4,0,0,0,4,4h8a4,4,0,0,0,4-4V34Z"
    />
  </Svg>
);

export default HomeIcon;
