import {
  FACT_CATEGORIES_DIST_RATE,
  FACT_ITEMS_LIMIT,
} from '../constants/facts';
import { FactCategory, TFact, TFactItem } from '../types/fact';
import logger from './logger';

/**
 * Creates a new Map object with keys from the FactCategory enum set to 0.
 * @returns the Map object.
 */
export const createCategoryMap = () => {
  const map = new Map<string, number>();
  for (let key in FactCategory) map.set(key, 0);
  return map;
};

/**
 * Serializes an array of facts, converts the _id param, ObjectId > string
 * @param {TFact[]} facts - an array of objects of type `TFact`.
 * @returns an array of objects of type `TFactItem`.
 */
export const configureFactItems = (facts: TFact[]): TFactItem[] => {
  return facts.map((fact) => ({
    id: fact._id.toString(),
    title: fact.title,
    category: fact.category,
  }));
};

/**
 * Shuffles an array of fact items using the Fisher-Yates (also known as Knuth) algorithm.
 * @param {TFact[]} factItems - an array of objects of type `TFactItem`.
 * @returns shuffled array of objects of type `TFactItem`.
 */
export const shuffleFactItems = (factItems: TFactItem[]): TFactItem[] => {
  const shuffledArray = [...factItems];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
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

export const calculateSumOfMapValues = (map: Map<string, number>) => {
  return [...map.values()].reduce((acc, value) => acc + value, 0);
};

/**
 * Calculates a proportional distribution based on the input map values and a total items limit.
 * @param map - a fact offset map `Map<string, number>`. The keys represent categories, and the values represent the rate of category.
 * @returns a demand map of facts `Map<string, number>`. The keys represent categories, and the values represent the demand.
 */
export const createFactLimitMap = (
  map: Map<string, number>
): Map<string, number> => {
  const resultMap = new Map<string, number>();

  // n = ( value / totalRate ) * totalItems
  const totalItems = FACT_ITEMS_LIMIT;

  // calculate the total rate of all categories (sum of values)
  const totalRate = calculateSumOfMapValues(map);

  // if the total rate is not high enough, return a map with average values
  if (totalRate < FACT_CATEGORIES_DIST_RATE) {
    return new Map([
      ['nature', 2],
      ['science', 2],
      ['human', 1],
      ['business', 1],
      ['entertainment', 1],
      ['miscellaneous', 1],
    ]);
  }

  // fill in the result map
  map.forEach((value: number, key: string) => {
    const result = Math.round((value / totalRate) * totalItems);
    resultMap.set(key, result);
  });

  // calculate the total number of items after distribution
  const totalItemsDist = calculateSumOfMapValues(resultMap);

  if (totalItemsDist === totalItems) return resultMap;

  // handle the case when the total number of items doesn't equal the initial value
  const itemWithMaxValue = getMapItemWithLargestValue(resultMap);
  if (!itemWithMaxValue) {
    logger.r('createFactLimitMap: invalid itemWithMaxValue.');
    return resultMap;
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
