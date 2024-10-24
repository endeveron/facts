import * as SQLite from 'expo-sqlite';
import { PropsWithChildren, useEffect } from 'react';

import { LOCAL_DB_NAME } from '@/core/constants';
import { consoleClors } from '@/core/constants/colors';
import { getTime, wait } from '@/core/helpers/misc';
import { TLogItem } from '@/core/types/common';

const { cyan, reset } = consoleClors;

const Logs = ({ children }: PropsWithChildren) => {
  const db = SQLite.useSQLiteContext();

  const writeLog = async (message: string) => {
    console.info(`${cyan}%s${reset}`, message);

    // add to local db
    const { date, timestamp } = getTime();
    const logData: TLogItem = {
      date,
      message,
      timestamp,
      type: 'info',
    };
    const query = `
      INSERT INTO logs (timestamp, date, message, type)
      VALUES (${logData.timestamp}, '${logData.date}', '${logData.message}', '${logData.type}');
    `;
    try {
      await db.execAsync(query);
    } catch (error: any) {
      console.error(`LogsInit: ${error}`);
    }
  };

  const initLogsTable = async () => {
    try {
      await db.execAsync(`
        PRAGMA journal_mode = 'wal';
        CREATE TABLE IF NOT EXISTS logs (
          timestamp TIMESTAMP PRIMARY KEY,
          date VARCHAR(12) NOT NULL,
          message TEXT NOT NULL,
          type VARCHAR(8) NOT NULL
        );
      `);
      await wait(10);
      await writeLog('[ DB ] logs table initialized');
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    initLogsTable();
  }, []);

  return children;
};

const LocalDBProvider = ({ children }: PropsWithChildren) => {
  // console.log('LocalDBProvider');
  return (
    <SQLite.SQLiteProvider databaseName={LOCAL_DB_NAME}>
      <Logs>{children}</Logs>
    </SQLite.SQLiteProvider>
  );
};

export default LocalDBProvider;
