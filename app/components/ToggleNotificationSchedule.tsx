import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ButtonToggle } from '@/components/ButtonToggle';
import { Text } from '@/components/Text';
import { useNotifications } from '@/core/context/NotificProvider';
import { useSession } from '@/core/context/SessionProvider';

const ToggleNotificationSchedule = () => {
  const { session } = useSession();
  if (!session) return null;

  const {
    isSubscription,
    scheduleDailyNotification,
    unscheduleDailyNotification,
  } = useNotifications();

  const [isActive, setIsActive] = useState(isSubscription);
  const [isLoading, setIsLoading] = useState(isSubscription);

  const handleToggle = async () => {
    setIsLoading(true);
    if (isActive) {
      unscheduleDailyNotification();
    } else {
      scheduleDailyNotification();
    }
  };

  useEffect(() => {
    if (isLoading) setIsLoading(false);
    setIsActive(isSubscription);
  }, [isSubscription]);

  return (
    <View className="flex-row items-center justify-between px-4">
      <Text colorName="muted" className="text-base font-psemibold">
        Daily Notification
      </Text>
      <ButtonToggle
        isActive={isActive}
        isLoading={isLoading}
        onChange={handleToggle}
      />
    </View>
  );
};

export default ToggleNotificationSchedule;
