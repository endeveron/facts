import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Text as TextNative,
  TouchableOpacity,
  View,
} from 'react-native';

import Card from '@/components/Card';
import FactCategoryIconBox from '@/components/FactCategoryIconBox';
import HeartIcon from '@/components/svg/HeartIcon';
import { useThemeColor, useThemeGradient } from '@/core/hooks/useThemeColor';
import { TFactItem, TFavorites } from '@/core/types/fact';
import ShareIcon from '@/components/svg/ShareIcon';

// get the height of device screen
const screenHeight = Dimensions.get('window').height;

type TFactItemProps = {
  itemData: TFactItem;
  factsTotal: number | null;
  favorites: TFavorites;
  onLike: (factId: string, category: string) => void;
  onShare: (title: string) => void;
};

const FactItem = ({
  itemData,
  factsTotal,
  favorites,
  onLike,
  onShare,
}: TFactItemProps) => {
  const heartIconColor = useThemeColor('heartIcon');
  const brandGradient = useThemeGradient('brand');

  const [isFavorites, setIsFavorites] = useState(false);
  const category = itemData.category;

  const handleLike = async () => {
    setIsFavorites((prev) => (prev = !prev));
    onLike(itemData.id, category);
  };

  const handleShare = async () => {
    onShare(itemData.title);
  };

  useEffect(() => {
    setIsFavorites(favorites.includes(itemData.id));
  }, [favorites]);

  return (
    <View
      style={{
        height: screenHeight,
      }}
      className="flex-col h-full justify-center relative"
    >
      {/* Card */}
      <View
        // onTouchEnd={handleLike}
        className="relative min-h-[480px] flex-col justify-center p-4"
      >
        {/* Content */}
        <View className="relative z-30">
          {/* Category text */}
          <TextNative className="text-white uppercase font-pextralight opacity-70">
            {itemData.index + 1}
            {factsTotal ? ` / ${factsTotal}` : ''}
            {'    '}
            {category}
          </TextNative>
          {/* Title text */}
          <TextNative className="py-8 text-white font-pbold text-[38px] leading-[46px]">
            {itemData.title}
          </TextNative>
        </View>

        {/* Background */}
        <View className="absolute inset-x-0 inset-y-0 rounded-[48px] overflow-hidden z-0">
          {/* Gradient */}
          <LinearGradient
            colors={brandGradient}
            className="rounded-[48px] h-full z-0"
          />
          {/* Image */}
          <View className="absolute inset-x-0 inset-y-0 z-10">
            <Image
              className="w-full h-full opacity-30"
              source={require('@/assets/images/wave.png')}
              resizeMode="cover"
            />
          </View>
          {/* Category icon */}
          <FactCategoryIconBox
            category={category}
            containerClassName="absolute right-7 bottom-7 w-20 h-20 z-20"
          />
        </View>
      </View>

      {/* Action bar */}
      <View className="mt-8 flex-row justify-center">
        <Card addClassName="flex-row p-4 rounded-full">
          <TouchableOpacity onPress={handleLike} className="mx-4">
            <HeartIcon color={isFavorites ? heartIconColor : undefined} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} className="mx-4">
            <ShareIcon />
          </TouchableOpacity>
        </Card>
      </View>
    </View>
  );
};

export default memo(FactItem);
