import { ObjectId } from 'mongoose';

export type TFactData = {
  title: string;
  category: string;
};

export type TFact = TFactData & {
  _id: ObjectId;
};

export type TFactItem = TFactData & {
  id: string;
};

export type TCategoryMap = Map<string, number>;

export enum FactCategory {
  nature = 'nature',
  human = 'human',
  entertainment = 'entertainment',
  science = 'science',
  business = 'business',
  miscellaneous = 'miscellaneous',
}
