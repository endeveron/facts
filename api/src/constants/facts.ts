// limitation on the number of facts to be received per request
const FACT_GROUP_LIMIT = 8;

// limitation on the number of facts to be received for the local db
// const FACT_STORAGE_LIMIT = FACT_GROUP_LIMIT * 8;
const FACT_STORAGE_LIMIT = FACT_GROUP_LIMIT * 128;

// total rate of all categories (sum of values) to enable proportional distribution
const FACT_CATEGORIES_DIST_RATE = 48;

// fact item properties that will be included in the output result
const FACT_PROPS = '_id title category details source';

export {
  FACT_GROUP_LIMIT,
  FACT_STORAGE_LIMIT,
  FACT_CATEGORIES_DIST_RATE,
  FACT_PROPS,
};
