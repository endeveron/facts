import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  Text as TextNative,
  TouchableOpacity,
  View,
} from 'react-native';

import { factCategories } from '@/core/constants/facts';

const FactCategoryList = () => {
  const handlePress = (category: string) => {
    router.push({
      pathname: '/facts',
      params: {
        category,
      },
    });
  };

  const getCategoryImgSource = (category: string) => {
    switch (category) {
      case 'nature':
        return require('@/assets/images/categories/nature.jpg');
      case 'human':
        return require('@/assets/images/categories/human.jpg');
      case 'science':
        return require('@/assets/images/categories/science.jpg');
      case 'business':
        return require('@/assets/images/categories/business.jpg');
      case 'entertainment':
        return require('@/assets/images/categories/entertainment.jpg');
      case 'miscellaneous':
        return require('@/assets/images/categories/miscellaneous.jpg');
    }
  };

  return (
    <View className="flex-row flex-wrap -mt-4 px-2">
      {factCategories.map((category) => (
        <TouchableOpacity
          onPress={() => handlePress(category)}
          className="w-1/2"
          key={category}
        >
          <View className="relative m-2 h-44 rounded-3xl overflow-hidden">
            <View className="absolute items-center justify-center bottom-0 inset-x-0 h-10 bg-[#00000050] z-10">
              <TextNative className="text-white text-sm uppercase font-pmedium">
                {category}
              </TextNative>
            </View>
            <View className="absolute inset-x-0 inset-y-0 z-0">
              <Image
                className="w-full h-full"
                source={getCategoryImgSource(category)}
                resizeMode="cover"
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default FactCategoryList;
