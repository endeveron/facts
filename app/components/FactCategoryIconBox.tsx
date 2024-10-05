import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

import AtomStrokeIcon from '@/components/svg/AtomStrokeIcon';
import CaseStrokeIcon from '@/components/svg/CaseStrokeIcon';
import EarthStrokeIcon from '@/components/svg/EarthStrokeIcon';
import MiscStrokeIcon from '@/components/svg/MiscStrokeIcon';
import StarsStrokeIcon from '@/components/svg/StarsStrokeIcon';
import UserStrokeIcon from '@/components/svg/UserStrokeIcon';
import { useThemeGradient } from '@/core/hooks/useThemeColor';

const iconOpacity = 0.5;

const categoryIconMap = new Map([
  ['science', <AtomStrokeIcon opacity={iconOpacity} />],
  ['nature', <EarthStrokeIcon opacity={iconOpacity} />],
  ['human', <UserStrokeIcon opacity={iconOpacity} />],
  ['business', <CaseStrokeIcon opacity={iconOpacity} />],
  ['entertainment', <StarsStrokeIcon opacity={iconOpacity} />],
  ['miscellaneous', <MiscStrokeIcon opacity={iconOpacity} />],
]);

type TFactCategoryIconBoxProps = {
  category: string;
  containerClassName?: string;
};

const FactCategoryIconBox = ({
  category,
  containerClassName,
}: TFactCategoryIconBoxProps) => {
  const fade = useRef(new Animated.Value(0)).current;
  const iconBoxGradient = useThemeGradient('factIconBox');

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      delay: 500,
    }).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity: fade }}
      className={`relative w-20 h-20 rounded-full items-center justify-center ${containerClassName}`}
    >
      <LinearGradient
        colors={iconBoxGradient}
        className="absolute rounded-full h-20 w-20 border-[#ffffff25] border-[1px]"
      />
      {categoryIconMap.get(category) ?? null}
    </Animated.View>
  );
};

export default FactCategoryIconBox;
