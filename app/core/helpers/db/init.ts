import { SQLiteDatabase, SQLiteStatement } from 'expo-sqlite';

import {
  FACT_GROUP_LIMIT,
  factCategories,
  localDbTables,
} from '@/core/constants/facts';
import {
  addFactsToFactStorageTable,
  updateFactGroupTable,
} from '@/core/helpers/db/index';
import { logMessage } from '@/core/helpers/misc';
import {
  getLocalDbFactsInitFromAsyncStorage,
  saveLocalDbFactsInitInAsyncStorage,
} from '@/core/helpers/store';
import { getDataToInitLocalDb } from '@/core/services/facts';
import { TAuthData } from '@/core/types/auth';
import { TStatus } from '@/core/types/common';
import { TFactInitData } from '@/core/types/db';
import { TFactItem, TFavorites } from '@/core/types/fact';

export const resetAllTAbles = async (
  { userId, token }: TAuthData,
  db: SQLiteDatabase
) => {
  try {
    await initFactDataInLocalDb({ userId, token }, db, true);
  } catch (err: any) {
    console.error(err);
  }
};

/** create tables */

export const createFactStorageTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      CREATE TABLE IF NOT EXISTS fact_storage (
        id VARCHAR(24) PRIMARY KEY, 
        category VARCHAR(16) NOT NULL, 
        title VARCHAR(120) NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create fact_storage table`, 'error');
    console.error(error);
    return false;
  }
};

export const createFactGroupTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_group (
        id VARCHAR(24) PRIMARY KEY, 
        'index' SMALLINT NOT NULL, 
        category VARCHAR(16) NOT NULL, 
        title VARCHAR(120) NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create fact_group table`, 'error');
    console.error(error);
    return false;
  }
};

export const createCategoryGroupTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS category_group (
        id VARCHAR(24) PRIMARY KEY, 
        'index' SMALLINT NOT NULL,
        category VARCHAR(16) NOT NULL, 
        title VARCHAR(120) NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create category_group table`, 'error');
    console.error(error);
    return false;
  }
};

export const createFavoritesTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(24) PRIMARY KEY
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create favorites table`, 'error');
    console.error(error);
    return false;
  }
};

export const createFactCursorTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_cursor (
        id SMALLINT PRIMARY KEY, 
        cur_fact_index SMALLINT, 
        cur_fact_id VARCHAR(24),
        group_length SMALLINT NOT NULL,
        left_in_group TINYINT NOT NULL,
        left_in_storage SMALLINT NOT NULL, 
        storage_offset SMALLINT NOT NULL,
        done BOOLEAN NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create fact_cursor table`, 'error');
    console.error(error);
    return false;
  }
};

export const createCategoryCursorTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS category_cursor (
        category VARCHAR(16) PRIMARY KEY,
        cur_fact_index SMALLINT, 
        cur_fact_id VARCHAR(24),
        group_length SMALLINT NOT NULL,
        left_in_group TINYINT NOT NULL,
        left_in_storage SMALLINT NOT NULL,
        storage_offset SMALLINT NOT NULL,
        done BOOLEAN NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create category_cursor table`, 'error');
    console.error(error);
    return false;
  }
};

export const createCategoryRateTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_category_rate (
        id VARCHAR(24) PRIMARY KEY, 
        category VARCHAR(16) NOT NULL, 
        rate TINYINT NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create fact_category_rate table`, 'error');
    console.error(error);
    return false;
  }
};

export const createFactOffsetTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_offset (
        category VARCHAR(16) PRIMARY KEY, 
        offset SMALLINT NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not create fact_offset table`, 'error');
    console.error(error);
    return false;
  }
};

/** init table data */

export const initFavoritesTable = async (
  favorites: TFavorites,
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    statement = await db.prepareAsync(
      'INSERT INTO favorites (id) VALUES ($id)'
    );
    for (let factMongoId of favorites) {
      await statement.executeAsync({
        $id: factMongoId,
      });
    }
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not add data to favorites table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initCategoryRateTable = async (
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    statement = await db.prepareAsync(`
      INSERT INTO fact_category_rate (id, category, rate) 
      VALUES ($id, $category, $rate)
    `);
    for (let index = 0; index < factCategories.length; index++) {
      const category = factCategories[index];
      await statement.executeAsync({
        $id: index,
        $category: category,
        $rate: 0,
      });
    }
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not init fact_category_rate table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initFactOffsetTable = async (
  factGroup: TFactItem[],
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  if (!factGroup?.length) {
    logMessage(
      `[ DB ] could not init fact_offset table: invalid factGroup`,
      'error'
    );
    return false;
  }

  // get the category of the first item of fact group
  const firstItemCategory = factGroup[0].category;
  try {
    // populate fact_offset table with 0
    statement = await db.prepareAsync(`
      INSERT INTO fact_offset (category, offset)
      VALUES ($category, $offset)
    `);

    // we're going to increase only the first item's category
    for (let category of factCategories) {
      const value = category === firstItemCategory ? 1 : 0;
      await statement.executeAsync({
        $category: category,
        $offset: value,
      });
    }
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not init fact_offset table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initFactCursorTable = async (
  factGroup: TFactItem[],
  factStorageLength: number,
  db: SQLiteDatabase,
  done?: boolean
): Promise<boolean> => {
  const factGroupLength = factGroup.length;
  if (!factGroupLength || !factStorageLength) {
    logMessage(
      `[ DB ] could not init fact_cursor table: invalid arguments`,
      'error'
    );
    return false;
  }
  const cur_fact_index = 0;
  const cur_fact_id = factGroup[0].id;
  const group_length = factGroupLength;
  const left_in_storage = factStorageLength - 1;
  const left_in_group = factGroupLength - 1;
  const storage_offset = 1;

  const query = `
    INSERT INTO fact_cursor (
      id, 
      cur_fact_index, 
      cur_fact_id, 
      group_length, 
      left_in_group, 
      left_in_storage, 
      storage_offset, 
      done
      ) 
    VALUES (
      1, 
      ${cur_fact_index}, 
      '${cur_fact_id}', 
      ${group_length}, 
      ${left_in_group}, 
      ${left_in_storage}, 
      ${storage_offset}, 
      ${done || false}
    );
  `;
  try {
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not init fact_cursor table`, 'error');
    console.error(error);
    return false;
  }
};

export const initFactTables = async (
  { facts, favorites }: TFactInitData,
  db: SQLiteDatabase
): Promise<boolean> => {
  try {
    // remove tables if exists
    for (let tableName of localDbTables) {
      await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
    }
    // create tables
    const storeSuccess = await createFactStorageTable(db);
    const groupSuccess = await createFactGroupTable(db);
    const catGroupSuccess = await createCategoryGroupTable(db);
    const favSuccess = await createFavoritesTable(db);
    const cursorSuccess = await createFactCursorTable(db);
    const catCursorSuccess = await createCategoryCursorTable(db);
    const rateSuccess = await createCategoryRateTable(db);
    const offsetSuccess = await createFactOffsetTable(db);
    if (
      !storeSuccess ||
      !groupSuccess ||
      !catGroupSuccess ||
      !favSuccess ||
      !cursorSuccess ||
      !catCursorSuccess ||
      !rateSuccess ||
      !offsetSuccess
    ) {
      return false;
    }

    // populate tables

    // fact_storage table
    const storageSuccess = await addFactsToFactStorageTable(facts, db);
    if (!storageSuccess) return false;
    // const factsInStorage = await db.getAllAsync<TFactStorageTableItem>(
    //   'SELECT * FROM fact_storage'
    // );
    // console.log('fact_storage:', factsInStorage.length);

    // fact_group table
    // add the first 8 facts to the fact group
    const factGroup = facts.slice(0, FACT_GROUP_LIMIT);
    const setFactGroupSuccess = await updateFactGroupTable(factGroup, db);
    if (!setFactGroupSuccess) return false;
    // const factsInGroup: TFactGroupTableItem[] =
    //   await db.getAllAsync<TFactGroupTableItem>('SELECT * FROM fact_group');
    // console.log('fact_group:', factsInGroup);

    // favorites table
    const initFavSuccess = await initFavoritesTable(favorites, db);
    if (!initFavSuccess) return false;
    // const factFavoritesData = await db.getAllAsync<TFavoritesTableItem>(
    //   'SELECT * FROM favorites'
    // );
    // console.log('favorites:', factFavoritesData);

    // fact_cursor table
    const initCursorSuccess = await initFactCursorTable(
      factGroup,
      facts.length,
      db
    );
    if (!initCursorSuccess) return false;
    // const updCursorError = await updateCursorTable(initialCursorData, db);
    // if (updCursorError) return { success: false };
    // const cursorData = await db.getAllAsync<TCursorTableItem>(
    //   'SELECT * FROM fact_cursor'
    // );
    // console.log('fact_cursor:', cursorData);

    // fact_category_rate table
    const initCatRateMapSuccess = await initCategoryRateTable(db);
    if (!initCatRateMapSuccess) return false;
    // const catRateMapData = await db.getAllAsync<TRateMapTableItem>(
    //   'SELECT * FROM fact_category_rate'
    // );
    // console.log('fact_category_rate:', catRateMapData);

    // fact_offset table
    const initOffserSuccess = await initFactOffsetTable(factGroup, db);
    if (!initOffserSuccess) return false;
    // const offsetData = await db.getAllAsync<TOffsetTableItem>(
    //   'SELECT * FROM fact_offset'
    // );
    // console.log('fact_offset:', offsetData);

    // prevent re-initialization, save KEY_LOCAL_DB_FACTS_INIT in async storage
    const storeInitSuccess = await saveLocalDbFactsInitInAsyncStorage();
    if (!storeInitSuccess) return false;

    return true;
  } catch (error: any) {
    console.error(error);
    logMessage(
      `[ DB ] ${error.message || 'unable to initialize fact tables'}`,
      'error'
    );
    return false;
  }
};

export const initFactDataInLocalDb = async (
  { userId, token }: TAuthData,
  db: SQLiteDatabase,
  isReset?: boolean
): Promise<TStatus> => {
  // retrieve data from a remote db { facts: TFactItem[]; favorites: TFavorites }
  // fill in the fact tables with the data obtained
  // - save facts in the fact_storage table
  // - save the first 8 facts in the fact_group table
  // - save favorites in the favorites table
  // - create a cursor object using factGroup data and save it in the fact_cursor table
  // - save rate 0 for each of category in the fact_category_rate table
  // - save offset value for each of category using factGroup data in the fact_offset table
  // prevent re-initialization, save KEY_LOCAL_DB_FACTS_INIT in async storage

  try {
    // check if the local db data is initialized
    // <clean init> comment lines below to reset all tables data
    if (!isReset) {
      const initialized = await getLocalDbFactsInitFromAsyncStorage();
      if (initialized) return { success: true };
    }

    // retrieve data from a remote db
    const fetchResult = await getDataToInitLocalDb({
      userId,
      token,
    });
    if (fetchResult?.error) {
      logMessage(`[ DB ] ${fetchResult.error.message}`, 'error');
      return { success: false };
    }
    if (!fetchResult || !fetchResult?.data) {
      logMessage(`[ DB ] could not fetch facts data`, 'error');
      return { success: false };
    }
    logMessage(`[ DB ] data received, initialize local db`);

    // fill in the fact tables with the data obtained
    const initSuccess = await initFactTables(fetchResult.data, db);
    if (!initSuccess) return { success: false };

    logMessage(`[ DB ] local db initialized`, 'success');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false };
  }
};
