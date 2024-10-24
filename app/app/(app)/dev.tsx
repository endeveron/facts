import { View } from 'react-native';

import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { Text } from '@/components/Text';
import { clearLogsInDB, getLogsFromDB } from '@/core/helpers/db/logs';
import { TLogItem } from '@/core/types/common';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';

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
  {
    name: NavItemName.profile,
    href: '/profile',
    icon: <UserIcon />,
  },
];

const dev = () => {
  // const db = useSQLiteContext();
  const [prompt, setPrompt] = useState(false);
  const [logs, setLogs] = useState<TLogItem[]>([]);

  const clearLogs = async () => {
    try {
      // await AsyncStorage.removeItem(KEY_DEV_LOGS);
      // await clearLogsInDB(db);
      await clearLogsInDB();
      setLogs([]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getLogs = async () => {
    try {
      // const logsStr = await AsyncStorage.getItem(KEY_DEV_LOGS);
      // if (logsStr) {
      //   const logData: TLogItem[] = await JSON.parse(logsStr);
      //   setLogs(logData);
      // }
      // const logData: TLogItem[] = await getLogsFromDB(db);
      const logData: TLogItem[] = await getLogsFromDB();
      if (logData) {
        setLogs(logData);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    getLogs();

    // set up the interval
    const intervalId = setInterval(() => {
      getLogs();
    }, 5000);

    // clean up the interval when the component unmounts
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <ScrollScreen title="Logs" navbar={{ navItems }}>
      <View className="relative flex-col px-4 pb-28">
        {!!logs.length ? (
          prompt ? (
            <View className="absolute right-6 -top-12 flex-row gap-x-8">
              <Text
                onPress={() => {
                  clearLogs();
                  setPrompt(false);
                }}
                colorName="error"
                className="uppercase text-sm"
              >
                clear
              </Text>
              <Text
                onPress={() => setPrompt(false)}
                colorName="muted"
                className="uppercase text-sm"
              >
                cancel
              </Text>
            </View>
          ) : (
            <View className="absolute right-6 -top-12 flex-row justify-end">
              {/* <Text
                onPress={() => getLogs()}
                colorName="muted"
                className="uppercase text-sm mr-8"
              >
                update
              </Text> */}
              <Text
                onPress={() => setPrompt(true)}
                colorName="muted"
                className="uppercase text-sm"
              >
                clear
              </Text>
            </View>
          )
        ) : null}

        <View>
          {logs.map((log) => (
            <View
              className="flex-row flex-wrap gap-x-2 mb-2"
              key={log.timestamp}
            >
              <Text colorName="muted">{log.date}</Text>
              <Text
                colorName={
                  log.type === 'error'
                    ? 'error'
                    : log.type === 'info'
                    ? 'info'
                    : log.type === 'success'
                    ? 'success'
                    : log.type === 'warning'
                    ? 'warning'
                    : 'text'
                }
              >
                {log.message}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollScreen>
  );
};

export default dev;
