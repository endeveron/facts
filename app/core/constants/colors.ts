export const colors = {
  light: {
    text: '#030712', // gray-950
    muted: '#6B7280', // gray-500
    accent: '#38BDF8', // sky-400
    success: '#16A34A', // green-600
    error: '#E11D48', // rose-600
    background: '#F3F4F6', // gray-100
    card: '#FFF', // white
    input: '#FFF', // white
    icon: '#9CA3AF', // gray-400
  },
  dark: {
    text: '#F9FAFB', // gray-50
    muted: '#6B7280', // gray-500
    accent: '#0284C7', // sky-600
    success: '#16A34A', // green-600
    error: '#F43F5E', // rose-500
    background: '#030712', // gray-950
    card: '#111827', // gray-900
    input: '#111827', // gray-900
    icon: '#4B5563', // gray-600
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
