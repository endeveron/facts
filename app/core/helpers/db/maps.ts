import { SQLiteDatabase, SQLiteStatement } from 'expo-sqlite';

import { logMessage } from '@/core/helpers/misc';
import { TCategoryRateTableItem, TOffsetTableItem } from '@/core/types/db';
import { TCategoryMap } from '@/core/types/fact';
import { getLocalDb } from '@/core/helpers/db';

/** maps */

/**
 * Retrieves data from a database table and creates a map of category rates.
 * @returns a Promise that resolves to a `Map<string, number> | null`.
 */
export const createCategoryRateMapFromTableData = async (): Promise<
  TCategoryMap | undefined
> => {
  const query = `SELECT * FROM fact_category_rate`;
  const categoryRateMap = new Map<string, number>();
  try {
    const db = await getLocalDb();
    // get data from fact_category_rate table
    const tableData = await db.getAllAsync<TCategoryRateTableItem>(query);
    // create a rate map from the received table data
    for (let { category, rate } of tableData) {
      categoryRateMap.set(category, rate);
    }
    return categoryRateMap;
  } catch (error: any) {
    await logMessage(
      `[ DB ] could not get data from fact_category_rate table`,
      'error'
    );
    console.error(`createCategoryRateMapFromTableData: ${error}`);
  }
};

/**
 * Converts the map into a table data and updates the fact_category_rate table.
 * @param {TCategoryMap} categoryRateMap - a map that contains category names as keys and corresponding rates as values.
 * @returns `null` if the operation is successful, or an error object.
 */
export const updateCategoryRateTable = async (
  categoryRateMap: TCategoryMap
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
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
    await logMessage(
      `[ DB ] could not update fact_category_rate table`,
      'error'
    );
    console.error(`updateCategoryRateTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

/**
 * Retrieves data from a database table and creates a map of fact offset for each category.
 * @returns a Promise that resolves to a `Map<string, number> | null`.
 */
export const createOffsetMapFromTableData = async (): Promise<
  TCategoryMap | undefined
> => {
  const query = `SELECT * FROM fact_offset`;
  const offsetMap = new Map<string, number>();
  try {
    const db = await getLocalDb();
    // get table data
    const tableData = await db.getAllAsync<TOffsetTableItem>(query);
    // create an offset map from the received table data
    for (let { category, offset } of tableData) {
      offsetMap.set(category, offset);
    }
    return offsetMap;
  } catch (error: any) {
    await logMessage(
      `[ DB ] could not get data from fact_offset table`,
      'error'
    );
    console.error(`createOffsetMapFromTableData: ${error}`);
  }
};

/**
 * Converts the map into a table data and updates the table.
 * @param {TCategoryMap} offsetMap - a map that contains category names as keys and corresponding rates as values.
 * @returns `null` if the operation is successful, or an error object.
 */
export const updateFactOffsetTable = async (
  offsetMap: TCategoryMap
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
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
    await logMessage(`[ DB ] could not update fact_offset table`, 'error');
    console.error(`updateFactOffsetTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};
