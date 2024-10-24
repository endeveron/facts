import React, { memo, useState } from 'react';
import { Pressable, View } from 'react-native';

import Card from '@/components/Card';
import { Text } from '@/components/Text';
import { TFactItem } from '@/core/types/fact';

type TFavoriteItemProps = {
  itemData: TFactItem;
  onDislike: (factId: string, category: string) => void;
};

const FavoriteItem = ({ itemData, onDislike }: TFavoriteItemProps) => {
  const [showPrompt, setShowPrompt] = useState(false);

  const handleDislike = async () => {
    onDislike(itemData.id, itemData.category);
  };

  const handlePress = () => {
    setShowPrompt(true);
  };

  return (
    <Card addClassName="mt-2">
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
              <Text colorName="muted" className="text-sm uppercase font-plight">
                {itemData.category}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Card>
  );
};

export default memo(FavoriteItem);
