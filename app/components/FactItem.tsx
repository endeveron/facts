import React, {
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import {
  Dimensions,
  Image,
  Text as TextNative,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import CopyIcon from '@/components/svg/CopyIcon';
import HeartIcon from '@/components/svg/HeartIcon';
import { factCategoryColorMap } from '@/core/constants/colors';
import { TFactItem, TFavoriteArr } from '@/core/types/facts';
import UserStrokeIcon from '@/components/svg/UserStrokeIcon';
import StarsStrokeIcon from '@/components/svg/StarsStrokeIcon';
import EarthStrokeIcon from '@/components/svg/EarthStrokeIcon';
import AtomStrokeIcon from '@/components/svg/AtomStrokeIcon';
import CaseStrokeIcon from '@/components/svg/CaseStrokeIcon';
import MiscStrokeIcon from '@/components/svg/MiscStrokeIcon';
import { categories } from '@/core/constants/categories';

// Get the height of device window
const windowHeight = Dimensions.get('window').height;

const iconOpacity = 0.5;
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
  onLike: (factId: string) => void;
};

const FactItem = ({ itemData, factsTotal, liked, onLike }: TFactItemProps) => {
  if (itemData.index === null) {
    console.error('FactItem: Invalid index.');
    return null;
  }

  const theme = useColorScheme() ?? 'light';
  const [isLiked, setIsLiked] = useState(false);

  const category = itemData.category;
  let backgroundColor = '';
  let categoryIcon: ReactElement | null = null;
  if (categories.includes(category)) {
    const colorMapItem = factCategoryColorMap.get(category);
    if (colorMapItem) backgroundColor = colorMapItem[theme];
    categoryIcon = categoryIconMap.get(category) ?? null;
  }

  const handleCopy = async () => {
    console.log('Copy');
  };

  const handleLike = async () => {
    setIsLiked((prev) => (prev = !prev));
    onLike(itemData.id);
  };

  useEffect(() => {
    setIsLiked(liked.includes(itemData.id));
  }, [liked]);

  return (
    <View style={{ height: windowHeight }} className="flex-col justify-center">
      <View
        style={{ backgroundColor }}
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
            style={{ backgroundColor }}
            className="absolute right-8 bottom-8 w-20 h-20 items-center justify-center border-[#ffffff15] border-[1px] rounded-full z-10"
          >
            {categoryIcon}
          </View>
          <View className="absolute inset-x-0 inset-y-0 rounded-3xl overflow-hidden z-0">
            <Image
              className="w-full h-full opacity-20"
              source={require('@/assets/images/wave.png')}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <View className="flex-row items-center justify-center mt-4 gap-x-16">
        <TouchableOpacity onPress={handleLike}>
          <HeartIcon color={isLiked ? '#E11D48' : undefined} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleCopy}>
          <CopyIcon />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default memo(FactItem);
