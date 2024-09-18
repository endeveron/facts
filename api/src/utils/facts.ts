import { FactCategory, TFact, TFactItem } from '../types/fact.js';

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
 *
 * @param {TFactItem[]} factItems - an array of objects of type `TFactItem`.
 * @returns an updated offsetMap object of type TCategoryMap.
 */
export const updateOffsetMap = (factItems: TFactItem[]) => {
  console.log('factItems', factItems);
  // const map = new Map<string, number>();
  // for (let key in FactCategory) map.set(key, 0);
  // return map;
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
