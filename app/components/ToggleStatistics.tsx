import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ButtonToggle } from '@/components/ButtonToggle';
import { Text } from '@/components/Text';
import {
  getShowStatisticsFromAsyncStorage,
  saveShowStatisticsInAsyncStorage,
} from '@/core/helpers/store';

const ToggleStatistics = () => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = async () => {
    await saveShowStatisticsInAsyncStorage(!isActive);
    setIsActive((prev) => !prev);
  };

  const initData = async () => {
    const isShow = await getShowStatisticsFromAsyncStorage();
    if (isShow === null) saveShowStatisticsInAsyncStorage(isActive);
    if (isShow) setIsActive(true);
  };

  useEffect(() => {
    initData();
  }, []);

  return (
    <View className="flex-row items-center justify-between mt-4 px-4">
      <Text colorName="muted" className="text-base font-psemibold">
        Show Statistics
      </Text>
      <ButtonToggle isActive={isActive} onChange={handleToggle} />
    </View>
  );
};

export default ToggleStatistics;
