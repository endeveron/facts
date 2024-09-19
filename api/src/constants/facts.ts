// limitation on the number of facts to be received per request
const FACT_ITEMS_LIMIT = 8;

// total rate of all categories (sum of values) to enable proportional distribution
const FACT_CATEGORIES_DIST_RATE = 48;

// fact item properties that will be included in the output result
const FACT_PROPS = '_id title category details source';

export { FACT_ITEMS_LIMIT, FACT_CATEGORIES_DIST_RATE, FACT_PROPS };
