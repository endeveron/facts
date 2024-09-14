import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { TStrokeIconProps } from '@/core/types/common';

const EarthStrokeIcon = ({
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
      d="M24 44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4C12.9543 4 4 12.9543 4 24C4 35.0457 12.9543 44 24 44Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M12 8C13.7379 10.6689 17.0196 13.06 17.0024 17.2452C16.9862 21.1571 19.2502 24.5502 23.1576 24.9605C24.6592 25.1181 26.2814 24.1752 26.4189 22.6717C26.4615 22.2067 26.4295 21.7241 26.3505 21.2758C26.2406 20.6518 26.2917 19.9509 26.706 19.2676C28.1559 16.8779 30.6076 16.4299 32.6281 15.248C33.5241 14.7238 34.3495 14.1596 34.7354 13.6789C35.8007 12.3517 36.3343 11.3489 37.5 9.5"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M43.5 28.5C39.5 29.8276 40.5 33.5 33.5 33C33.5 33 28.8492 32.5 26.873 36.2242C25.292 39.2034 26.2142 42.431 26.873 43.6724"
    />
  </Svg>
);

export default EarthStrokeIcon;
