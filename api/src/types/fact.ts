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
