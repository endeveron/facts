export enum FactCategories {
  nature = 'nature',
  human = 'human',
  entertainment = 'entertainment',
  science = 'science',
  business = 'business',
  miscellaneous = 'miscellaneous',
}

// export type TFactCategory =
//   (typeof FactCategories)[keyof typeof FactCategories];

export type TFactData = {
  title: string;
  category: string;
};

export type TFactItem = TFactData & {
  index: number;
  id: string;
};

export type TFavorites = string[];

export type TCurrentItem = {
  id: string;
  index: number;
};

export type TCategoryMap = Map<string, number>;

export type TCategoryMapObj = {
  [key: string]: number;
};

export type TFactsState = {
  favorites: string[];
  categoryRateMap: TCategoryMapObj;
  offsetMap: TCategoryMapObj;
};

// export type TFactsStorageItems = TFactItem[];

// export type TFactsContext = {
//   totalItems: number | null;
//   currentItem: TCurrentItem | null;
//   notShownItemsNumber: number | null;
//   setTotalItems: (totalItems: number) => void;
//   setCurrentItem: (currentItem: TCurrentItem) => void;
//   setNotShownItemsNumber: (number: number) => void;
//   countNotShownFacts: (args: TcountNotShownFactsArgs) => void;
// };
