import { SQLiteDatabase, SQLiteStatement } from 'expo-sqlite';

import { logMessage } from '@/core/helpers/misc';
import { TCategoryRateTableItem, TOffsetTableItem } from '@/core/types/db';
import { TCategoryMap } from '@/core/types/fact';

/** maps */

/**
 * Retrieves data from a database table and creates a map of category rates.
 * @param {SQLiteDatabase} db - a database connection object.
 * @returns a Promise that resolves to a `Map<string, number> | null`.
 */
export const createCategoryRateMapFromTableData = async (
  db: SQLiteDatabase
): Promise<TCategoryMap | undefined> => {
  const query = `SELECT * FROM fact_category_rate`;
  const categoryRateMap = new Map<string, number>();
  try {
    // get data from fact_category_rate table
    const tableData = await db.getAllAsync<TCategoryRateTableItem>(query);
    // create a rate map from the received table data
    for (let { category, rate } of tableData) {
      categoryRateMap.set(category, rate);
    }
    return categoryRateMap;
  } catch (error: any) {
    logMessage(
      `[ DB ] could not get data from fact_category_rate table`,
      'error'
    );
    console.error(error);
  }
};

/**
 * Converts the map into a table data and updates the fact_category_rate table.
 * @param {TCategoryMap} categoryRateMap - a map that contains category names as keys and corresponding rates as values.
 * @param {SQLiteDatabase} db - a database connection object.
 * @returns `null` if the operation is successful, or an error object.
 */
export const updateCategoryRateTable = async (
  categoryRateMap: TCategoryMap,
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    await db.execAsync('DELETE FROM fact_category_rate');
    statement = await db.prepareAsync(`
      INSERT INTO fact_category_rate (id, category, rate) 
      VALUES ($id, $category, $rate)
    `);
    const categoryRateArr = Array.from(categoryRateMap, ([category, rate]) => ({
      category,
      rate,
    }));
    for (let index = 0; index < categoryRateArr.length; index++) {
      const item = categoryRateArr[index];
      await statement.executeAsync({
        $id: index,
        $category: item.category,
        $rate: item.rate,
      });
    }
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not update fact_category_rate table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

/**
 * Retrieves data from a database table and creates a map of fact offset for each category.
 * @param {SQLiteDatabase} db - a database connection object.
 * @returns a Promise that resolves to a `Map<string, number> | null`.
 */
export const createOffsetMapFromTableData = async (
  db: SQLiteDatabase
): Promise<TCategoryMap | undefined> => {
  const query = `SELECT * FROM fact_offset`;
  const offsetMap = new Map<string, number>();
  try {
    // get table data
    const tableData = await db.getAllAsync<TOffsetTableItem>(query);
    // create an offset map from the received table data
    for (let { category, offset } of tableData) {
      offsetMap.set(category, offset);
    }
    return offsetMap;
  } catch (error: any) {
    logMessage(`[ DB ] could not get data from fact_offset table`, 'error');
    console.error(error);
  }
};

/**
 * Converts the map into a table data and updates the table.
 * @param {TCategoryMap} offsetMap - a map that contains category names as keys and corresponding rates as values.
 * @param {SQLiteDatabase} db - a database connection object.
 * @returns `null` if the operation is successful, or an error object.
 */
export const updateFactOffsetTable = async (
  offsetMap: TCategoryMap,
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    statement = await db.prepareAsync(`
      INSERT INTO fact_offset (category, offset) 
      VALUES ($category, $offset)
      ON CONFLICT(category) DO UPDATE SET offset = excluded.offset;
    `);
    const offsetArr = Array.from(offsetMap, ([category, offset]) => ({
      category,
      offset,
    }));
    for (let { category, offset } of offsetArr) {
      await statement.executeAsync({
        $category: category,
        $offset: offset,
      });
    }
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not update fact_offset table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};
