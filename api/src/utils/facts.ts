import { TFact, TFactItem } from '../types/fact.js';

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
