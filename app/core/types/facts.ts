export type TFactData = {
  title: string;
  category: string;
};

export type TFactItem = TFactData & {
  id: string;
};

export type TFavoriteArr = string[];

export type TCurrentItem = {
  id: string;
  index: number;
};

export type TUpdateListDataArgs = {
  totalItems?: number;
  currentItem?: TCurrentItem;
};

export type TcountNotShownFactsArgs = {
  factsLength: number | null;
  current: TCurrentItem | null;
  notShownNum: number | null;
  isRefetch?: boolean;
};

export type TFactsStorageState = {
  facts: TFactItem[];
  liked: TFavoriteArr;
  current: TCurrentItem;
  notShownNum: number;
};

export type TFactsStorageItems = TFactItem[];

export type TFactsContext = {
  totalItems: number | null;
  currentItem: TCurrentItem | null;
  notShownItemsNumber: number | null;
  setTotalItems: (totalItems: number) => void;
  setCurrentItem: (currentItem: TCurrentItem) => void;
  setNotShownItemsNumber: (number: number) => void;
  countNotShownFacts: (args: TcountNotShownFactsArgs) => void;
};

export enum Categories {
  nature = 'nature',
  human = 'human',
  entertainment = 'entertainment',
  science = 'science',
  business = 'business',
  miscellaneous = 'miscellaneous',
}
