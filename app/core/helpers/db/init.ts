import { SQLiteStatement } from 'expo-sqlite';

import { KEY_LOCAL_DB_FACTS_INIT } from '@/core/constants';
import {
  FACT_GROUP_LIMIT,
  factCategories,
  localDbTables,
} from '@/core/constants/facts';
import {
  addFactsToFactStorageTable,
  addFactsToFactGroupTable,
} from '@/core/helpers/db/main';
import { logMessage, wait } from '@/core/helpers/misc';
import {
  getLocalDbFactsInitFromAsyncStorage,
  saveLocalDbFactsInitInAsyncStorage,
} from '@/core/helpers/store';
import { getDataToInitLocalDb } from '@/core/services/facts';
import { TAuthData } from '@/core/types/auth';
import { TStatus } from '@/core/types/common';
import { TFactInitData } from '@/core/types/db';
import { TFactItem, TFavorites } from '@/core/types/fact';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDb } from '@/core/helpers/db';

/** create tables */

export const createFactStorageTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_storage (
        id VARCHAR(24) PRIMARY KEY, 
        category VARCHAR(16) NOT NULL, 
        title VARCHAR(120) NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not create fact_storage table`, 'error');
    console.error(`createFactStorageTable: ${error}`);
    return false;
  }
};

export const createFactGroupTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not create fact_group table`, 'error');
    console.error(`createFactGroupTable: ${error}`);
    return false;
  }
};

export const createCategoryGroupTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not create category_group table`, 'error');
    console.error(`createCategoryGroupTable: ${error}`);
    return false;
  }
};

export const createFavoritesTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS favorites (
        id VARCHAR(24) PRIMARY KEY
      );
    `);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not create favorites table`, 'error');
    console.error(`createFavoritesTable: ${error}`);
    return false;
  }
};

export const createFactCursorTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not create fact_cursor table`, 'error');
    console.error(`createFactCursorTable: ${error}`);
    return false;
  }
};

export const createCategoryCursorTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not create category_cursor table`, 'error');
    console.error(`createCategoryCursorTable: ${error}`);
    return false;
  }
};

export const createCategoryRateTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_category_rate (
        id VARCHAR(24) PRIMARY KEY, 
        category VARCHAR(16) NOT NULL, 
        rate TINYINT NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    await logMessage(
      `[ DB ] could not create fact_category_rate table`,
      'error'
    );
    console.error(`createCategoryRateTable: ${error}`);
    return false;
  }
};

export const createFactOffsetTable = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS fact_offset (
        category VARCHAR(16) PRIMARY KEY, 
        offset SMALLINT NOT NULL
      );
    `);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not create fact_offset table`, 'error');
    console.error(`createFactOffsetTable: ${error}`);
    return false;
  }
};

/** init table data */

export const initFavoritesTable = async (
  favorites: TFavorites
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not add data to favorites table`, 'error');
    console.error(`initFavoritesTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initCategoryRateTable = async (): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not init fact_category_rate table`, 'error');
    console.error(`initCategoryRateTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initFactOffsetTable = async (
  factGroup: TFactItem[]
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  if (!factGroup?.length) {
    await logMessage(
      `[ DB ] could not init fact_offset table: invalid factGroup`,
      'error'
    );
    return false;
  }

  // get the category of the first item of fact group
  const firstItemCategory = factGroup[0].category;
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not init fact_offset table`, 'error');
    console.error(`initFactOffsetTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initFactCursorTable = async (
  factGroup: TFactItem[],
  factStorageLength: number,
  done?: boolean
): Promise<boolean> => {
  const factGroupLength = factGroup.length;
  if (!factGroupLength || !factStorageLength) {
    await logMessage(
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
    const db = await getLocalDb();
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not init fact_cursor table`, 'error');
    console.error(`initFactCursorTable: ${error}`);
    return false;
  }
};

export const clearFactTables = async (): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    // remove tables if exists
    for (let tableName of localDbTables) {
      await db.execAsync(`DELETE FROM ${tableName}`);
    }
    await logMessage(`[ DB ] all local db tables are reset`, 'warning');
    await AsyncStorage.setItem(KEY_LOCAL_DB_FACTS_INIT, 'false');
    await logMessage(`[ ST ] facts init value is reset in storage`, 'warning');
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not clear tables`, 'error');
    console.error(`clearFactTables: ${error}`);
    return false;
  }
};

export const initFactTables = async ({
  facts,
  favorites,
}: TFactInitData): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    // remove tables if exists
    for (let tableName of localDbTables) {
      await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
    }
    // create tables
    const storeSuccess = await createFactStorageTable();
    const groupSuccess = await createFactGroupTable();
    const catGroupSuccess = await createCategoryGroupTable();
    const favSuccess = await createFavoritesTable();
    const cursorSuccess = await createFactCursorTable();
    const catCursorSuccess = await createCategoryCursorTable();
    const rateSuccess = await createCategoryRateTable();
    const offsetSuccess = await createFactOffsetTable();
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
    const storageSuccess = await addFactsToFactStorageTable(facts);
    if (!storageSuccess) return false;
    // const factsInStorage = await db.getAllAsync<TFactStorageTableItem>(
    //   'SELECT * FROM fact_storage'
    // );
    // console.log('fact_storage:', factsInStorage.length);

    // fact_group table
    // add the first 8 facts to the fact group
    const factGroup = facts.slice(0, FACT_GROUP_LIMIT);
    const setFactGroupSuccess = await addFactsToFactGroupTable(factGroup);
    if (!setFactGroupSuccess) return false;
    // const factsInGroup: TFactGroupTableItem[] =
    //   await db.getAllAsync<TFactGroupTableItem>('SELECT * FROM fact_group');
    // console.log('fact_group:', factsInGroup);

    // favorites table
    const initFavSuccess = await initFavoritesTable(favorites);
    if (!initFavSuccess) return false;
    // const factFavoritesData = await db.getAllAsync<TFavoritesTableItem>(
    //   'SELECT * FROM favorites'
    // );
    // console.log('favorites:', factFavoritesData);

    // fact_cursor table
    const initCursorSuccess = await initFactCursorTable(
      factGroup,
      facts.length
    );
    if (!initCursorSuccess) return false;
    // if (updCursorError) return { success: false };
    // const cursorData = await db.getAllAsync<TCursorTableItem>(
    //   'SELECT * FROM fact_cursor'
    // );
    // console.log('fact_cursor:', cursorData);

    // fact_category_rate table
    const initCatRateMapSuccess = await initCategoryRateTable();
    if (!initCatRateMapSuccess) return false;
    // const catRateMapData = await db.getAllAsync<TRateMapTableItem>(
    //   'SELECT * FROM fact_category_rate'
    // );
    // console.log('fact_category_rate:', catRateMapData);

    // fact_offset table
    const initOffserSuccess = await initFactOffsetTable(factGroup);
    if (!initOffserSuccess) return false;
    // const offsetData = await db.getAllAsync<TOffsetTableItem>(
    //   'SELECT * FROM fact_offset'
    // );
    // console.log('fact_offset:', offsetData);

    // prevent re-initialization, save KEY_LOCAL_DB_FACTS_INIT in async storage
    const storeInitSuccess = await saveLocalDbFactsInitInAsyncStorage();
    if (!storeInitSuccess) return false;
    await logMessage(`[ DB ] local db initialized`, 'success');

    return true;
  } catch (error: any) {
    await logMessage(
      `[ DB ] ${error.message || 'unable to initialize fact tables'}`,
      'error'
    );
    console.error(`initFactTables: ${error}`);
    return false;
  }
};

export const initFactDataInLocalDb = async ({
  authData: { userId, token },
  isReset,
  setFetchingCb,
}: {
  authData: TAuthData;
  isReset?: boolean;
  setFetchingCb?: (isFetching: boolean) => void;
}): Promise<TStatus> => {
  // check if the local db data is initialized
  // if doesn't, retrieve data from a remote db { facts: TFactItem[]; favorites: TFavorites }
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
      if (initialized === true) return { success: true };
    }

    await logMessage('[ FC ] initialize fact data');

    // retrieve data from a remote db
    setFetchingCb && setFetchingCb(true);
    await logMessage('[ DB ] recieving facts data from remote db');
    await wait(3000);
    const fetchResult = await getDataToInitLocalDb({
      userId,
      token,
    });
    if (fetchResult?.error) {
      await logMessage(`[ DB ] ${fetchResult.error.message}`, 'error');
      return { success: false };
    }
    if (!fetchResult || !fetchResult?.data) {
      await logMessage(`[ DB ] could not recieve facts data`, 'error');
      return { success: false };
    }
    await logMessage(`[ DB ] facts data received, initialize local db`);
    setFetchingCb && setFetchingCb(false);

    // fill in the fact tables with the data obtained
    const initSuccess = await initFactTables(fetchResult.data);
    if (!initSuccess) return { success: false };

    return { success: true };
  } catch (error: any) {
    console.error(`initFactDataInLocalDb: ${error}`);
    return { success: false };
  }
};
