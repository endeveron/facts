export const colors = {
  light: {
    text: '#020617', // slate-950
    muted: '#94A3B8', // slate-400
    accent: '#38BDF8', // sky-400
    success: '#16A34A', // green-600
    error: '#E11D48', // rose-600
    background: '#E2E8F0', // slate-200
    card: '#F8FAFC', // slate-50
    border: '#fcfcfc', // ~ white
    input: '#F8FAFC', // slate-50
    icon: '#abb8c9', // ~ slate-300
  },
  dark: {
    text: '#F8FAFC', // slate-50
    muted: '#64748B', // slate-500
    accent: '#0284C7', // sky-600
    success: '#16A34A', // green-600
    error: '#F43F5E', // rose-500
    background: '#000', // black
    card: '#000', // black
    border: '#192230', // ~ slate-800
    input: '#000', // black
    icon: '#334155', // slate-700
  },
};

export const factCategoryColorMap = new Map([
  ['science', { light: '#4437db', dark: '#312a9c' }], // indigo 600~700 / 800~900
  ['nature', { light: '#0b8038', dark: '#156635' }], // green 600~700 / 800~900
  ['human', { light: '#7f18d9', dark: '#5e1994' }], // purple 600~700 / 800~900
  ['business', { light: '#027cbf', dark: '#024d75' }], // sky 600~700 / 800~900
  ['entertainment', { light: '#c94906', dark: '#a13700' }], // orange 600~700 / 700~800
  ['miscellaneous', { light: '#c7163d', dark: '#96082f' }], // rose ~600 / 800~900
]);
