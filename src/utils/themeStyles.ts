/**
 * Class names for the three themes of the "Ink & signal" design.
 *   stage-black -> Ink       warm black, cream text, bright yellow-orange signal (#F59E0B)
 *   dark        -> Graphite  cool charcoal, same bright yellow-orange signal
 *   light       -> Paper     warm paper, ink text, warm deep amber signal (#D97706, keeps 4.5:1 contrast on paper)
 * Every class is written out in full so Tailwind can see it.
 */
export interface ThemeStyles {
  name: 'stage-black' | 'dark' | 'light';
  isLight: boolean;
  /** hex of the signal colour, used as the default chord colour */
  signalHex: string;

  // surfaces
  page: string;
  bar: string;
  subBar: string;
  rail: string;
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
  chip: string;
  chipOn: string;
  railItem: string;
  railItemOn: string;
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

const INK: ThemeStyles = {
  name: 'stage-black',
  isLight: false,
  signalHex: '#F59E0B',

  page: 'bg-[#0F0E0C] text-[#F3EEE3]',
  bar: 'bg-[#0F0E0C] border-[#2C2924] text-[#F3EEE3]',
  subBar: 'bg-[#0F0E0C] border-[#2C2924]',
  rail: 'bg-[#0F0E0C] border-[#2C2924]',
  dialog: 'bg-[#1A1815] border-[#2C2924] text-[#F3EEE3]',
  dialogBar: 'bg-[#141210] border-[#2C2924]',
  card: 'bg-[#141210] border-[#2C2924]',
  popover: 'bg-[#1A1815] border-[#3A362F] text-[#F3EEE3] shadow-black/80',
  popoverItem: 'hover:bg-[#262320]',
  popoverDivider: 'border-[#2C2924]',
  rowHover: 'hover:bg-[#1A1815]',
  divide: 'divide-[#2C2924]',

  textStrong: 'text-[#F3EEE3]',
  textMuted: 'text-[#A8A092]',
  accentText: 'text-[#F59E0B]',

  field:
    'bg-[#1A1815] border-[#3A362F] text-[#F3EEE3] placeholder:text-[#A8A092] focus:border-[#F59E0B]',
  ghostBtn: 'bg-transparent hover:bg-[#1A1815] text-[#F3EEE3] border-[#3A362F]',
  accentBtn: 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0F0E0C] font-bold shadow-xs',
  dangerBtn: 'bg-[#D6294A] hover:bg-[#E53A5A] text-white',
  iconBtn: 'text-[#A8A092] hover:text-[#F3EEE3] hover:bg-[#262320]',
  iconBtnDanger: 'text-[#A8A092] hover:text-[#FF6B81] hover:bg-[#D6294A]/15',
  segOn: 'bg-[#F59E0B] text-[#0F0E0C] border-[#F59E0B] font-bold',
  segOff: 'bg-transparent text-[#F3EEE3] border-[#3A362F] hover:border-[#6B655A]',
  chip: 'bg-transparent text-[#F3EEE3] border-[#3A362F] hover:border-[#6B655A]',
  chipOn: 'bg-[#F3EEE3] text-[#0F0E0C] border-[#F3EEE3]',
  railItem: 'text-[#A8A092] hover:text-[#F3EEE3] hover:bg-[#1A1815]',
  railItemOn: 'bg-[#1A1815] text-[#F3EEE3]',
  track: 'bg-[#2C2924]',
  accentColor: 'accent-[#F59E0B]',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B]',

  keyBadge: 'bg-[#F3EEE3] text-[#0F0E0C] border-transparent',
  accentSoft: 'bg-[#F59E0B]/12 text-[#FBBF24] border-[#F59E0B]/35',
  cardSelected: 'bg-[#1A1815] border-[#3A362F]',
  cardIdle: 'bg-transparent border-[#2C2924] hover:bg-[#141210] hover:border-[#3A362F]',
  numberOn: 'bg-[#F59E0B] text-[#0F0E0C] font-bold',
  numberOff: 'bg-[#2C2924] text-[#F3EEE3]'
};

const GRAPHITE: ThemeStyles = {
  name: 'dark',
  isLight: false,
  signalHex: '#F59E0B',

  page: 'bg-[#101418] text-[#E9EDF2]',
  bar: 'bg-[#101418] border-[#29313A] text-[#E9EDF2]',
  subBar: 'bg-[#101418] border-[#29313A]',
  rail: 'bg-[#101418] border-[#29313A]',
  dialog: 'bg-[#1A2027] border-[#29313A] text-[#E9EDF2]',
  dialogBar: 'bg-[#151A20] border-[#29313A]',
  card: 'bg-[#151A20] border-[#29313A]',
  popover: 'bg-[#1A2027] border-[#38424D] text-[#E9EDF2] shadow-black/70',
  popoverItem: 'hover:bg-[#232B34]',
  popoverDivider: 'border-[#29313A]',
  rowHover: 'hover:bg-[#1A2027]',
  divide: 'divide-[#29313A]',

  textStrong: 'text-[#E9EDF2]',
  textMuted: 'text-[#9BA5B2]',
  accentText: 'text-[#F59E0B]',

  field:
    'bg-[#1A2027] border-[#38424D] text-[#E9EDF2] placeholder:text-[#9BA5B2] focus:border-[#F59E0B]',
  ghostBtn: 'bg-transparent hover:bg-[#1A2027] text-[#E9EDF2] border-[#38424D]',
  accentBtn: 'bg-[#F59E0B] hover:bg-[#FBBF24] text-[#101418] font-bold shadow-xs',
  dangerBtn: 'bg-[#D6294A] hover:bg-[#E53A5A] text-white',
  iconBtn: 'text-[#9BA5B2] hover:text-[#E9EDF2] hover:bg-[#232B34]',
  iconBtnDanger: 'text-[#9BA5B2] hover:text-[#FF6B81] hover:bg-[#D6294A]/15',
  segOn: 'bg-[#F59E0B] text-[#101418] border-[#F59E0B] font-bold',
  segOff: 'bg-transparent text-[#E9EDF2] border-[#38424D] hover:border-[#5B6877]',
  chip: 'bg-transparent text-[#E9EDF2] border-[#38424D] hover:border-[#5B6877]',
  chipOn: 'bg-[#E9EDF2] text-[#101418] border-[#E9EDF2]',
  railItem: 'text-[#9BA5B2] hover:text-[#E9EDF2] hover:bg-[#1A2027]',
  railItemOn: 'bg-[#1A2027] text-[#E9EDF2]',
  track: 'bg-[#29313A]',
  accentColor: 'accent-[#F59E0B]',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B]',

  keyBadge: 'bg-[#E9EDF2] text-[#101418] border-transparent',
  accentSoft: 'bg-[#F59E0B]/12 text-[#FBBF24] border-[#F59E0B]/35',
  cardSelected: 'bg-[#1A2027] border-[#38424D]',
  cardIdle: 'bg-transparent border-[#29313A] hover:bg-[#151A20] hover:border-[#38424D]',
  numberOn: 'bg-[#F59E0B] text-[#101418] font-bold',
  numberOff: 'bg-[#29313A] text-[#E9EDF2]'
};

const PAPER: ThemeStyles = {
  name: 'light',
  isLight: true,
  signalHex: '#D97706',

  page: 'bg-[#F6F1E7] text-[#1A1815]',
  bar: 'bg-[#F6F1E7] border-[#DDD4C2] text-[#1A1815]',
  subBar: 'bg-[#F6F1E7] border-[#DDD4C2]',
  rail: 'bg-[#F6F1E7] border-[#DDD4C2]',
  dialog: 'bg-[#FBF8F1] border-[#DDD4C2] text-[#1A1815]',
  dialogBar: 'bg-[#EFE8DA] border-[#DDD4C2]',
  card: 'bg-[#EFE8DA] border-[#DDD4C2]',
  popover: 'bg-[#FBF8F1] border-[#CFC5B0] text-[#1A1815] shadow-[#1A1815]/15',
  popoverItem: 'hover:bg-[#EFE8DA]',
  popoverDivider: 'border-[#DDD4C2]',
  rowHover: 'hover:bg-[#EFE8DA]',
  divide: 'divide-[#DDD4C2]',

  textStrong: 'text-[#1A1815]',
  textMuted: 'text-[#6B6558]',
  accentText: 'text-[#D97706]',

  field:
    'bg-[#FBF8F1] border-[#CFC5B0] text-[#1A1815] placeholder:text-[#6B6558] focus:border-[#D97706]',
  ghostBtn: 'bg-transparent hover:bg-[#EFE8DA] text-[#1A1815] border-[#CFC5B0]',
  accentBtn: 'bg-[#D97706] hover:bg-[#B45309] text-white font-bold shadow-xs',
  dangerBtn: 'bg-[#B3203E] hover:bg-[#9A1A35] text-white',
  iconBtn: 'text-[#6B6558] hover:text-[#1A1815] hover:bg-[#E5DCC9]',
  iconBtnDanger: 'text-[#6B6558] hover:text-[#B3203E] hover:bg-[#B3203E]/10',
  segOn: 'bg-[#D97706] text-white border-[#D97706] font-bold',
  segOff: 'bg-transparent text-[#1A1815] border-[#CFC5B0] hover:border-[#A89F8B]',
  chip: 'bg-transparent text-[#1A1815] border-[#CFC5B0] hover:border-[#A89F8B]',
  chipOn: 'bg-[#1A1815] text-[#F6F1E7] border-[#1A1815]',
  railItem: 'text-[#6B6558] hover:text-[#1A1815] hover:bg-[#EFE8DA]',
  railItemOn: 'bg-[#E5DCC9] text-[#1A1815]',
  track: 'bg-[#DDD4C2]',
  accentColor: 'accent-[#D97706]',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D97706]',

  keyBadge: 'bg-[#1A1815] text-[#F6F1E7] border-transparent',
  accentSoft: 'bg-[#D97706]/10 text-[#B45309] border-[#D97706]/30',
  cardSelected: 'bg-[#FBF8F1] border-[#CFC5B0]',
  cardIdle: 'bg-transparent border-[#DDD4C2] hover:bg-[#EFE8DA] hover:border-[#CFC5B0]',
  numberOn: 'bg-[#D97706] text-white font-bold',
  numberOff: 'bg-[#E5DCC9] text-[#1A1815]'
};

/** Only an explicit "stage-black" or "light" differs from Graphite, as in the original screens. */
export function getThemeStyles(theme?: string): ThemeStyles {
  if (theme === 'light') return PAPER;
  if (theme === 'stage-black') return INK;
  return GRAPHITE;
}

export const SIGNAL_ON_DARK = '#F59E0B';
export const SIGNAL_ON_LIGHT = '#D97706';

/**
 * Chord colour to use when the theme changes: switching to Paper always takes the deeper signal
 * (the bright yellow-orange is too light on paper); switching to a dark theme replaces only the light-theme
 * defaults, so a colour the user picked on purpose is kept.
 */
export function chordColorForTheme(theme: 'stage-black' | 'dark' | 'light', current?: string): string {
  if (theme === 'light') return SIGNAL_ON_LIGHT;
  if (!current || current === SIGNAL_ON_LIGHT || current === '#1d4ed8' || current === '#FF5B3A' || current === '#C42E14') return SIGNAL_ON_DARK;
  return current;
}
