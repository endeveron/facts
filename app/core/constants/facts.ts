const FACTS_LENGTH_TO_FETCH_NEW_ITEMS = 2;

const factCategories = [
  'nature',
  'human',
  'science',
  'business',
  'entertainment',
  'miscellaneous',
];

export const factActions = [
  {
    buttonTitle: 'Do not open app',
    identifier: 'first',
    options: {
      opensAppToForeground: false,
    },
  },
  {
    buttonTitle: 'Open app',
    identifier: 'second',
    options: {
      opensAppToForeground: true,
    },
  },
];

export { FACTS_LENGTH_TO_FETCH_NEW_ITEMS, factCategories };
