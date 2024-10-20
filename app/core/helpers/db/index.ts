import { SQLiteDatabase, SQLiteStatement } from 'expo-sqlite';

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
import { formatObjectKeys, logMessage, sleep } from '@/core/helpers/misc';
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
import { Router } from 'expo-router';

export const countTableRows = async (tableName: string, db: SQLiteDatabase) => {
  const errorMessage = `[ DB ] could not count rows in ${tableName}`;
  try {
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    if (!result) {
      logMessage(errorMessage, 'error');
      return null;
    }
    return result.count;
  } catch (error: any) {
    logMessage(errorMessage, 'error');
    console.error(error);
    return null;
  }
};

export const countCategoryFacts = async (
  category: string,
  db: SQLiteDatabase
) => {
  const errorMessage = `[ DB ] could not count the category facts`;
  try {
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
    logMessage(errorMessage, 'error');
    console.error(error);
    return null;
  }
};

/** get data */

export const getFactDataFromLocalDb = async (
  db: SQLiteDatabase
): Promise<FactDataFromLocalDb | null> => {
  const errorMessage = `[ DB ] unable to get data from local db`;
  try {
    // get cursor data from the fact_cursor table
    const cursor = await getCursor({ db });
    if (!cursor) {
      // logMessage(errorMessage, 'error');
      return null;
    }
    const favorites = await getFavorites(db);
    const facts = await getFactGroup({ db });
    // console.log('cursor', cursor);
    // console.log('favorites', favorites);
    // console.log('facts', facts);
    return {
      cursor,
      favorites,
      facts,
    };
  } catch (err: any) {
    logMessage(errorMessage, 'error');
    console.error(err);
    return null;
  }
};

export const initCategoryDataInLocalDb = async ({
  category,
  db,
}: {
  category: string;
  db: SQLiteDatabase;
}): Promise<FactDataFromLocalDb | null> => {
  // - get favorites
  // - check if data for the category is created (the user returns to the screen)
  // - initialize the category_group table
  // - update category offset and save in the fact_offset table
  // - create a category cursor object

  console.log('initCategoryData', category);

  try {
    // get favorites
    const favorites = await getFavorites(db);

    // check if data for the category is created (the user returns to the screen)
    const prevFacts = await getFactGroup({ category, db });
    if (prevFacts.length) {
      const cursor = await getCursor({ category, db });
      if (!cursor) return null;
      return {
        cursor,
        facts: prevFacts,
        favorites,
      };
    }

    // initialize the category_group table
    const initCatGroupSussess = await initCategoryGroupTable({
      db,
      category,
    });
    if (!initCatGroupSussess) return null;

    // get facts from the newly created category_group table
    const facts = await getFactGroup({ category, db });
    const factsLength = facts.length;

    if (!factsLength) {
      logMessage(`[ DB ] unable to retrieve facts from storage`, 'error');
      return null;
    }

    // dev check table data
    // const catGroupTableData = await getFactGroup({db, category});
    // console.log('catGroupTableData', catGroupTableData);

    // get the total number of facts of the category in the fact_storage table
    const totalFactsResult = await countCategoryFacts(category, db);
    if (!totalFactsResult) return null;
    const totalInStorage = totalFactsResult;

    // get fact offset for the category
    const currentOffset = await getCategoryOffset({ category, db });
    if (currentOffset === null) return null;

    // update fact offset for the category
    const newOffset = currentOffset + 1;

    // save the increased offset in the fact_offset table
    const incrOffsetSuccess = await increaseFactOffset({
      category,
      db,
    });
    if (!incrOffsetSuccess) return null;

    // calculate the rest of facts in storage
    const leftInStorage = totalInStorage - newOffset;
    if (leftInStorage === 0) {
      logMessage(
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

    const cursorInitSuccess = await initCategoryCursorTable(cursor, db);
    if (!cursorInitSuccess) return null;

    return {
      cursor,
      facts,
      favorites,
    };
  } catch (error: any) {
    logMessage(`[ DB ] unable to get category data from local db`, 'error');
    console.error(error);
    return null;
  }
};

export const getCategoryOffset = async ({
  category,
  db,
}: {
  category: string;
  db: SQLiteDatabase;
}) => {
  const errorMessage = `[ DB ] could not get category offset data`;
  try {
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
  } catch (err: any) {
    logMessage(errorMessage, 'error');
    console.error(err);
    return null;
  }
};

export const getCategoryFactsFromStorage = async ({
  category,
  limit = FACT_GROUP_LIMIT,
  offset,
  db,
}: {
  category: string;
  limit?: number;
  offset: number;
  db: SQLiteDatabase;
}): Promise<{
  facts: TFactItem[];
  length: number;
  deficit: number;
} | null> => {
  const errorMessage = `[ DB ] could not get data from fact_storage table`;
  try {
    const query = `
      SELECT * FROM fact_storage
      WHERE category = '${category}'
      LIMIT ${limit} OFFSET ${offset};
    `;
    const tableData = await db.getAllAsync<TFactStorageTableItem>(query);
    if (!tableData) {
      logMessage(errorMessage, 'error');
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
    logMessage(errorMessage, 'error');
    console.error(error);
    return null;
  }
};

export const getFactsFromStorage = async ({
  currentGroup,
  cursor,
  db,
  categoryRateMap,
  offsetMap,
}: {
  currentGroup: TFactItem[];
  cursor: TFactCursor;
  db: SQLiteDatabase;
  offsetMap?: TCategoryMap;
  categoryRateMap?: TCategoryMap;
}): Promise<TFactItem[]> => {
  let factItems: TFactItem[] = [];
  let factDeficitMap = new Map<string, number>();

  logMessage(`[ DB ] recieving new facts from fact_storage table`);

  /**
   * - create category rate map from table data if categoryRateMap is not specified
   * - create fact offset map from table data if offsetMap is not specified
   * - create a map of the limits for fetching facts
   * - iterate over all fact categories and fetch facts depending on factLimitMap values
   * - check fact deficit (the length of the received facts is less than expected)
   * - update the fact_offset table
   */

  try {
    // create category rate map from table data if categoryRateMap is not specified
    if (!categoryRateMap) {
      categoryRateMap = await createCategoryRateMapFromTableData(db);
      // console.info('categoryRateMap', categoryRateMap);
      if (!categoryRateMap) {
        logMessage(
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
      offsetMap = await createOffsetMapFromTableData(db);
      // console.info('offsetMap', offsetMap);
      if (!offsetMap) {
        logMessage(
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
    const factLimitMap = createFactLimitMap(categoryRateMap);
    // console.info('factLimitMap', factLimitMap);
    if (!factLimitMap) {
      logMessage(`[ FH ] getFactsFromStorage: invalid fact limit map`, 'error');
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
          db,
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

    // // dev
    // const ngmap = factItems.map((d) => ({
    //   index: d.index,
    //   title: d.title.substring(0, 50),
    // }));
    // console.log('NewGroup', ngmap);

    // assign the correct indexes
    const startIndex = currentGroup.length;
    factItems = factItems.map(({ index, ...rest }, newIndex) => ({
      index: newIndex + startIndex,
      ...rest,
    }));

    // check the fact deficit map
    const totalDeficit = calculateSumOfMapValues(factDeficitMap);
    if (totalDeficit > 0) {
      logMessage(
        `[ DB ] deficit of facts (${totalDeficit}) in fact_storage table`,
        'error'
      );
      if (totalDeficit === 1) {
        const category = factDeficitMap.keys().next().value;
        const deficit = factDeficitMap.values().next().value;
        logMessage(`[ DB ] -${deficit} ${category}`, 'error');
      } else {
        [...factDeficitMap].forEach(([category, deficit]) => {
          logMessage(`[ DB ] -${deficit} ${category}`, 'error');
        });
      }

      // TODO: handle the data, maybe save to statistics in db
    }

    // update the fact_offset table
    if (factItems.length) {
      const updOffsetSuccess = await updateFactOffsetTable(offsetMap, db);
      if (!updOffsetSuccess) {
        logMessage(`[ DB ] could not get update fact offset`, 'error');
        return [];
      }

      // shuffle fact items to improve user experience
      // factItems = shuffleFactItems(factItems);
      return factItems;
    }
    return [];
  } catch (error: any) {
    logMessage(`[ DB ] could not get facts from storage`, 'error');
    console.error(error);
    return [];
  }
};

/** Common for fact_group and category_group tables */
export const getFactGroup = async ({
  db,
  category,
}: {
  db: SQLiteDatabase;
  category?: string | null;
}): Promise<TFactItem[]> => {
  const table = category ? 'category_group' : 'fact_group';
  const factQuery = `SELECT * FROM ${table};`;
  const categoryQuery = `
    SELECT * FROM ${table}
    WHERE category = '${category}';
  `;
  const query = category ? categoryQuery : factQuery;
  try {
    const facts: TFactItem[] = await db.getAllAsync<TFactGroupTableItem>(query);
    return facts;
  } catch (error: any) {
    logMessage(`[ DB ] could not get data from ${table} table`, 'error');
    console.error(error);
    return [];
  }
};

export const getCursor = async ({
  db,
  category,
}: {
  db: SQLiteDatabase;
  category?: string | null;
}): Promise<TFactCursor | null> => {
  const table = category ? 'category_cursor' : 'fact_cursor';
  const errorMessage = `[ DB ] could not get data from ${table} table`;
  try {
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
    logMessage(errorMessage, 'error');
    console.error(error);
    return null;
  }
};

export const getFavorites = async (db: SQLiteDatabase): Promise<string[]> => {
  try {
    const query = `SELECT * FROM favorites`;
    const favArr = await db.getAllAsync<TFavoritesTableItem>(query);
    if (!favArr.length) return [];
    return favArr.map((fav) => fav.id);
  } catch (error: any) {
    logMessage(`[ DB ] could not get data from favorites table`, 'error');
    console.error(error);
    return [];
  }
};

export const getNextFact = async (
  db: SQLiteDatabase
): Promise<TFactItem | null> => {
  try {
    // get cursor data from the fact_cursor table
    const cursor = await getCursor({ db });
    if (!cursor) return null;
    // get fact group
    const facts = await getFactGroup({ db });
    if (!facts.length) return null;
    // get curIndex
    const nextFactIndex = cursor.curFactIndex + 1;
    if (nextFactIndex === facts.length) return null;
    return facts[nextFactIndex];
  } catch (error: any) {
    logMessage(`[ DB ] could not get the next fact item`, 'error');
    console.error(error);
    return null;
  }
};

/** update data */

export const addFactsToFactStorageTable = async (
  facts: TFactItem[],
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
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
    logMessage(`[ DB ] could not populate fact_storage table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const updateFavoritesTable = async (
  { operation, factId }: TUpdFavoritesConfig,
  db: SQLiteDatabase
): Promise<boolean> => {
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
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not update favorites table`, 'error');
    console.error(error);
    return false;
  }
};

/** Common for fact_cursor and category_cursor tables */
export const updateCursorTable = async (
  cursor: TFactCursor,
  db: SQLiteDatabase,
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
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not update ${table} table`, 'error');
    console.error(error);
    return false;
  }
};

// Must be here to prevent a require cycle
export const initCategoryCursorTable = async (
  cursor: TFactCursor,
  db: SQLiteDatabase
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
    await db.execAsync(query);
    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not init category_cursor table`, 'error');
    console.error(error);
    return false;
  }
};

export const updateFactGroupTable = async (
  facts: TFactItem[],
  db: SQLiteDatabase
): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;
  try {
    // get facts for the current category from the fact_group table
    const factsInGroup = await getFactGroup({ db });
    const startIndex = factsInGroup.length;

    // await db.execAsync(`DELETE FROM fact_group`);
    statement = await db.prepareAsync(`
      INSERT INTO fact_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title)
    `);
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
    logMessage(`[ DB ] could not update fact_group table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const initCategoryGroupTable = async ({
  category,
  db,
}: {
  category: string;
  db: SQLiteDatabase;
}): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  try {
    // get the offset value for current category from the fact_offset table
    const offset = await getCategoryOffset({ category, db });
    if (offset === null) {
      logMessage(`[ DB ] could not get category offset`, 'error');
      return false;
    }

    // get facts for the current category from the fact_storage table
    const factsResult = await getCategoryFactsFromStorage({
      category,
      offset,
      db,
    });
    if (!factsResult) {
      logMessage(
        `[ DB ] could not get category facts from fact_storage table`,
        'error'
      );
      return false;
    }

    const { facts } = factsResult;

    // init category group table
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
    logMessage(`[ DB ] could not init category_group table`, 'error');
    console.error(error);
    return false;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const updateCategoryGroupTable = async ({
  category,
  cursor,
  db,
  facts,
}: {
  category: string;
  cursor: TFactCursor;
  facts: TFactItem[];
  db: SQLiteDatabase;
}): Promise<boolean> => {
  let statement: SQLiteStatement | null = null;

  // !! remove common items
  console.log('cursor', cursor);

  try {
    // // get facts for the current category from the category_group table
    // const categoryFacts = await getFactGroup({ db, category });
    // const startIndex = categoryFacts.length;
    const startIndex = facts.length;

    const query = `SELECT * FROM category_group;`;
    const data: TFactItem[] = await db.getAllAsync<TFactGroupTableItem>(query);
    const prevFactsMap = data.map((d) => ({ index: d.index, title: d.title }));
    console.log('PrevCatGroup', prevFactsMap);

    statement = await db.prepareAsync(`
      INSERT INTO category_group (id, 'index', category, title) 
      VALUES ($id, $index, $category, $title)
    `);
    for (let index = 0; index < facts.length; index++) {
      const fact = facts[index];
      await statement.executeAsync({
        $id: fact.id,
        $index: index + startIndex,
        $category: category,
        $title: fact.title,
      });
    }

    const newData: TFactItem[] = await db.getAllAsync<TFactGroupTableItem>(
      query
    );
    const newFactsMap = newData.map((d) => ({
      index: d.index,
      title: d.title,
    }));
    console.log('NewCatGroup', newFactsMap);

    return true;
  } catch (error: any) {
    logMessage(`[ DB ] could not update category_group table`, 'error');
    console.error(error);
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
  db,
}: {
  category: string;
  db: SQLiteDatabase;
}): Promise<boolean> => {
  try {
    // get current offset
    const currentOffset = await getCategoryOffset({ category, db });
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
    logMessage(`[ DB ] could not update fact_offset table`, 'error');
    console.error(error);
    return false;
  }
};

export const addFactsToGroup = async ({
  currentGroup,
  cursor,
  db,
}: {
  currentGroup: TFactItem[];
  cursor: TFactCursor;
  db: SQLiteDatabase;
}): Promise<TAddFactsToGroupResult> => {
  // - get new facts from the fact_storage table
  // - update the fact_group table
  // - update the cursor

  let statement: SQLiteStatement | null = null;
  let done = false;
  const curGroupLength = currentGroup.length;

  try {
    // get new facts from fact_storage table
    const newFacts = await getFactsFromStorage({ currentGroup, cursor, db });
    if (!newFacts) {
      logMessage(`[ DB ] could not get facts from storage`, 'error');
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
      leftInStorage: cursor.leftInStorage - newFactsLength,
      storageOffset: updGroupLength,
      done,
    };

    const newGroup = await getFactGroup({ db });

    return {
      newCursor,
      newGroup,
    };
  } catch (error: any) {
    logMessage(`[ DB ] could not add facts to group`, 'error');
    console.error(error);
    return null;
  } finally {
    if (statement) await statement.finalizeAsync();
  }
};

export const addFactsToCategoryGroup = async ({
  category,
  currentGroup,
  cursor,
  db,
}: {
  category: string;
  currentGroup: TFactItem[];
  cursor: TFactCursor;
  db: SQLiteDatabase;
}): Promise<TAddFactsToGroupResult> => {
  // - get the current offset value from the fact_offset table
  // - get the new category group from fact_storage using the offset
  // - update the fact group length
  // - update the cursor
  // - update the category_group table

  const curGroupLength = currentGroup.length;

  try {
    // get the current offset value from the fact_offset table
    let offset = await getCategoryOffset({ category, db });
    if (offset === null) return null;

    /**
     *  The intersection of facts
     *  prev group:
     *  ...
     * 	4: "The world’s termites outweigh..."
     * !5: "Bullfrogs do not sleep"
     * !6: "A snail breathes through its foot"
     * !7: "An ant’s sense of smell is stronger..."
     *
     *  new group:
     * !8: "Bullfrogs do not sleep"
     * !9: "A snail breathes through its foot"
     * !10: "An ant’s sense of smell is stronger..."
     *  11: "Lizards communicate by doing push-ups"
     *  ...
     */

    // calculate an additional offset to prevent the intersection of facts
    offset += FACT_GROUP_LIMIT - cursor.curFactIndex;

    // get new category group from fact_storage using the offset
    const dataFromStorage = await getCategoryFactsFromStorage({
      category,
      offset,
      db,
    });
    if (!dataFromStorage) return null;

    const { facts, length: newFactsLength, deficit } = dataFromStorage;
    if (!newFactsLength) {
      logMessage(
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

    // update the fact group length
    const updGroupLength = curGroupLength + newFactsLength;

    // check fact deficit (the length of the received facts is less than expected)
    if (deficit > 0) {
      logMessage(
        `[ DB ] deficit of '${category}' facts (${deficit}) in fact_storage table`,
        'error'
      );
    }

    // update the cursor
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

    // add facts to the category_group table
    const updGroupSuccess = await updateCategoryGroupTable({
      category,
      cursor: newCursor,
      db,
      facts,
    });
    if (!updGroupSuccess) return null;

    const newGroup = await getFactGroup({ category, db });

    return {
      newCursor,
      newGroup,
    };
  } catch (error: any) {
    console.error(error);
    return null;
  }
};

export const openNextFact = async (db: SQLiteDatabase, router: Router) => {
  const nextFact = await getNextFact(db);
  console.log('nextFact', nextFact);
  if (!nextFact) {
    logMessage(`[ FH ] unable to get the next act`, 'error');
    router.push('/facts');
    return;
  }
  router.push({
    pathname: '/facts',
    params: {
      index: nextFact.index,
    },
  });
};
