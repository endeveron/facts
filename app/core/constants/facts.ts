import { createCategoryMap } from '@/core/helpers/facts';
import { enumToArray } from '@/core/helpers/misc';
import { FactCategories } from '@/core/types/fact';

/** Limitation on the number of facts to be received per request */
const FACT_GROUP_LIMIT = 8;
/** Limitation on the number of facts to be received for the local db */
// const FACT_STORAGE_LIMIT = FACT_GROUP_LIMIT * 8;
const FACT_STORAGE_LIMIT = FACT_GROUP_LIMIT * 128;
/** Total rate of all categories (sum of values) to enable proportional distribution */
const FACT_CATEGORIES_DIST_RATE = 48;
/** The number of facts left in group to trigger the retrieval of new group */
const FACTS_LEFT_TO_FETCH_NEW_ITEMS = 2;

const factActions = [
  {
    buttonTitle: 'Option A',
    identifier: 'first',
    options: {
      opensAppToForeground: true,
    },
  },
  {
    buttonTitle: 'Option B',
    identifier: 'second',
    options: {
      opensAppToForeground: true,
    },
  },
];

const factCategories = enumToArray(FactCategories);

const defaultCategoryRateMap = new Map([
  ['nature', 2],
  ['human', 1],
  ['entertainment', 1],
  ['science', 1],
  ['business', 1],
  ['miscellaneous', 2],
]);

const localDbTables = [
  'fact_storage',
  'fact_group',
  'category_group',
  'favorites',
  'fact_cursor',
  'category_cursor',
  'fact_category_rate',
  'fact_offset',
  // 'logs',
];

export {
  FACT_GROUP_LIMIT,
  FACT_STORAGE_LIMIT,
  FACT_CATEGORIES_DIST_RATE,
  FACTS_LEFT_TO_FETCH_NEW_ITEMS,
  factActions,
  factCategories,
  defaultCategoryRateMap,
  localDbTables,
};
