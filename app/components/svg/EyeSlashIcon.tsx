import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const EyeSlashIcon = ({ color, opacity = 1, size = 24 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 24 24`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M4.18,22.513A1.9,1.9,0,1,1,1.487,19.82L19.742,1.565a1.9,1.9,0,1,1,2.694,2.694ZM12,6.483A5.677,5.677,0,0,0,6.175,12a5.257,5.257,0,0,0,.118,1.109L2.918,16.482A10.816,10.816,0,0,1-.02,12c0-1.129,4.293-8.554,12.02-8.554a11.5,11.5,0,0,1,3.422.532L12.838,6.563A6.084,6.084,0,0,0,12,6.483Zm0,11.031A5.677,5.677,0,0,0,17.825,12a5.253,5.253,0,0,0-.118-1.106l3.375-3.375A10.816,10.816,0,0,1,24.02,12c0,1-4.293,8.554-12.02,8.554a11.5,11.5,0,0,1-3.422-.532l2.587-2.587A6.094,6.094,0,0,0,12,17.514Z"
    />
  </Svg>
);

export default EyeSlashIcon;
