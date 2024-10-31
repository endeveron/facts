import { Text } from '@/components/Text';
import { getShowStatisticsFromAsyncStorage } from '@/core/helpers/store';
import { TFactCursor } from '@/core/types/db';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

type TStatisticsProps = {
  cursor?: TFactCursor;
};

const Statistics = ({ cursor }: TStatisticsProps) => {
  if (!cursor) return null;

  const [isActive, setIsActive] = useState(false);

  const initData = async () => {
    const isShow = await getShowStatisticsFromAsyncStorage();
    if (isShow === null) return;
    if (isShow) setIsActive(true);
  };

  useEffect(() => {
    initData();
  }, []);

  return isActive ? (
    <View className="absolute inset-x-0 top-14">
      <View className="flex-row flex-wrap justify-evenly">
        <View className="m-2">
          <Text
            colorName="muted"
            className="opacity-80 bg-black px-2 rounded-full"
          >
            category
          </Text>
          <Text
            colorName="muted"
            className="opacity-80 bg-black px-2 rounded-full"
          >
            store offset
          </Text>
        </View>
        <View className="m-2">
          <Text colorName="muted" className="bg-black px-2 rounded-full">
            {cursor?.category}
          </Text>
          <Text colorName="muted" className="bg-black px-2 rounded-full">
            {cursor?.storageOffset}
          </Text>
        </View>
        <View className="m-2">
          <Text
            colorName="muted"
            className="opacity-80 bg-black px-2 rounded-full"
          >
            group length
          </Text>
          <Text
            colorName="muted"
            className="opacity-80 bg-black px-2 rounded-full"
          >
            left in store
          </Text>
        </View>
        <View className="m-2">
          <Text colorName="muted" className="bg-black px-2 rounded-full">
            {cursor?.groupLength}
          </Text>
          <Text colorName="muted" className="bg-black px-2 rounded-full">
            {cursor?.leftInStorage}
          </Text>
        </View>
      </View>
    </View>
  ) : null;
};

export default Statistics;
