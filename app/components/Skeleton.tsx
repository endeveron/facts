import { useThemeColor } from '@/core/hooks/useThemeColor';
import classNames from 'classnames';
import React, { PropsWithChildren, useEffect } from 'react';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type TSkeletonProps = PropsWithChildren & {
  containerClassName?: string;
};

const OPACITY_FROM_VALUE = 0.1;
const OPACITY_TO_VALUE = 0.25;
const ANIM_DURATION = 500; // ms

const Skeleton = ({ containerClassName, children }: TSkeletonProps) => {
  const mutedColor = useThemeColor('muted');
  const opacity = useSharedValue(OPACITY_FROM_VALUE);

  useEffect(() => {
    // start the infinite fade animation
    opacity.value = withRepeat(
      withTiming(OPACITY_TO_VALUE, { duration: ANIM_DURATION }), // fade in to full opacity
      -1, // repeat indefinitely
      true // reverse on each repeat
    );
  }, [opacity]);

  return (
    <Animated.View
      className={classNames(
        'flex-col w-full justify-center rounded-3xl',
        containerClassName
      )}
      style={{ opacity, backgroundColor: mutedColor }}
    >
      {children}
    </Animated.View>
  );
};

export default Skeleton;
