import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';

export const DEV_LOGS_KEY = 'dev_logs_key';

export type TLogType = 'info' | 'success' | 'error';

export type TLogItem = {
  date: string;
  message: string;
  timestamp: number;
  type: TLogType;
};

type TLoggingContext = {
  logs: TLogItem[];
  addLog: (message: string, type?: TLogType) => void;
  clearLogs: () => void;
};

const LoggingContext = createContext<TLoggingContext>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
});

export const useLogging = () => {
  const value = useContext(LoggingContext);
  return value;
};

export const LoggingProvider = ({ children }: PropsWithChildren) => {
  const [logs, setLogs] = useState<TLogItem[]>([]);

  useEffect(() => {
    (async () => {
      const logsStr = await AsyncStorage.getItem(DEV_LOGS_KEY);
      if (logsStr) setLogs(JSON.parse(logsStr));
    })();
  }, []);

  const addLog = async (message: string, type?: TLogType) => {
    const newLogs = await writeLog(message, type);
    setLogs(newLogs);
  };

  const clearLogs = async () => {
    await AsyncStorage.removeItem(DEV_LOGS_KEY);
    setLogs([]);
  };

  const value = {
    logs,
    addLog,
    clearLogs,
  };

  return (
    <LoggingContext.Provider value={value}>{children}</LoggingContext.Provider>
  );
};

export async function writeLog(message: string, type?: TLogType) {
  // configure log item
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const log = {
    date: `${day}-${month} ${hour}:${minute}`,
    message,
    timestamp: Date.now(),
    type: type ?? 'info',
  };

  // get logs from storage
  let logsFromStorage: TLogItem[] = [];
  const logsFromStorageStr = await AsyncStorage.getItem(DEV_LOGS_KEY);
  if (logsFromStorageStr) logsFromStorage = JSON.parse(logsFromStorageStr);
  // add new log
  const newLogs = [log, ...logsFromStorage];
  // save to storage
  const logsStr = JSON.stringify(newLogs);
  await AsyncStorage.setItem(DEV_LOGS_KEY, logsStr);

  return newLogs;
}
