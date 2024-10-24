import * as SQLite from 'expo-sqlite';

import { LOCAL_DB_NAME } from '@/core/constants';

export const getLocalDb = async () => {
  const db: SQLite.SQLiteDatabase = await SQLite.openDatabaseAsync(
    LOCAL_DB_NAME
  );
  return db;
};
