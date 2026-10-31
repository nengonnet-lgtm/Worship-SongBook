/**
 * Class names for the three themes. Each one has its own surface colour AND its own signal colour,
 * so they are told apart at a glance, while all of them stay low-glare and clean:
 *   stage-black -> Ink       warm near-black,   cream text,  amber signal      (#F59E0B)  - stage / dark rooms
 *   dark        -> Midnight  deep navy,         ice text,    sky-blue signal   (#38BDF8)  - calm, cool
 *   light       -> Paper     soft warm white,   ink text,    deep amber signal (#B45309)  - daylight / print-like
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

const MIDNIGHT: ThemeStyles = {
  name: 'dark',
  isLight: false,
  signalHex: '#38BDF8',

  page: 'bg-[#0D1526] text-[#E8EEF8]',
  bar: 'bg-[#0D1526] border-[#22304A] text-[#E8EEF8]',
  subBar: 'bg-[#0D1526] border-[#22304A]',
  rail: 'bg-[#0D1526] border-[#22304A]',
  dialog: 'bg-[#16223B] border-[#2C3D5E] text-[#E8EEF8]',
  dialogBar: 'bg-[#111B30] border-[#2C3D5E]',
  card: 'bg-[#121C33] border-[#22304A]',
  popover: 'bg-[#16223B] border-[#2C3D5E] text-[#E8EEF8] shadow-black/60',
  popoverItem: 'hover:bg-[#1D2B48]',
  popoverDivider: 'border-[#22304A]',
  rowHover: 'hover:bg-[#16223B]',
  divide: 'divide-[#22304A]',

  textStrong: 'text-[#E8EEF8]',
  textMuted: 'text-[#93A3BF]',
  accentText: 'text-[#38BDF8]',

  field:
    'bg-[#16223B] border-[#2C3D5E] text-[#E8EEF8] placeholder:text-[#93A3BF] focus:border-[#38BDF8]',
  ghostBtn: 'bg-transparent hover:bg-[#16223B] text-[#E8EEF8] border-[#2C3D5E]',
  accentBtn: 'bg-[#38BDF8] hover:bg-[#7DD3FC] text-[#06121F] font-bold shadow-xs',
  dangerBtn: 'bg-[#D6294A] hover:bg-[#E53A5A] text-white',
  iconBtn: 'text-[#93A3BF] hover:text-[#E8EEF8] hover:bg-[#1D2B48]',
  iconBtnDanger: 'text-[#93A3BF] hover:text-[#FF6B81] hover:bg-[#D6294A]/15',
  segOn: 'bg-[#38BDF8] text-[#06121F] border-[#38BDF8] font-bold',
  segOff: 'bg-transparent text-[#E8EEF8] border-[#2C3D5E] hover:border-[#4A5F88]',
  chip: 'bg-transparent text-[#E8EEF8] border-[#2C3D5E] hover:border-[#4A5F88]',
  chipOn: 'bg-[#E8EEF8] text-[#0D1526] border-[#E8EEF8]',
  railItem: 'text-[#93A3BF] hover:text-[#E8EEF8] hover:bg-[#16223B]',
  railItemOn: 'bg-[#16223B] text-[#E8EEF8]',
  track: 'bg-[#22304A]',
  accentColor: 'accent-[#38BDF8]',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#38BDF8]',

  keyBadge: 'bg-[#E8EEF8] text-[#0D1526] border-transparent',
  accentSoft: 'bg-[#38BDF8]/12 text-[#7DD3FC] border-[#38BDF8]/35',
  cardSelected: 'bg-[#16223B] border-[#2C3D5E]',
  cardIdle: 'bg-transparent border-[#22304A] hover:bg-[#121C33] hover:border-[#2C3D5E]',
  numberOn: 'bg-[#38BDF8] text-[#06121F] font-bold',
  numberOff: 'bg-[#22304A] text-[#E8EEF8]'
};

const PAPER: ThemeStyles = {
  name: 'light',
  isLight: true,
  signalHex: '#B45309',

  page: 'bg-[#F8F6F1] text-[#1F1C17]',
  bar: 'bg-[#F8F6F1] border-[#E6E0D4] text-[#1F1C17]',
  subBar: 'bg-[#F8F6F1] border-[#E6E0D4]',
  rail: 'bg-[#F8F6F1] border-[#E6E0D4]',
  dialog: 'bg-[#FFFFFF] border-[#E6E0D4] text-[#1F1C17]',
  dialogBar: 'bg-[#F3EFE6] border-[#E6E0D4]',
  card: 'bg-[#FFFFFF] border-[#E6E0D4]',
  popover: 'bg-[#FFFFFF] border-[#DAD3C4] text-[#1F1C17] shadow-[#1F1C17]/15',
  popoverItem: 'hover:bg-[#F0ECE2]',
  popoverDivider: 'border-[#E6E0D4]',
  rowHover: 'hover:bg-[#F0ECE2]',
  divide: 'divide-[#E6E0D4]',

  textStrong: 'text-[#1F1C17]',
  textMuted: 'text-[#6A6458]',
  accentText: 'text-[#B45309]',

  field:
    'bg-[#FFFFFF] border-[#D8D1C2] text-[#1F1C17] placeholder:text-[#6A6458] focus:border-[#B45309]',
  ghostBtn: 'bg-transparent hover:bg-[#F0ECE2] text-[#1F1C17] border-[#D8D1C2]',
  accentBtn: 'bg-[#B45309] hover:bg-[#92400E] text-white font-bold shadow-xs',
  dangerBtn: 'bg-[#B3203E] hover:bg-[#9A1A35] text-white',
  iconBtn: 'text-[#6A6458] hover:text-[#1F1C17] hover:bg-[#EDE8DC]',
  iconBtnDanger: 'text-[#6A6458] hover:text-[#B3203E] hover:bg-[#B3203E]/10',
  segOn: 'bg-[#B45309] text-white border-[#B45309] font-bold',
  segOff: 'bg-transparent text-[#1F1C17] border-[#D8D1C2] hover:border-[#B5AC98]',
  chip: 'bg-transparent text-[#1F1C17] border-[#D8D1C2] hover:border-[#B5AC98]',
  chipOn: 'bg-[#1F1C17] text-[#F8F6F1] border-[#1F1C17]',
  railItem: 'text-[#6A6458] hover:text-[#1F1C17] hover:bg-[#F0ECE2]',
  railItemOn: 'bg-[#EDE8DC] text-[#1F1C17]',
  track: 'bg-[#E6E0D4]',
  accentColor: 'accent-[#B45309]',
  focus: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]',
  focusInset:
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B45309]',

  keyBadge: 'bg-[#1F1C17] text-[#F8F6F1] border-transparent',
  accentSoft: 'bg-[#B45309]/10 text-[#92400E] border-[#B45309]/30',
  cardSelected: 'bg-[#FFFFFF] border-[#D8D1C2] shadow-xs',
  cardIdle: 'bg-transparent border-[#E6E0D4] hover:bg-[#F0ECE2] hover:border-[#D8D1C2]',
  numberOn: 'bg-[#B45309] text-white font-bold',
  numberOff: 'bg-[#EDE8DC] text-[#1F1C17]'
};

/** Only an explicit "stage-black" or "light" differs from Midnight (the "dark" value). */
export function getThemeStyles(theme?: string): ThemeStyles {
  if (theme === 'light') return PAPER;
  if (theme === 'stage-black') return INK;
  return MIDNIGHT;
}

export const SIGNAL_ON_DARK = '#F59E0B'; // Ink
export const SIGNAL_ON_MIDNIGHT = '#38BDF8';
export const SIGNAL_ON_LIGHT = '#B45309'; // Paper (deep enough to keep 5:1 contrast on paper)

// Chord colours that are just "a theme's default", as opposed to one the user picked on purpose
const THEME_DEFAULT_SIGNALS = ['#f59e0b', '#d97706', '#b45309', '#38bdf8', '#1d4ed8', '#ff5b3a', '#c42e14', '#e8421f'];

/**
 * Chord colour to use when the theme changes: switching to Paper always takes its deep signal (bright colours
 * are too light on paper); switching to Ink or Midnight replaces only another theme's default signal, so a
 * colour the user picked on purpose is kept.
 */
export function chordColorForTheme(theme: 'stage-black' | 'dark' | 'light', current?: string): string {
  if (theme === 'light') return SIGNAL_ON_LIGHT;
  const target = theme === 'dark' ? SIGNAL_ON_MIDNIGHT : SIGNAL_ON_DARK;
  if (!current || THEME_DEFAULT_SIGNALS.includes(current.toLowerCase())) return target;
  return current;
}
