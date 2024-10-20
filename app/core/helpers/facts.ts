import {
  defaultCategoryRateMap,
  FACT_CATEGORIES_DIST_RATE,
  FACT_GROUP_LIMIT,
} from '@/core/constants/facts';
import { logMessage } from '@/core/helpers/misc';
import { FactCategories } from '@/core/types/fact';

/**
 * Creates a new Map object with keys from the FactCategory enum set to 0.
 * @returns the Map object.
 */
export const createCategoryMap = () => {
  const map = new Map<string, number>();
  for (let key in FactCategories) map.set(key, 0);
  return map;
};

const getMapItemWithLargestValue = (
  map: Map<string, number>
): { key: string; value: number } | null => {
  if (!map.size) return null;
  let largestValue = null;
  let largestKey = null;

  for (const [key, value] of map) {
    if (largestValue === null || value > largestValue) {
      largestValue = value;
      largestKey = key;
    }
  }
  if (largestKey === null) return null;
  return { key: largestKey, value: largestValue as number };
};

/**
 * Calculates the sum of values in a given Map.
 * @param map - Map<string, number>
 * @returns the sum of all values in the provided `Map` object.
 */
export const calculateSumOfMapValues = (map: Map<string, number>) => {
  return [...map.values()].reduce((acc, value) => acc + value, 0);
};

/**
 * Calculates a proportional distribution based on the input map values and a total items limit.
 * @param map - a fact offset map `Map<string, number>`. The keys represent categories, and the values represent the rate of category.
 * @returns a demand map of facts `Map<string, number>`. The keys represent categories, and the values represent the demand.
 */
export const createFactLimitMap = (
  map: Map<string, number> = defaultCategoryRateMap
): Map<string, number> | null => {
  const resultMap = new Map<string, number>();

  // n = ( value / totalRate ) * totalItems
  const totalItems = FACT_GROUP_LIMIT;

  // calculate the total rate of all categories (sum of values)
  const totalRate = calculateSumOfMapValues(map);

  // if the total rate is not high enough, return a map with average values
  if (totalRate < FACT_CATEGORIES_DIST_RATE) {
    return defaultCategoryRateMap;
  }

  // fill in the result map
  map.forEach((value: number, key: string) => {
    const result = Math.floor((value / totalRate) * totalItems);
    resultMap.set(key, result);
  });

  // calculate the total number of items after distribution
  const totalItemsDist = calculateSumOfMapValues(resultMap);

  if (totalItemsDist === totalItems) return resultMap;

  // handle the case when the total number of items doesn't equal the initial value
  const itemWithMaxValue = getMapItemWithLargestValue(resultMap);
  if (!itemWithMaxValue) {
    logMessage(`[ FH ] createFactLimitMap: invalid itemWithMaxValue`, 'error');
    return null;
  }
  const { key, value } = itemWithMaxValue;
  // calculate a difference
  const diff = totalItems - totalItemsDist;
  if (diff > 0) {
    // add the difference to a larger value
    resultMap.set(key, value + diff);
  } else {
    // subtract the difference from a larger value
    resultMap.set(key, value - diff);
  }
  return resultMap;
};
