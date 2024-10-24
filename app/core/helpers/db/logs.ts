import { TLogItem } from '@/core/types/common';
import { getLocalDb } from '@/core/helpers/db';

/** logs table */

export const addLogToDB = async ({
  date,
  message,
  type,
  timestamp,
}: TLogItem) => {
  const query = `
    INSERT INTO logs (timestamp, date, message, type) 
    VALUES (${timestamp}, '${date}', '${message}', '${type}');
  `;
  try {
    const db = await getLocalDb();
    await db.execAsync(query);
    return { success: true };
  } catch (error: any) {
    // console.error(`addLogToDB: ${error}`);
    return { success: false };
  }
};

export const getLogsFromDB = async (): Promise<TLogItem[]> => {
  const query = `
    SELECT * FROM logs
    ORDER BY timestamp DESC;
  `;
  try {
    const db = await getLocalDb();
    const logArray = await db.getAllAsync<TLogItem>(query);
    return logArray;
  } catch (error: any) {
    console.error(`getLogsFromDB: ${error}`);
    return [];
  }
};

export const clearLogsInDB = async () => {
  try {
    const db = await getLocalDb();
    await db.execAsync('DELETE FROM logs');
    return { success: true };
  } catch (error: any) {
    console.error(`clearLogsInDB: ${error}`);
    return { success: false };
  }
};
