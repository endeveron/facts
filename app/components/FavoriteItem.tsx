import React, { memo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text';
import { useThemeColor } from '@/core/hooks/useThemeColor';
import { TFactItem } from '@/core/types/facts';

type TFavoriteItemProps = {
  itemData: TFactItem;
  onDislike: (factId: string) => void;
};

const FavoriteItem = ({ itemData, onDislike }: TFavoriteItemProps) => {
  const [showPrompt, setShowPrompt] = useState(false);

  const backgroundColor = useThemeColor('card');

  const handleDislike = () => {
    onDislike(itemData.id);
  };

  const handlePress = () => {
    setShowPrompt(true);
  };

  return (
    <View style={{ backgroundColor }} className="rounded-3xl px-4 py-5 mt-2">
      <Pressable onPress={handlePress}>
        <Text className="text-lg font-psemibold">{itemData.title}</Text>
        {showPrompt ? (
          <View className="mt-2 flex-row justify-between">
            <Text
              onPress={handleDislike}
              colorName="error"
              className="text-sm uppercase font-pmedium tracking-wide"
            >
              Dislike and remove
            </Text>
            <Text
              onPress={() => setShowPrompt(false)}
              colorName="muted"
              className="text-sm uppercase font-plight"
            >
              Cancel
            </Text>
          </View>
        ) : (
          <Text
            colorName="muted"
            className="mt-2 text-sm uppercase font-plight"
          >
            {itemData.category}
          </Text>
        )}
      </Pressable>
    </View>
  );
};

export default memo(FavoriteItem);
