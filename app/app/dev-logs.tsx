import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as TaskManager from 'expo-task-manager';
import { View } from 'react-native';
import React, { useEffect, useState } from 'react';

import ScrollScreen from '@/components/ScrollScreen';
import { Text } from '@/components/Text';
import { sleep, writeLog } from '@/core/helpers/misc';
import { Button } from '@/components/Button';
import {
  KEY_AUTH_TOKEN,
  KEY_AUTH_USER,
  KEY_DEV_LOGS,
  KEY_FACTS_FAVORITES,
  KEY_FACTS_STATE,
  KEY_FACTS_STATE_CAT,
} from '@/core/constants';
import { TLogItem } from '@/core/types/common';

const devlogs = () => {
  const [logs, setLogs] = useState<TLogItem[]>([]);
  const [prompt, setPrompt] = useState(false);

  const clearStorage = async () => {
    try {
      const clearFacts = async () => {
        await AsyncStorage.removeItem(KEY_FACTS_STATE);
        await AsyncStorage.removeItem(KEY_FACTS_STATE_CAT);
        await AsyncStorage.removeItem(KEY_FACTS_FAVORITES);
      };
      const checkFacts = async (): Promise<boolean> => {
        const itemStr = await AsyncStorage.getItem(KEY_FACTS_FAVORITES);
        return itemStr === null;
      };
      await clearFacts();
      const factsClean = await checkFacts();
      if (factsClean) {
        writeLog('Facts data deleted from AsyncStorage', 'success');
      }
      const clearAuth = async () => {
        await SecureStore.deleteItemAsync(KEY_AUTH_TOKEN);
        await SecureStore.deleteItemAsync(KEY_AUTH_USER);
      };
      const checkAuth = async (): Promise<boolean> => {
        const itemStr = await AsyncStorage.getItem(KEY_AUTH_TOKEN);
        return itemStr === null;
      };
      await clearAuth();
      const authClean = await checkAuth();
      if (authClean) {
        writeLog('Auth data deleted from SecureStore', 'success');
      }
      await TaskManager.unregisterAllTasksAsync();
      await Notifications.unregisterForNotificationsAsync();
    } catch (err: any) {
      writeLog(`Error: ${err.message}`, 'error');
    }
  };

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
    <ScrollScreen title="Dev Logs">
      <View className="relative flex-col px-4 pb-28">
        <View className="flex-row justify-center -translate-y-4">
          <Button
            title="Clear storage"
            containerClassName="w-40"
            handlePress={clearStorage}
          />
        </View>

        {!!logs.length ? (
          prompt ? (
            <View className="absolute right-6 -top-12 flex-row gap-x-8">
              <Text
                onPress={() => {
                  clearLogs();
                  setPrompt(false);
                }}
                colorName="danger"
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
                    ? 'danger'
                    : log.type === 'success'
                    ? 'success'
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

export default devlogs;
