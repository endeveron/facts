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

type TNotificationsSubscription = {
  token: {
    iv: string;
    data: string;
  } | null;
  isActive: boolean;
};

export type TEncryptedData = { iv: string; data: string };

export type TFavorites = string[];

export type TUser = {
  _id: ObjectId;
  account: TUserAccount;
  facts: TFacts;
  notificationsSubscr: TNotificationsSubscription | null;
};

export type TAuthData = {
  id: string;
  account: Omit<TUserAccount, 'password'>;
};
