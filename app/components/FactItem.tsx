import React, { memo, ReactElement, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Text as TextNative,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import AtomStrokeIcon from '@/components/svg/AtomStrokeIcon';
import CaseStrokeIcon from '@/components/svg/CaseStrokeIcon';
import CopyIcon from '@/components/svg/CopyIcon';
import EarthStrokeIcon from '@/components/svg/EarthStrokeIcon';
import HeartIcon from '@/components/svg/HeartIcon';
import MiscStrokeIcon from '@/components/svg/MiscStrokeIcon';
import StarsStrokeIcon from '@/components/svg/StarsStrokeIcon';
import UserStrokeIcon from '@/components/svg/UserStrokeIcon';
import { factCategoryColorMap } from '@/core/constants/colors';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TFactItem, TFavoriteArr } from '@/core/types/facts';

// Get the height of device window
const windowHeight = Dimensions.get('window').height;

const iconOpacity = 0.55;
const categoryIconMap = new Map([
  ['science', <AtomStrokeIcon opacity={iconOpacity} />],
  ['nature', <EarthStrokeIcon opacity={iconOpacity} />],
  ['human', <UserStrokeIcon opacity={iconOpacity} />],
  ['business', <CaseStrokeIcon opacity={iconOpacity} />],
  ['entertainment', <StarsStrokeIcon opacity={iconOpacity} />],
  ['miscellaneous', <MiscStrokeIcon opacity={iconOpacity} />],
]);

type TFactItemProps = {
  itemData: TFactItem & { index: number | null };
  factsTotal: number | null;
  liked: TFavoriteArr;
  onCopy: (text: string) => void;
  onLike: (factId: string) => void;
};

const FactItem = ({
  itemData,
  factsTotal,
  liked,
  onCopy,
  onLike,
}: TFactItemProps) => {
  if (itemData.index === null) {
    console.error('FactItem: Invalid index.');
    return null;
  }

  const theme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor('background');
  const borderColor = useThemeColor('border');

  const [isLiked, setIsLiked] = useState(false);

  const category = itemData.category;
  let categoryBgColor = '';
  let categoryIcon: ReactElement | null = null;
  const colorMapItem = factCategoryColorMap.get(category);
  if (colorMapItem) categoryBgColor = colorMapItem[theme];
  categoryIcon = categoryIconMap.get(category) ?? null;

  const handleCopy = async () => {
    onCopy(itemData.title);
  };

  const handleLike = async () => {
    setIsLiked((prev) => (prev = !prev));
    onLike(itemData.id);
  };

  useEffect(() => {
    setIsLiked(liked.includes(itemData.id));
  }, [liked]);

  // useEffect(() => {
  //   Animated.timing(fadeAnim, {
  //     toValue: 1,
  //     duration: 200,
  //     easing: Easing.quad,
  //     useNativeDriver: true,
  //   }).start();
  // }, [fadeAnim]);

  return (
    // <Animated.View
    <View
      style={{
        height: windowHeight,
        // opacity: fadeAnim, // Bind opacity to animated value
      }}
      className="flex-col justify-center px-2"
    >
      <View
        style={{ backgroundColor: categoryBgColor }}
        className="relative min-h-[500px] -translate-y-8 flex-col justify-center rounded-3xl p-4"
      >
        <View className="relative z-10">
          <TextNative className="text-white text-sm uppercase font-plight opacity-50">
            {itemData.index + 1}
            {factsTotal ? ` / ${factsTotal}` : ''}
            {'    '}
            {itemData.category}
          </TextNative>
          <TextNative className="py-8 text-white text-[38px] leading-[46px] font-psemibold">
            {itemData.title}
          </TextNative>
        </View>
        <View className="absolute inset-x-0 inset-y-0 rounded-3xl overflow-hidden z-0">
          <View
            style={{ backgroundColor: categoryBgColor }}
            className="absolute right-8 bottom-8 w-20 h-20 items-center justify-center border-[#ffffff20] border-[1px] rounded-full z-10"
          >
            {categoryIcon}
          </View>
          <View className="absolute inset-x-0 inset-y-0 rounded-3xl overflow-hidden z-0">
            <Image
              className="w-full h-full opacity-30"
              source={require('@/assets/images/wave.png')}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row justify-center">
        <View
          style={{ backgroundColor, borderColor }}
          className="flex-row justify-center rounded-full py-4 border-[1px]"
        >
          <TouchableOpacity onPress={handleLike} className="mx-6">
            <HeartIcon color={isLiked ? '#E11D48' : undefined} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleCopy} className="mx-6">
            <CopyIcon />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default memo(FactItem);
