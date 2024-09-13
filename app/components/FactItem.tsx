import React, { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  Text as TextNative,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import CopyIcon from '@/components/icons/CopyIcon';
import HeartIcon from '@/components/icons/HeartIcon';
import { factCategoryColorMap } from '@/core/constants/colors';
import { TFactItem } from '@/core/types/facts';

// Get the height of device window
const windowHeight = Dimensions.get('window').height;

type TFactItemProps = {
  itemData: TFactItem & { index: number | null };
  factsTotal: number | null;
  liked: TLikedFactsArr;
  onLike: (factId: string) => void;
};

const FactItem = ({ itemData, factsTotal, liked, onLike }: TFactItemProps) => {
  if (itemData.index === null) {
    console.error('FactItem: Invalid index.');
    return null;
  }

  const theme = useColorScheme() ?? 'light';
  const [isLiked, setIsLiked] = useState(false);

  let backgroundColor = 'bg-slate-800';
  const category = itemData.category;
  const categoryInMap = factCategoryColorMap.get(category);
  if (categoryInMap) backgroundColor = categoryInMap[theme];

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
    <View
      style={{ height: windowHeight }}
      className="flex-col justify-center p-4"
    >
      <View
        style={{ backgroundColor }}
        className="relative overflow-hidden h-[500px] -translate-y-10 flex-col justify-center rounded-3xl p-4"
      >
        <TextNative className="absolute top-8 left-4 text-white text-sm uppercase font-plight opacity-70">
          {itemData.index + 1}
          {factsTotal ? ` / ${factsTotal}` : ''}
          {'    '}
          {itemData.category}
        </TextNative>
        <TextNative className="text-white text-4xl font-psemibold">
          {itemData.title}
        </TextNative>
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
