import { ObjectId } from 'mongoose';

export type TFact = {
  _id: ObjectId;
  title: string;
  details: string;
  category: string;
  source: string;
};

export type TFactItem = Omit<TFact, '_id'> & {
  id: string;
};
