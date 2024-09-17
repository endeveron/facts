import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TIconProps } from '@/core/types/common';

const TextFileIcon = ({ color, opacity = 1, size = 32 }: TIconProps) => (
  <Svg width={size} height={size} opacity={opacity} viewBox={`0 0 64 64`}>
    <Path
      fill={color ?? useThemeColor('icon')}
      d="M52.876,54.954C49.752,58,44.723,58,34.667,58H29.333c-10.057,0-15.085,0-18.209-3.046S8,47.005,8,37.2V26.8c0-9.805,0-14.708,3.124-17.754S19.277,6,29.333,6h5.333C44.723,6,49.752,6,52.876,9.046S56,16.995,56,26.8V37.2C56,47.005,56,51.908,52.876,54.954ZM21.833,39.985H35.167A1.9,1.9,0,0,0,37,37.965a1.87,1.87,0,0,0-1.833-1.988H21.833a2.008,2.008,0,0,0-2,1.988A2.035,2.035,0,0,0,21.833,39.985ZM43.167,25.009H21.833a1.988,1.988,0,1,0,0,3.977H43.167A1.995,1.995,0,0,0,43.167,25.009Z"
    />
  </Svg>
);

export default TextFileIcon;
