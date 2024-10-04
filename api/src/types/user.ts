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

export type TNotificationsSubscription = {
  token: {
    iv: string;
    data: string;
  } | null;
  isActive: boolean;
  schedule: string | null;
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
