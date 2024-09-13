const accentLight = '#4ca8f5';
const accentDark = '#1481db';

const iconLight = '#8e9ead';
const iconDark = '#5e6d7d';

export const colors = {
  light: {
    text: '#1c1e20',
    muted: '#90939c',
    accent: accentLight,
    success: '#39be44',
    error: '#f2135a',
    background: '#f0f0f2',
    input: '#fff',
    icon: iconLight,
    tabbar: '#f7f9fa',
    tabIconDefault: iconLight,
    tabIconSelected: accentLight,
  },
  dark: {
    text: '#ecedee',
    muted: '#7d8082',
    accent: accentDark,
    success: '#39be44',
    error: '#fa145d',
    background: '#151718',
    input: '#202224',
    icon: iconDark,
    tabbar: '#1e2021',
    tabIconDefault: iconDark,
    tabIconSelected: accentDark,
  },
};

export const factCategoryColorMap = new Map([
  ['science', { light: '#4338CA', dark: '#3730A3' }], // indigo 700 / 800
  ['nature', { light: '#15803D', dark: '#166534' }], // green 700 / 800
  ['human', { light: '#7E22CE', dark: '#581C87' }], // purple 700 / 900
  ['business', { light: '#0369A1', dark: '#075985' }], // sky 700 / 800
  ['entertainment', { light: '#C2410C', dark: '#9A3412' }], // orange 700 / 800
  ['miscellaneous', { light: '#BE123C', dark: '#9F1239' }], // rose 700 / 800
]);
