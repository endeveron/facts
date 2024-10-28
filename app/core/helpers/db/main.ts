import { SQLiteStatement } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

import { Router } from 'expo-router';

import { FACT_GROUP_LIMIT } from '@/core/constants/facts';
import {
  createCategoryRateMapFromTableData,
  createOffsetMapFromTableData,
  updateFactOffsetTable,
} from '@/core/helpers/db/maps';
import {
  calculateSumOfMapValues,
  createFactLimitMap,
} from '@/core/helpers/facts';
import { formatObjectKeys, logMessage } from '@/core/helpers/misc';
import { saveFactsUpdTimestampInAsyncStorage } from '@/core/helpers/store';
import { postFactState } from '@/core/services/facts';
import { TAuthData } from '@/core/types/auth';
import {
  FactDataFromLocalDb,
  TAddFactsToGroupResult,
  TCursorTableItem,
  TFactCursor,
  TFactGroupTableItem,
  TFactStorageTableItem,
  TFavoritesTableItem,
  TOffsetTableItem,
  TUpdFavoritesConfig,
} from '@/core/types/db';
import { TCategoryMap, TFactItem } from '@/core/types/fact';
import { getLocalDb } from '@/core/helpers/db';

export const countTableRows = async (tableName: string) => {
  const errorMessage = `[ DB ] could not count rows in ${tableName}`;
  try {
    const db = await getLocalDb();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    if (!result) {
      logMessage(errorMessage, 'error');
      return null;
    }
    return result.count;
  } catch (error: any) {
    await logMessage(errorMessage, 'error');
    console.error(`countTableRows: ${error}`);
    return null;
  }
};

export const countCategoryFacts = async (category: string) => {
  const errorMessage = `[ DB ] could not count the category facts`;
  try {
    const db = await getLocalDb();
    const result = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM fact_storage
      WHERE category = '${category}'
    `);
    if (!result) {
      logMessage(errorMessage, 'error');
      return null;
    }
    return result.count;
  } catch (error: any) {
    await logMessage(errorMessage, 'error');
    console.error(`countCategoryFacts: ${error}`);
    return null;
  }
};

/** get data */
export const getFactDataFromLocalDb =
  async (): Promise<FactDataFromLocalDb | null> => {
    const errorMessage = `[ DB ] unable to get data from local db`;
    try {
      // get cursor data from the fact_cursor table
      const cursor = await getCursor();
      if (!cursor) {
        // logMessage(errorMessage, 'error');
        return null;
      }

      // handle the case when the user returns to the facts screen
      // after visiting the categories, update storage offset
      const offsetMap = await createOffsetMapFromTableData();
      if (!offsetMap) return null;
      const totalOffset = calculateSumOfMapValues(offsetMap);
      cursor.storageOffset = totalOffset;

      const favorites = await getFavoriteIdArray();
      const facts = await getFactGroup();

      return {
        cursor,
        favorites,
        facts,
      };
    } catch (error: any) {
      await logMessage(errorMessage, 'error');
      console.error(`getFactDataFromLocalDb: ${error}`);
      return null;
    }
  };

export const initCategoryDataInLocalDb = async (
  category: string
): Promise<FactDataFromLocalDb | null> => {
  // - get favorites
  // - check if data for the category is created (the user returns to the screen)
  // - initialize the category_group table
  // - update category offset and save in the fact_offset table
  // - create a category cursor object
  // - save the cursor into the category_cursor table

  try {
    // get favorites
    const favorites = await getFavoriteIdArray();

    // check if data for the category is created (the user returns to the screen)
    const prevFacts = await getFactGroup(category);
    if (prevFacts.length) {
      const cursor = await getCursor(category);
      if (!cursor) return null;
      return {
        cursor,
        facts: prevFacts,
        favorites,
      };
    }

    // initialize the category_group table
    const initCatGroupSussess = await initCategoryGroupTable(category);
    if (!initCatGroupSussess) return null;

    // get facts from the newly created category_group table
    const facts = await getFactGroup(category);
    const factsLength = facts.length;

    if (!factsLength) {
      await logMessage(`[ DB ] unable to retrieve facts from storage`, 'error');
      return null;
    }

    // get the total number of facts of the category in the fact_storage table
    const totalFactsResult = await countCategoryFacts(category);
    if (!totalFactsResult) return null;
    const totalInStorage = totalFactsResult;

    // get fact offset for the category
    const currentOffset = await getCategoryOffset(category);
    if (currentOffset === null) return null;

    // update fact offset for the category
    const newOffset = currentOffset + 1;

    // save the increased offset in the fact_offset table
    const incrOffsetSuccess = await increaseFactOffset({
      category,
    });
    if (!incrOffsetSuccess) return null;

    // calculate the rest of facts in storage
    const leftInStorage = totalInStorage - newOffset;
    if (leftInStorage === 0) {
      await logMessage(
        `[ DB ] there are no facts in storage for the provided category`,
        'error'
      );
      return null;
    }

    // create a category cursor object
    const cursor = {
      category,
      curFactIndex: 0,
      curFactId: facts[0].id,
      groupLength: factsLength,
      leftInGroup: factsLength - 1,
      leftInStorage,
      storageOffset: newOffset,
      done: false,
    };

    // save cursor data into the category_cursor table
    const cursorInitSuccess = await initCategoryCursorTable(cursor);
    if (!cursorInitSuccess) return null;

    return {
      cursor,
      facts,
      favorites,
    };
  } catch (error: any) {
    await logMessage(
      `[ DB ] unable to get category data from local db`,
      'error'
    );
    console.error(`initCategoryDataInLocalDb: ${error}`);
    return null;
  }
};

export const getCategoryOffset = async (category: string) => {
  const errorMessage = `[ DB ] could not get category offset data`;
  try {
    const db = await getLocalDb();
    const offsetQuery = `
      SELECT * FROM fact_offset
      WHERE category = '${category}';
    `;
    const offsetData = await db.getFirstAsync<TOffsetTableItem>(offsetQuery);
    if (offsetData === null) {
      logMessage(errorMessage, 'error');
      return null;
    }
    return offsetData.offset;
  } catch (error: any) {
    await logMessage(errorMessage, 'error');
    console.error(`getCategoryOffset: ${error}`);
    return null;
  }
};

export const getCategoryFactsFromStorage = async ({
  category,
  limit = FACT_GROUP_LIMIT,
  offset,
}: {
  category: string;
  limit?: number;
  offset: number;
}): Promise<{
  facts: TFactItem[];
  length: number;
  deficit: number;
} | null> => {
  const errorMessage = `[ DB ] could not get data from fact_storage table`;
  try {
    const db = await getLocalDb();
    const query = `
      SELECT * FROM fact_storage
      WHERE category = '${category}'
      LIMIT ${limit} OFFSET ${offset};
    `;
    const tableData = await db.getAllAsync<TFactStorageTableItem>(query);
    if (!tableData) {
      await logMessage(errorMessage, 'error');
      return null;
    }
    const facts: TFactItem[] = [];
    for (let index = 0; index < tableData.length; index++) {
      const fact = tableData[index];
      facts.push({ index, ...fact });
    }
    return {
      facts,
      length: facts.length,
      deficit: limit - facts.length,
    };
  } catch (error: any) {
    await logMessage(errorMessage, 'error');
    console.error(`getCategoryFactsFromStorage: ${error}`);
    return null;
  }
};

export const getFactsFromStorage = async ({
  currentGroup,
  cursor,
  categoryRateMap,
  offsetMap,
}: {
  currentGroup: TFactItem[];
  cursor: TFactCursor;
  offsetMap?: TCategoryMap;
  categoryRateMap?: TCategoryMap;
}): Promise<TFactItem[]> => {
  let factItems: TFactItem[] = [];
  let factDeficitMap = new Map<string, number>();

  /**
   * - create category rate map from table data if categoryRateMap is not specified
   * - create fact offset map from table data if offsetMap is not specified
   * - create a map of the limits for fetching facts
   * - iterate over all fact categories and fetch facts depending on factLimitMap values
   * - check fact deficit (the length of the received facts is less than expected)
   * - update the fact_offset table
   */

  try {
    await logMessage(`[ DB ] recieving new facts from fact_storage table`);

    // create category rate map from table data if categoryRateMap is not specified
    if (!categoryRateMap) {
      categoryRateMap = await createCategoryRateMapFromTableData();
      // console.info('categoryRateMap', categoryRateMap);
      if (!categoryRateMap) {
        await logMessage(
          `[ FH ] getFactsFromStorage: invalid category rate map`,
          'error'
        );
        return [];
      }
    }

    // get the rest of the current group to prevent intersection of facts
    // this is a slice of the group that begins from cursor.curFactIndex
    const curFactGroupSlice = currentGroup.slice(cursor.curFactIndex);

    // create a map of additional offset to prevent the intersection of facts
    const addOffsetMap = new Map<string, number>();
    curFactGroupSlice.forEach((fact) => {
      addOffsetMap.set(
        fact.category,
        (addOffsetMap.get(fact.category) || 0) + 1
      );
    });

    // create fact offset map from table data if offsetMap is not specified
    if (!offsetMap) {
      offsetMap = await createOffsetMapFromTableData();
      // console.info('offsetMap', offsetMap);
      if (!offsetMap) {
        await logMessage(
          `[ FH ] getFactsFromStorage: invalid fact offset map`,
          'error'
        );
        return [];
      }
    }

    // combine the values of the offset maps
    addOffsetMap.forEach((offset, category) => {
      offsetMap!.set(category, (offsetMap!.get(category) as number) + offset);
    });

    // create a map of the limits for fetching facts
    const factLimitMap = await createFactLimitMap(categoryRateMap);
    // console.info('factLimitMap', factLimitMap);
    if (!factLimitMap) {
      await logMessage(
        `[ FH ] getFactsFromStorage: invalid fact limit map`,
        'error'
      );
      return [];
    }

    // iterate over all fact categories and fetch facts depending on factLimitMap values
    for (let [category, limit] of factLimitMap) {
      if (limit > 0) {
        const offset = offsetMap.get(category) || 0;
        const categoryData = await getCategoryFactsFromStorage({
          category,
          limit,
          offset,
        });
        if (!categoryData) return [];
        const { facts, length, deficit } = categoryData;
        // check fact deficit (the length of the received facts is less than expected)
        if (deficit) factDeficitMap.set(category, deficit);
        if (length) {
          factItems = [...factItems, ...facts];
          offsetMap.set(category, (offsetMap.get(category) as number) + length);
        }
      }
    }

    // assign the correct indexes
    const startIndex = currentGroup.length;
    factItems = factItems.map(({ index, ...rest }, newIndex) => ({
      index: newIndex + startIndex,
      ...rest,
    }));

    // check the fact deficit map
    const totalDeficit = calculateSumOfMapValues(factDeficitMap);
    if (totalDeficit > 0) {
      await logMessage(
        `[ DB ] deficit of facts (${totalDeficit}) in fact_storage table`,
        'error'
      );
      if (totalDeficit === 1) {
        const category = factDeficitMap.keys().next().value;
        const deficit = factDeficitMap.values().next().value;
        await logMessage(`[ DB ] -${deficit} ${category}`, 'error');
      } else {
        [...factDeficitMap].forEach(async ([category, deficit]) => {
          await logMessage(`[ DB ] -${deficit} ${category}`, 'error');
        });
      }

      // TODO: handle the data, maybe save to statistics in db
    }

    // update the fact_offset table
    if (factItems.length) {
      const updOffsetSuccess = await updateFactOffsetTable(offsetMap);
      if (!updOffsetSuccess) {
        await logMessage(`[ DB ] could not get update fact offset`, 'error');
        return [];
      }

      // shuffle fact items to improve user experience
      // factItems = shuffleFactItems(factItems);
      return factItems;
    }
    return [];
  } catch (error: any) {
    await logMessage(`[ DB ] could not get facts from storage`, 'error');
    console.error(`getFactsFromStorage: ${error}`);
    return [];
  }
};

/** Common for fact_group and category_group tables */
export const getFactGroup = async (
  category?: string | null
): Promise<TFactItem[]> => {
  const table = category ? 'category_group' : 'fact_group';
  const factQuery = `SELECT * FROM ${table};`;
  const categoryQuery = `
    SELECT * FROM ${table}
    WHERE category = '${category}';
  `;
  const query = category ? categoryQuery : factQuery;
  try {
    const db = await getLocalDb();
    const facts: TFactItem[] = await db.getAllAsync<TFactGroupTableItem>(query);
    return facts;
  } catch (error: any) {
    await logMessage(`[ DB ] could not get data from ${table} table`, 'error');
    console.error(`getFactGroup: ${error}`);
    return [];
  }
};

export const getCursor = async (
  category?: string | null
): Promise<TFactCursor | null> => {
  const table = category ? 'category_cursor' : 'fact_cursor';
  const errorMessage = `[ DB ] could not get data from ${table} table`;
  try {
    const db = await getLocalDb();
    const mainSelector = `
      c.cur_fact_index,
      c.cur_fact_id,
      c.group_length,
      c.left_in_storage,
      c.left_in_group,
      c.storage_offset,
      c.done`;
    const select = category ? `c.category, ${mainSelector}` : mainSelector;
    const factQuery = `
      SELECT ${select} 
      FROM ${table} AS c
    `;
    const categoryQuery = `
      SELECT ${select} 
      FROM ${table} AS c
      WHERE category = '${category}'
    `;
    const query = category ? categoryQuery : factQuery;
    const cursorData = await db.getFirstAsync<TCursorTableItem>(query);
    if (!cursorData) return null;
    const cursor: TFactCursor = formatObjectKeys<TFactCursor>(cursorData);
    return cursor;
  } catch (error: any) {
    await logMessage(errorMessage, 'error');
    console.error(`getCursor: ${error}`);
    return null;
  }
};

export const getFavoriteIdArray = async (): Promise<string[]> => {
  try {
    const db = await getLocalDb();
    const query = `SELECT * FROM favorites`;
    const favArr = await db.getAllAsync<TFavoritesTableItem>(query);
    if (!favArr.length) return [];
    return favArr.map((fav) => fav.id);
  } catch (error: any) {
    await logMessage(`[ DB ] could not get data from favorites table`, 'error');
    console.error(`getFavoriteIdArray: ${error}`);
    return [];
  }
};

export const getFavoriteFacts = async (): Promise<TFactItem[]> => {
  try {
    const db = await getLocalDb();
    const favIdArr = await getFavoriteIdArray();
    const favIdQuotedArr = favIdArr.map((id) => `'${id}'`);
    const favorites = favIdQuotedArr.join(',');
    const query = `
      SELECT * FROM fact_storage
      WHERE id IN (${favorites})
    `;
    const tableData = await db.getAllAsync<TFactStorageTableItem>(query);
    if (!tableData.length) return [];
    const favItems = tableData.map((item, index) => ({
      index,
      ...item,
    }));
    return favItems;
  } catch (error: any) {
    await logMessage(`[ DB ] could not get data from favorites table`, 'error');
    console.error(`getFavoriteFacts: ${error}`);
    return [];
  }
};

export const getNextFact = async (): Promise<TFactItem | null> => {
  try {
    // get cursor data from the fact_cursor table
    const cursor = await getCursor();
    if (!cursor) return null;
    // get fact group
    const facts = await getFactGroup();
    if (!facts.length) return null;
    // get curIndex
    const nextFactIndex = cursor.curFactIndex + 1;
    if (nextFactIndex === facts.length) return null;
    return facts[nextFactIndex];
  } catch (error: any) {
    await logMessage(`[ DB ] could not get the next fact item`, 'error');
    console.error(`getNextFact: ${error}`);
    return null;
  }
};

/** update data */

export const addFactsToFactStorageTable = async (
  facts: TFactItem[]
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
    statement = await db.prepareAsync(
      'INSERT INTO fact_storage (id, category, title) VALUES ($id, $category, $title)'
    );
    for (let fact of facts)
      await statement.executeAsync({
        $id: fact.id,
        $category: fact.category,
        $title: fact.title,
      });
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not populate fact_storage table`, 'error');
    console.error(`addFactsToFactStorageTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const updateFavoritesTable = async ({
  operation,
  factId,
}: TUpdFavoritesConfig): Promise<boolean> => {
  let query;
  switch (operation) {
    case 'add':
      query = `
        INSERT INTO favorites (id) VALUES ('${factId}');
      `;
      break;
    case 'remove':
      query = `
        DELETE FROM favorites WHERE id = '${factId}';
      `;
  }
  try {
    const db = await getLocalDb();
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not update favorites table`, 'error');
    console.error(`updateFavoritesTable: ${error}`);
    return false;
  }
};

/** Common for fact_cursor and category_cursor tables */
export const updateCursorTable = async (
  cursor: TFactCursor,
  category?: string | null
): Promise<boolean> => {
  const table = category ? 'category_cursor' : 'fact_cursor';
  const condition = category ? `category = '${category}'` : `id = 1`;
  const query = `
    UPDATE 
      ${table}
    SET 
      cur_fact_index = ${cursor.curFactIndex},
      cur_fact_id = '${cursor.curFactId}',
      group_length = ${cursor.groupLength},
      left_in_storage = ${cursor.leftInStorage},
      left_in_group = ${cursor.leftInGroup},
      storage_offset = ${cursor.storageOffset},
      done = ${cursor.done}
    WHERE 
      ${condition};
  `;
  try {
    const db = await getLocalDb();
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not update ${table} table`, 'error');
    console.error(`updateCursorTable: ${error}`);
    return false;
  }
};

// Must be here to prevent a require cycle
export const initCategoryCursorTable = async (
  cursor: TFactCursor
): Promise<boolean> => {
  const query = `
    INSERT INTO category_cursor (
      category, 
      cur_fact_index, 
      cur_fact_id, 
      group_length, 
      left_in_group, 
      left_in_storage, 
      storage_offset, 
      done
    )
    VALUES (
      '${cursor.category}',
      ${cursor.curFactIndex},
      '${cursor.curFactId}',
      ${cursor.groupLength},
      ${cursor.leftInGroup},
      ${cursor.leftInStorage},
      ${cursor.storageOffset},
      ${cursor.done}
    );
  `;
  try {
    const db = await getLocalDb();
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not init category_cursor table`, 'error');
    console.error(`initCategoryCursorTable: ${error}`);
    return false;
  }
};

export const addFactsToFactGroupTable = async (
  facts: TFactItem[]
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    const db = await getLocalDb();
    // get facts for the current category from the fact_group table
    const factsInGroup = await getFactGroup();

    statement = await db.prepareAsync(`
      INSERT INTO fact_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title)
    `);

    const startIndex = factsInGroup.length;

    for (let index = 0; index < facts.length; index++) {
      const fact = facts[index];
      await statement.executeAsync({
        $id: fact.id,
        $index: index + startIndex,
        $category: fact.category,
        $title: fact.title,
      });
    }

    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not update fact_group table`, 'error');
    console.error(`addFactsToFactGroupTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initCategoryGroupTable = async (
  category: string
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  try {
    const db = await getLocalDb();
    // get the offset value for current category from the fact_offset table
    const offset = await getCategoryOffset(category);
    if (offset === null) {
      await logMessage(`[ DB ] could not get category offset`, 'error');
      return false;
    }

    // get facts for the current category from the fact_storage table
    const factsResult = await getCategoryFactsFromStorage({
      category,
      offset,
    });
    if (!factsResult) {
      await logMessage(
        `[ DB ] could not get category facts from fact_storage table`,
        'error'
      );
      return false;
    }

    const { facts } = factsResult;

    // init category_group table
    statement = await db.prepareAsync(`
      INSERT INTO category_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title)
    `);
    for (let index = 0; index < facts.length; index++) {
      const fact = facts[index];
      await statement.executeAsync({
        $id: fact.id,
        $index: index,
        $category: category,
        $title: fact.title,
      });
    }
    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not init category_group table`, 'error');
    console.error(`initCategoryGroupTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const addFactsToCategoryGroupTable = async ({
  category,
  cursor,
  facts,
}: {
  category: string;
  cursor: TFactCursor;
  facts: TFactItem[];
}): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  try {
    const db = await getLocalDb();

    // get facts for the current category from the category_group table
    const factsInGroup = await getFactGroup(category);

    statement = await db.prepareAsync(`
      INSERT INTO category_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title)
    `);

    const startIndex = factsInGroup.length;

    for (let index = 0; index < facts.length; index++) {
      const fact = facts[index];
      await statement.executeAsync({
        $id: fact.id,
        $index: index + startIndex,
        $category: category,
        $title: fact.title,
      });
    }

    return true;
  } catch (error: any) {
    await logMessage(
      `[ DB ] could not add facts to category_group table`,
      'error'
    );
    console.error(`addFactsToCategoryGroupTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

/**
 * Updates the offset value in the fact_offset table.
 * @returns `null` if the operation is successful, or an error object.
 */
export const increaseFactOffset = async ({
  category,
}: {
  category: string;
}): Promise<boolean> => {
  try {
    const db = await getLocalDb();
    // get current offset
    const currentOffset = await getCategoryOffset(category);
    if (currentOffset === null) {
      logMessage(
        `[ DB ] unable to get offset value from fact_offset table`,
        'error'
      );
      return false;
    }
    const offset = currentOffset + 1;

    // update fact_offset table
    const query = `
      UPDATE fact_offset
      SET offset = ${offset}
      WHERE category = '${category}';
    `;
    await db.execAsync(query);

    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not update fact_offset table`, 'error');
    console.error(`increaseFactOffset: ${error}`);
    return false;
  }
};

export const addFactsToGroup = async ({
  currentGroup,
  cursor,
}: {
  currentGroup: TFactItem[];
  cursor: TFactCursor;
}): Promise<TAddFactsToGroupResult> => {
  // - get new facts from the fact_storage table
  // - update the fact_group table
  // - update the cursor

  let statement: SQLiteStatement | null = null;
  let done = false;
  const curGroupLength = currentGroup.length;

  try {
    const db = await getLocalDb();
    // get new facts from fact_storage table
    const newFacts = await getFactsFromStorage({ currentGroup, cursor });
    if (!newFacts) {
      await logMessage(`[ DB ] could not get facts from storage`, 'error');
      return null;
    }
    const newFactsLength = newFacts.length;
    if (newFactsLength < FACT_GROUP_LIMIT) done = true;

    // add recieved facts to fact_group table
    const addQuery = `
      INSERT INTO fact_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title);
    `;
    statement = await db.prepareAsync(addQuery);
    // the correct indexes are assigned by the getFactsFromStorage() method
    for (let fact of newFacts) {
      await statement.executeAsync({
        $id: fact.id,
        $index: fact.index,
        $category: fact.category,
        $title: fact.title,
      });
    }

    // update the cursor
    const updGroupLength = curGroupLength + newFactsLength;
    const newCursor: TFactCursor = {
      curFactIndex: cursor.curFactIndex,
      curFactId: cursor.curFactId,
      groupLength: updGroupLength,
      leftInGroup: cursor.leftInGroup + newFactsLength,
      leftInStorage: cursor.leftInStorage,
      storageOffset: cursor.storageOffset,
      done,
    };

    const newGroup = await getFactGroup();

    return {
      newCursor,
      newGroup,
    };
  } catch (error: any) {
    await logMessage(`[ DB ] could not add facts to group`, 'error');
    console.error(`addFactsToGroup: ${error}`);
    return null;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const addFactsToCategoryGroup = async ({
  category,
  currentGroup,
  cursor,
}: {
  category: string;
  currentGroup: TFactItem[];
  cursor: TFactCursor;
}): Promise<TAddFactsToGroupResult> => {
  // - get the current offset value from the fact_offset table
  // - get the new category group from fact_storage using the offset
  // - update the fact group length
  // - update the cursor
  // - update the category_group table

  const curGroupLength = currentGroup.length;

  try {
    // get the current offset value from the fact_offset table
    let offset = await getCategoryOffset(category);
    if (offset === null) return null;

    offset += curGroupLength - cursor.curFactIndex;

    // get new category group from fact_storage using the offset
    const dataFromStorage = await getCategoryFactsFromStorage({
      category,
      offset,
    });
    if (!dataFromStorage) return null;

    const { facts, length: newFactsLength, deficit } = dataFromStorage;
    if (!newFactsLength) {
      await logMessage(
        `[ DB ] there are no new '${category}' facts in fact_storage table`,
        'error'
      );
      const { done, ...rest } = cursor;
      return {
        newGroup: currentGroup,
        newCursor: {
          done: true,
          ...rest,
        },
      };
    }

    // check fact deficit (the length of the received facts is less than expected)
    if (deficit > 0) {
      await logMessage(
        `[ DB ] deficit of '${category}' facts (${deficit}) in fact_storage table`,
        'error'
      );
    }

    // update the cursor
    const updGroupLength = curGroupLength + newFactsLength;
    const newCursor = {
      category: cursor.category,
      curFactIndex: cursor.curFactIndex,
      curFactId: cursor.curFactId,
      groupLength: updGroupLength,
      leftInGroup: cursor.leftInGroup + newFactsLength,
      leftInStorage: cursor.leftInStorage,
      storageOffset: cursor.storageOffset,
      done: cursor.done,
    };

    // console.log(
    //   'BB curGroup',
    //   currentGroup.map((f) => ({
    //     i: f.index,
    //     t: f.title,
    //   }))
    // );
    // console.log(
    //   'BB stoGroup',
    //   facts.map((f) => ({
    //     i: f.index,
    //     t: f.title,
    //   }))
    // );

    // add facts to the category_group table
    const updGroupSuccess = await addFactsToCategoryGroupTable({
      category,
      cursor: newCursor,
      facts,
    });
    if (!updGroupSuccess) return null;

    const newGroup = await getFactGroup(category);

    // console.log(
    //   'BB newGroup',
    //   facts.map((f) => ({
    //     i: f.index,
    //     t: f.title,
    //   }))
    // );

    return {
      newCursor,
      newGroup,
    };
  } catch (error: any) {
    await logMessage(`[ DB ] could not add facts to category group`, 'error');
    console.error(`addFactsToCategoryGroup: ${error}`);
    return null;
  }
};

/** Common for fact_group and category_group tables */
export const updateFactGroupTable = async (
  newGroup: TFactItem[],
  category: string | null
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  const tableName = category ? 'category_group' : 'fact_group';

  try {
    const db = await getLocalDb();

    // create query
    const clearFactQuery = `DELETE FROM fact_group`;
    const clearCategoryQuery = `
      DELETE FROM category_group
      WHERE category = '${category}'
    `;
    const clearQuery = category ? clearCategoryQuery : clearFactQuery;

    // clear table
    await db.execAsync(clearQuery);

    // add new fact group to table
    const addQuery = `
      INSERT INTO ${tableName} (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title);
    `;
    statement = await db.prepareAsync(addQuery);
    // the correct indexes are assigned by the truncateFactsOnScroll() method
    for (let fact of newGroup) {
      await statement.executeAsync({
        $id: fact.id,
        $index: fact.index,
        $category: fact.category,
        $title: fact.title,
      });
    }

    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] could not update ${tableName} table`, 'error');
    console.error(`updateFactGroupTable: ${error}`);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const addFactsOnScroll = async ({
  category,
  currentGroup,
  cursor,
}: {
  category: string | null;
  currentGroup: TFactItem[];
  cursor: TFactCursor;
}): Promise<TAddFactsToGroupResult> => {
  let addFactsResult: TAddFactsToGroupResult = null;
  if (category) {
    addFactsResult = await addFactsToCategoryGroup({
      category,
      currentGroup,
      cursor,
    });
  } else {
    addFactsResult = await addFactsToGroup({
      currentGroup,
      cursor,
    });
  }
  if (!addFactsResult) {
    await logMessage(`[ FC ] unable to get new facts`, 'error');
    return null;
  }

  return addFactsResult;
};

export const truncateFactsOnScroll = async ({
  category,
  currentGroup,
  cursor,
}: {
  category: string | null;
  currentGroup: TFactItem[];
  cursor: TFactCursor;
  // }): Promise<TAddFactsToGroupResult> => {
}) => {
  // - remove first N items
  // - update cursor.curFactIndex prev - N
  // - update cursor.groupLength
  // - update indexes index = prev - N
  // - update fact / category group table

  const removeCount = FACT_GROUP_LIMIT;
  const truncatedGroup = currentGroup.slice(removeCount);
  const newCursor: TFactCursor = { ...cursor };
  newCursor.curFactIndex = cursor.curFactIndex - removeCount;
  newCursor.groupLength = cursor.groupLength - removeCount;

  const newGroup = truncatedGroup.map(({ index, ...rest }) => ({
    index: index - removeCount,
    ...rest,
  }));

  await updateFactGroupTable(newGroup, category);

  return {
    newCursor,
    newGroup,
  };
};

export const openNextFact = async (router: Router) => {
  try {
    const nextFact = await getNextFact();
    if (!nextFact) {
      await logMessage(`[ DB ] unable to get the next fact`, 'error');
      router.push('/facts');
      return;
    }
    router.push({
      pathname: '/facts',
      params: {
        nextIndex: nextFact.index,
      },
    });
  } catch (error: any) {
    await logMessage(`[ DB ] unable to open the next fact`, 'error');
    console.error(`openNextFact: ${error}`);
    return null;
  }
};

export const exportFactStateToRemoteDb = async ({
  token,
  userId,
}: TAuthData & {}): Promise<boolean> => {
  try {
    // retrieve data from the local db
    const favorites = await getFavoriteIdArray();
    const categoryRateMap = await createCategoryRateMapFromTableData();
    const offsetMap = await createOffsetMapFromTableData();
    if (!categoryRateMap || !offsetMap) {
      await logMessage(`[ DB ] export state: invalid map data`, 'error');
      return false;
    }

    // convert category maps to objects
    const categoryRateMapObj = Object.fromEntries(categoryRateMap);
    const offsetMapObj = Object.fromEntries(offsetMap);

    const factState = {
      favorites,
      categoryRateMap: categoryRateMapObj,
      offsetMap: offsetMapObj,
    };

    // POST `${API_BASE_URL}/facts/state`
    const postResult = await postFactState({
      factState,
      token,
      userId,
    });

    if (postResult?.error) {
      await logMessage(
        `[ DB ] export state: ${postResult.error.message}`,
        'error'
      );
      return false;
    }

    if (!postResult?.data) {
      await logMessage(`[ DB ] unable to export fact state`, 'error');
      return false;
    }

    // save timestamp to async storage
    const { updatedAt } = postResult.data;
    await saveFactsUpdTimestampInAsyncStorage(updatedAt);

    return true;
  } catch (error: any) {
    await logMessage(`[ DB ] unable to export fact state`, 'error');
    console.error(`exportFactStateToRemoteDb: ${error}`);
    return false;
  }
};
