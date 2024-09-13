import { ObjectId } from 'mongoose';

type TUserAccount = {
  name: string;
  email: string;
  password: string;
  role: {
    index: number;
    name: string;
  };
};

export type TFavoriteArr = string[];

type TFacts = {
  liked: TFavoriteArr;
  offset: number;
};

export type TUser = {
  _id: ObjectId;
  account: TUserAccount;
  facts: TFacts;
};

export type TAuthData = {
  id: string;
  account: Omit<TUserAccount, 'password'>;
};
