import React, { memo, useState } from 'react';
import { Pressable, useColorScheme, View } from 'react-native';

import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TFactItem } from '@/core/types/facts';
import { factCategoryColorMap } from '@/core/constants/colors';

type TFavoriteItemProps = {
  itemData: TFactItem;
  onDislike: (factId: string) => void;
};

const FavoriteItem = ({ itemData, onDislike }: TFavoriteItemProps) => {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor('card');

  const [showPrompt, setShowPrompt] = useState(false);

  let categoryColor = 'bg-slate-800';
  const category = itemData.category;
  const categoryInMap = factCategoryColorMap.get(category);
  if (categoryInMap) categoryColor = categoryInMap[theme];

  const handleDislike = () => {
    onDislike(itemData.id);
  };

  const handlePress = () => {
    setShowPrompt(true);
  };

  return (
    <View style={{ backgroundColor }} className="rounded-3xl mt-2">
      <Pressable onPress={handlePress}>
        <Text className="px-4 pt-4 text-lg font-psemibold">
          {itemData.title}
        </Text>
        <View className="px-2 mb-2">
          {showPrompt ? (
            <View className="flex-row justify-between">
              <Text
                onPress={handleDislike}
                colorName="error"
                className="text-sm uppercase font-pmedium tracking-wide p-2"
              >
                Dislike and remove
              </Text>
              <Text
                onPress={() => setShowPrompt(false)}
                colorName="muted"
                className="text-sm uppercase font-plight p-2"
              >
                Cancel
              </Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-x-2 p-2">
              <View
                style={{ backgroundColor: categoryColor }}
                className="w-3 h-3 rounded-full opacity-70"
              ></View>
              <Text colorName="muted" className="text-sm uppercase font-plight">
                {itemData.category}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
};

export default memo(FavoriteItem);
