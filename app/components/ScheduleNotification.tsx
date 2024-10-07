import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ButtonToggle } from '@/components/ButtonToggle';
import { Text } from '@/components/Text';
import { useNotifications } from '@/core/context/PushNotificationsContext';
import { useSession } from '@/core/context/SessionContext';

const ScheduleNotification = () => {
  const { session } = useSession();
  if (!session) return null;

  const {
    isSubscription,
    scheduleDailyNotification,
    unscheduleDailyNotification,
  } = useNotifications();

  const [isActive, setIsActive] = useState(isSubscription);

  const handleToggle = async () => {
    if (isActive) {
      unscheduleDailyNotification();
    } else {
      scheduleDailyNotification();
    }
  };

  useEffect(() => {
    setIsActive(isSubscription);
  }, [isSubscription]);

  return (
    <View className="flex-row items-center justify-between px-4">
      <Text colorName="muted" className="text-base font-psemibold">
        Daily Notification
      </Text>
      <ButtonToggle isActive={isActive} onChange={handleToggle} />
    </View>
  );
};

export default ScheduleNotification;
