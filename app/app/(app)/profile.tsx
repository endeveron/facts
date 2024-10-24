import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import Favorites from '@/components/Favorites';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScheduleNotification from '@/components/ScheduleNotification';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import LogsIcon from '@/components/svg/LogsIcon';
import PlusSquaredIcon from '@/components/svg/PlusSquaredIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import { Text } from '@/components/Text';
import { useSession } from '@/core/context/SessionProvider';
import { clearFactTables } from '@/core/helpers/db/init';
import { logMessage } from '@/core/helpers/misc';
import { getCursor, getFactGroup } from '@/core/helpers/db/main';
import {
  logScheduledNotifications,
  resetNotificationSubscriptions,
} from '@/core/helpers/notification';
import { useNotifications } from '@/core/context/NotificProvider';
import { removeNotifSubFetchedFromAsyncStorage } from '@/core/helpers/store';
import { deleteSubscription } from '@/core/services/notifications';

const profile = () => {
  const { session, signOut } = useSession();
  const { unscheduleDailyNotification } = useNotifications();
  // only admin can create a new fact
  const isAdmin = session?.user.account.role.index === 3;

  const title = session?.user.account.name ?? 'Profile';
  const email = session?.user.account.email;

  const token = session!.token;
  const userId = session!.user.id;

  const navItems: TNavbarItem[] = [
    {
      name: NavItemName.categories,
      href: '/categories',
      icon: <CategoriesIcon />,
    },
    {
      name: NavItemName.facts,
      href: '/facts',
      icon: <TextFileIcon />,
    },
  ];

  if (isAdmin) {
    navItems.splice(1, 0, {
      name: NavItemName.create,
      href: '/create',
      icon: <PlusSquaredIcon />,
    });
    navItems.push({
      name: NavItemName.dev,
      href: '/dev',
      icon: <LogsIcon />,
    });
  }

  const handleSubscriptions = async () => {
    await logScheduledNotifications();
  };

  const handleTasks = async () => {
    try {
      const tasks = await TaskManager.getRegisteredTasksAsync();
      if (tasks && tasks.length) {
        await logMessage(`[ TM ] registered tasks:`);
        for (let data of tasks) {
          await logMessage(`[ TM ] - ${data.taskName}`);
        }
      } else if (tasks) {
        await logMessage(`[ TM ] no registered tasks`);
      } else {
        await logMessage(`[ TM ] unable to get registered tasks`, 'error');
      }
    } catch (error: any) {
      await logMessage(`[ TM ] unable to get registered tasks`, 'error');
      console.error(`handleTasks ${error}`);
    }
  };

  const handleDev = async () => {
    try {
      // const cursor = await getCursor();
      // const group = await getFactGroup();
      // console.log('cursor', cursor);
      // console.log('group', group);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleReset = async () => {
    try {
      await unscheduleDailyNotification();
      logMessage(`[ CL ] daily notification unscheduled`, 'warning');
      await resetNotificationSubscriptions();
      await removeNotifSubFetchedFromAsyncStorage();
      logMessage(`[ CL ] subscription canceled in storage`, 'warning');
      await deleteSubscription({ token, userId });
      logMessage(`[ CL ] subscription canceled in remote db`, 'warning');
      await clearFactTables();
      logMessage(`[ CL ] local db data cleared`, 'warning');

      signOut();
    } catch (err: any) {
      console.error(err);
    }
  };

  // const scheduleNotification = async () => {
  //   await Notifications.scheduleNotificationAsync({
  //     content: {
  //       title: 'Facts',
  //       body: 'Hey there!',
  //       data: { status: 'ok' },
  //     },
  //     trigger: { seconds: 1 },
  //   });
  // };

  return (
    <ScrollScreen title={title} navbar={{ navItems }}>
      <View className="flex-row justify-between px-4">
        {!!email ? (
          <Text colorName="muted" className="text-sm -translate-y-6">
            {email}
          </Text>
        ) : null}
        <Text
          onPress={signOut}
          colorName="muted"
          className="flex text-base -translate-y-12"
        >
          Sign Out
        </Text>
      </View>

      {/* <View className="flex-col items-center mb-4">
        <Button
          title="Send one-time notification"
          containerClassName="mb-4 w-80"
          handlePress={scheduleNotification}
        />
        <Button
          title="Schedule daily notification"
          containerClassName="mb-4 w-80"
          handlePress={() => scheduleDailyNotification({})}
        />
        <Button
          title="Show storage"
          containerClassName="mb-4 w-80"
          handlePress={async () => logStorageItems()}
        />
      </View> */}
      <ScheduleNotification />
      <View className="mt-8 mb-4">
        <View className="flex-row justify-center items-center">
          <Button
            title="Subscriptions"
            variant="secondary"
            containerClassName="m-2 px-6"
            handlePress={handleSubscriptions}
          />
          <Button
            variant="secondary"
            title="Registered Tasks"
            containerClassName="m-2 px-6"
            handlePress={handleTasks}
          />
        </View>
        <View className="flex-row justify-center items-center">
          <Button
            variant="secondary"
            title="Reset Data"
            containerClassName="m-2 px-6"
            handlePress={handleReset}
          />
          <Button
            title="Development"
            // variant="secondary"
            containerClassName="m-2 px-6 w-40"
            handlePress={handleDev}
          />
        </View>
      </View>

      <Favorites />
    </ScrollScreen>
  );
};

export default profile;
