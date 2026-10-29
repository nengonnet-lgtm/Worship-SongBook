/**
 * One place for the class names of the three themes (OLED black, dark slate, light),
 * so components stop repeating `isLight ? … : isDarkSlate ? … : …` for every element.
 * Every class is written out in full so Tailwind can see it.
 */
export interface ThemeStyles {
  name: 'stage-black' | 'dark' | 'light';
  isLight: boolean;

  // surfaces
  page: string;
  bar: string;
  subBar: string;
  dialog: string;
  dialogBar: string;
  card: string;
  popover: string;
  popoverItem: string;
  popoverDivider: string;
  rowHover: string;
  divide: string;

  // text
  textStrong: string;
  textMuted: string;
  accentText: string;

  // controls
  field: string;
  ghostBtn: string;
  accentBtn: string;
  dangerBtn: string;
  iconBtn: string;
  iconBtnDanger: string;
  segOn: string;
  segOff: string;
  track: string;
  accentColor: string;
  focus: string;
  focusInset: string;

  // badges / cards
  keyBadge: string;
  accentSoft: string;
  cardSelected: string;
  cardIdle: string;
  numberOn: string;
  numberOff: string;
}

const STAGE: ThemeStyles = {
  name: 'stage-black',
  isLight: false,

  page: 'bg-black text-neutral-100',
  bar: 'bg-black border-neutral-800 text-neutral-100',
  subBar: 'bg-neutral-950 border-neutral-800',
  dialog: 'bg-neutral-900 border-neutral-800 text-neutral-100',
  dialogBar: 'bg-neutral-950/80 border-neutral-800',
  card: 'bg-neutral-950/50 border-neutral-800',
  popover: 'bg-neutral-900 border-neutral-700 text-neutral-100 shadow-black/80',
  popoverItem: 'hover:bg-neutral-800',
  popoverDivider: 'border-neutral-800',
  rowHover: 'hover:bg-neutral-900/80',
  divide: 'divide-neutral-800/80',

  textStrong: 'text-neutral-100',
  textMuted: 'text-neutral-400',
  accentText: 'text-amber-400',

  field:
    'bg-neutral-900 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-amber-400',
  ghostBtn: 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-700',
  accentBtn: 'bg-amber-400 hover:bg-amber-300 text-neutral-950',
  dangerBtn: 'bg-red-600 hover:bg-red-500 text-white',
  iconBtn: 'text-neutral-400 hover:text-white hover:bg-neutral-800',
  iconBtnDanger: 'text-neutral-500 hover:text-red-400 hover:bg-red-500/10',
  segOn: 'bg-amber-400 text-neutral-950 border-amber-400',
  segOff: 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:border-neutral-500',
  track: 'bg-neutral-700',
  accentColor: 'accent-amber-400',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400',

  keyBadge: 'bg-neutral-900 text-amber-400 border-neutral-700',
  accentSoft: 'bg-amber-400/10 text-amber-300 border-amber-400/30',
  cardSelected: 'bg-neutral-900 border-amber-400 ring-1 ring-amber-400/30',
  cardIdle: 'bg-neutral-900/40 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700',
  numberOn: 'bg-amber-400 text-neutral-950',
  numberOff: 'bg-neutral-800 text-neutral-400'
};

const SLATE: ThemeStyles = {
  name: 'dark',
  isLight: false,

  page: 'bg-[#0b1322] text-slate-100',
  bar: 'bg-[#182338] border-slate-700/80 text-slate-100',
  subBar: 'bg-[#0f172a] border-slate-800',
  dialog: 'bg-[#111c30] border-slate-700/80 text-slate-100',
  dialogBar: 'bg-[#0b1424] border-slate-700/80',
  card: 'bg-[#0b1424]/60 border-slate-800',
  popover: 'bg-[#182338] border-slate-600 text-slate-100 shadow-black/60',
  popoverItem: 'hover:bg-slate-700',
  popoverDivider: 'border-slate-700',
  rowHover: 'hover:bg-[#182338]/80',
  divide: 'divide-slate-800',

  textStrong: 'text-slate-100',
  textMuted: 'text-slate-400',
  accentText: 'text-sky-400',

  field:
    'bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-400 focus:border-sky-400',
  ghostBtn: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700',
  accentBtn: 'bg-sky-400 hover:bg-sky-300 text-slate-950',
  dangerBtn: 'bg-red-600 hover:bg-red-500 text-white',
  iconBtn: 'text-slate-400 hover:text-white hover:bg-slate-700',
  iconBtnDanger: 'text-slate-500 hover:text-red-400 hover:bg-red-500/10',
  segOn: 'bg-sky-400 text-slate-950 border-sky-400',
  segOff: 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500',
  track: 'bg-slate-700',
  accentColor: 'accent-sky-400',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400',

  keyBadge: 'bg-slate-900 text-sky-400 border-slate-700',
  accentSoft: 'bg-sky-400/10 text-sky-300 border-sky-400/30',
  cardSelected: 'bg-[#1e293b] border-sky-400 ring-1 ring-sky-400/40',
  cardIdle: 'bg-[#182338]/60 border-slate-700/70 hover:bg-[#182338] hover:border-slate-600',
  numberOn: 'bg-sky-400 text-slate-950',
  numberOff: 'bg-slate-800 text-slate-400'
};

const LIGHT: ThemeStyles = {
  name: 'light',
  isLight: true,

  page: 'bg-white text-slate-900',
  bar: 'bg-white border-blue-100 text-slate-900',
  subBar: 'bg-sky-50/60 border-blue-100',
  dialog: 'bg-white border-slate-200 text-slate-900',
  dialogBar: 'bg-slate-50 border-slate-200',
  card: 'bg-slate-50 border-slate-200',
  popover: 'bg-white border-slate-200 text-slate-800 shadow-slate-900/15',
  popoverItem: 'hover:bg-blue-50',
  popoverDivider: 'border-slate-100',
  rowHover: 'hover:bg-blue-50/60',
  divide: 'divide-blue-100',

  textStrong: 'text-slate-900',
  textMuted: 'text-slate-500',
  accentText: 'text-blue-700',

  field:
    'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-600',
  ghostBtn: 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300',
  accentBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
  dangerBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
  iconBtn: 'text-slate-500 hover:text-blue-700 hover:bg-blue-50',
  iconBtnDanger: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50',
  segOn: 'bg-blue-600 text-white border-blue-600',
  segOff: 'bg-white text-slate-700 border-slate-300 hover:border-slate-400',
  track: 'bg-slate-200',
  accentColor: 'accent-blue-600',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600',

  keyBadge: 'bg-sky-50 text-blue-700 border-blue-200',
  accentSoft: 'bg-blue-50 text-blue-700 border-blue-200',
  cardSelected: 'bg-sky-50/90 border-blue-500 ring-1 ring-blue-500/30',
  cardIdle: 'bg-white border-blue-100 hover:bg-sky-50/50 hover:border-blue-200',
  numberOn: 'bg-blue-600 text-white',
  numberOff: 'bg-sky-50 text-blue-800'
};

/** Same fallback the original screens used: only an explicit "stage-black" or "light" differs from slate. */
export function getThemeStyles(theme?: string): ThemeStyles {
  if (theme === 'light') return LIGHT;
  if (theme === 'stage-black') return STAGE;
  return SLATE;
}
