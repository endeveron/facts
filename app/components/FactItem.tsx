import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, ReactElement, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Text as TextNative,
  TouchableOpacity,
  View,
} from 'react-native';

import Card from '@/components/Card';
import AtomStrokeIcon from '@/components/svg/AtomStrokeIcon';
import CaseStrokeIcon from '@/components/svg/CaseStrokeIcon';
import CopyIcon from '@/components/svg/CopyIcon';
import EarthStrokeIcon from '@/components/svg/EarthStrokeIcon';
import HeartIcon from '@/components/svg/HeartIcon';
import MiscStrokeIcon from '@/components/svg/MiscStrokeIcon';
import StarsStrokeIcon from '@/components/svg/StarsStrokeIcon';
import UserStrokeIcon from '@/components/svg/UserStrokeIcon';
import {
  brandGradient,
  factCategoryIconBoxGradient,
  heartColor,
} from '@/core/constants/colors';
import { TFactItem, TFavorites } from '@/core/types/fact';
import FactCategoryIconBox from '@/components/FactCategoryIconBox';

// get the height of device screen
const screenHeight = Dimensions.get('window').height;

type TFactItemProps = {
  itemData: TFactItem & { index: number | null };
  factsTotal: number | null;
  favorites: TFavorites;
  onCopy: (text: string) => void;
  onLike: (factId: string, category: string) => void;
};

const FactItem = ({
  itemData,
  factsTotal,
  favorites,
  onCopy,
  onLike,
}: TFactItemProps) => {
  if (itemData.index === null) return null;

  const [isFavorites, setIsFavorites] = useState(false);
  const category = itemData.category;

  const handleCopy = async () => {
    onCopy(itemData.title);
  };

  const handleLike = async () => {
    setIsFavorites((prev) => (prev = !prev));
    onLike(itemData.id, category);
  };

  useEffect(() => {
    setIsFavorites(favorites.includes(itemData.id));
  }, [favorites]);

  return (
    <TouchableOpacity onPress={handleLike} activeOpacity={1}>
      <View
        style={{
          height: screenHeight,
        }}
        className="flex-col h-full justify-center relative"
      >
        <View className="relative min-h-[480px] flex-col justify-center p-4">
          <View className="relative z-30">
            <TextNative className="text-white uppercase font-pextralight opacity-70">
              {itemData.index + 1}
              {factsTotal ? ` / ${factsTotal}` : ''}
              {'    '}
              {category}
            </TextNative>
            <TextNative className="py-8 text-white font-pbold text-[38px] leading-[46px]">
              {itemData.title}
            </TextNative>
          </View>
          <View className="absolute inset-x-0 inset-y-0 rounded-3xl overflow-hidden z-0">
            <LinearGradient
              colors={brandGradient}
              className="rounded-[48px] h-full z-0"
            />
            <View className="absolute inset-x-0 inset-y-0 z-10">
              <Image
                className="w-full h-full opacity-30"
                source={require('@/assets/images/wave.png')}
                resizeMode="cover"
              />
            </View>
            <FactCategoryIconBox
              category={category}
              containerClassName="absolute right-7 bottom-7 w-20 h-20 z-20"
            />
          </View>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Card addClassName="flex-row p-4 rounded-full">
            <TouchableOpacity onPress={handleLike} className="mx-4">
              <HeartIcon color={isFavorites ? heartColor : undefined} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCopy} className="mx-4">
              <CopyIcon />
            </TouchableOpacity>
          </Card>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(FactItem);
