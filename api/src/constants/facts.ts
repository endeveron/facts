import { FactCategories } from '../types/fact';

const totalFactCategories = Object.keys(FactCategories).length;

// limitation on the number of facts to be received per request
const FACT_GROUP_LIMIT = totalFactCategories;

// limitation on the number of facts to be received for the local db
const FACT_STORAGE_LIMIT = FACT_GROUP_LIMIT * 40;

// total rate of all categories (sum of values) to enable proportional distribution
const FACT_CATEGORIES_DIST_RATE = FACT_GROUP_LIMIT * 6;

export { FACT_GROUP_LIMIT, FACT_STORAGE_LIMIT, FACT_CATEGORIES_DIST_RATE };
