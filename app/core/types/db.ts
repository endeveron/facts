import { TFactItem, TFavorites } from '@/core/types/fact';

type TFactItemCommon = {
  category: string;
  title: string;
};

export type TFactStorageTableItem = TFactItemCommon & {
  id: string;
};

export type TFactGroupTableItem = TFactItemCommon & {
  index: number;
  id: string;
};

export type TFavoritesTableItem = {
  id: string;
};

export type TFactCursor = {
  curFactIndex: number;
  curFactId: string;
  groupLength: number;
  leftInStorage: number;
  leftInGroup: number;
  storageOffset: number;
  done: boolean;
  category?: string;
};

export type TCursorTableItem = {
  id: number;
  cur_fact_index: number;
  cur_fact_id: string;
  group_length: number;
  left_in_storage: number;
  left_in_group: number;
  storage_offset: number;
  done: boolean;
  category?: string;
};

export type TUpdFavoritesConfig = {
  operation: 'add' | 'remove';
  factId: string;
};

export type TFactMapTableItem = {
  id: number;
  category: string;
};

export type TRateMapTableItem = TFactMapTableItem & {
  rate: number;
};

export type TFactOffsetTableItem = TFactMapTableItem & {
  offset: number;
};

export type TOffsetTableItem = {
  category: string;
  offset: number;
};

export type TCategoryRateTableItem = {
  category: string;
  rate: number;
};

export type TFactInitData = {
  facts: TFactItem[];
  favorites: TFavorites;
};

export type FactDataFromLocalDb = {
  cursor: TFactCursor;
  facts: TFactItem[];
  favorites: string[];
};

export type TAddFactsToGroupResult = {
  newCursor: TFactCursor;
  newGroup: TFactItem[];
} | null;

///////////////////////////////////////////////

// type TCategoryMapObjItem = {
//   category: string;
// };

// export type TRateMapItem = TCategoryMapObjItem & {
//   rate: number;
// };

// export type TFactOffsetItem = TCategoryMapObjItem & {
//   offset: number;
// };

// export type TNotificationSubscr = {
//   token: {
//     data: string;
//     iv: string;
//   } | null;
//   isActive: boolean;
//   schedule: string | null;
// } | null;
