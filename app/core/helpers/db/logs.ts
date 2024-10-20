import { SQLiteDatabase } from 'expo-sqlite';

import { TLogItem } from '@/core/types/common';

/** logs table */

export const createLogsTable = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS logs (
        id SMALLINT PRIMARY KEY, 
        date VARCHAR(12) NOT NULL, 
        message TEXT NOT NULL, 
        timestamp TIMESTAMP NOT NULL, 
        type VARCHAR(8) NOT NULL
      );
    `);
  } catch (err: any) {
    console.error(err);
  }
};

export const addLogToDB = async (
  { date, message, type, timestamp }: TLogItem,
  db: SQLiteDatabase
) => {
  const query = `
    INSERT INTO logs (date, message, timestamp, type) 
    VALUES ('${date}', '${message}', ${timestamp}, '${type}',);
  `;
  try {
    await db.execAsync(query);
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false };
  }
};

export const clearLogsInDB = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync('DELETE FROM logs');
    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false };
  }
};
