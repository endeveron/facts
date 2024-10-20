import { TouchableOpacity, View } from 'react-native';

import { Button } from '@/components/Button';
import { NavItemName, TNavbarItem } from '@/components/Navbar';
import ScrollScreen from '@/components/ScrollScreen';
import CategoriesIcon from '@/components/svg/CategoriesIcon';
import TextFileIcon from '@/components/svg/TextFileIcon';
import UserIcon from '@/components/svg/UserIcon';
import { Text } from '@/components/Text';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TLogItem } from '@/core/types/common';
import { KEY_DEV_LOGS } from '@/core/constants';

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
  // const { logs, clearLogs } = useLogging();
  const [prompt, setPrompt] = useState(false);
  const [logs, setLogs] = useState<TLogItem[]>([]);

  const clearLogs = async () => {
    await AsyncStorage.removeItem(KEY_DEV_LOGS);
    setLogs([]);
  };

  useEffect(() => {
    (async () => {
      const logsStr = await AsyncStorage.getItem(KEY_DEV_LOGS);
      if (logsStr) setLogs(JSON.parse(logsStr));
    })();
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
            <Text
              onPress={() => setPrompt(true)}
              colorName="muted"
              className="absolute right-6 -top-12 uppercase text-sm"
            >
              clear
            </Text>
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
