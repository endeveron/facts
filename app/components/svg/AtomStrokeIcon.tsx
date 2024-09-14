import React from 'react';
import Svg, { Path } from 'react-native-svg';

import { TStrokeIconProps } from '@/core/types/common';

const AtomStrokeIcon = ({
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
      d="M41.8846 6.11536C46.8234 11.054 42.8198 23.0648 32.9424 32.9422C23.0652 42.8194 11.0544 46.823 6.11574 41.8844C1.1771 36.9456 5.18066 24.935 15.058 15.0576C24.9352 5.18028 36.946 1.17669 41.8846 6.11536ZM6.11536 6.11564C1.1767 11.0543 5.18026 23.065 15.0576 32.9424C24.9348 42.8198 36.9456 46.8234 41.8842 41.8846C46.823 36.946 42.8194 24.9352 32.942 15.0579C23.0648 5.18056 11.054 1.17697 6.11536 6.11564Z"
    />
    <Path
      fill="none"
      stroke-width={strokeWidth}
      stroke={color ?? '#ffffff'}
      d="M29 24C29 26.7614 26.7614 29 24 29C21.2386 29 19 26.7614 19 24C19 21.2386 21.2386 19 24 19C26.7614 19 29 21.2386 29 24Z"
    />
  </Svg>
);

export default AtomStrokeIcon;
