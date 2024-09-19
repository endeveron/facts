import { ObjectId } from 'mongoose';
import { TCategoryMap } from './fact.js';

type TUserAccount = {
  name: string;
  email: string;
  password: string;
  role: {
    index: number;
    name: string;
  };
};

type TFacts = {
  favorites: TFavorites;
  categoryRateMap: TCategoryMap;
  offsetMap: TCategoryMap;
};

export type TFavorites = string[];

export type TUser = {
  _id: ObjectId;
  account: TUserAccount;
  facts: TFacts;
};

export type TAuthData = {
  id: string;
  account: Omit<TUserAccount, 'password'>;
};
