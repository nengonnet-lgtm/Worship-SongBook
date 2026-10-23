export type InstrumentType = 'guitar' | 'ukulele' | 'piano';
export type AppTheme = 'stage-black' | 'dark' | 'light';
export type ChordNotation = 'standard' | 'nashville' | 'solfege';

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  originalKey: string;
  tempo: number; // BPM
  timeSignature: string; // e.g. '4/4'
  capo: number; // 0 to 11
  duration: number; // Duration in seconds
  tags: string[];
  chordProContent: string;
  notes?: string;
  lastModified: number;
}

export interface Setlist {
  id: string;
  title: string;
  date: string;
  description?: string;
  songIds: string[];
  songKeys?: Record<string, string>; // Maps songId -> custom transposed key in this setlist
  songCapos?: Record<string, number>; // Maps songId -> custom capo in this setlist
  notes?: string;
  createdAt: number;
}

export interface ParsedLine {
  type: 'lyric' | 'directive' | 'section-header' | 'comment' | 'empty';
  raw: string;
  sectionTitle?: string;
  comment?: string;
  items?: {
    chord?: string;
    lyric: string;
  }[];
}

export interface ParsedSong {
  title: string;
  artist: string;
  key: string;
  tempo: number;
  timeSignature: string;
  capo: number;
  duration: number;
  sections: {
    title: string;
    lines: ParsedLine[];
  }[];
  allChords: string[];
}

export interface GuitarChordData {
  chord: string;
  frets: number[]; // e.g. [-1, 3, 2, 0, 1, 0] for C (-1 is mute X)
  fingers?: number[]; // e.g. [0, 3, 2, 0, 1, 0]
  baseFret?: number;
  barres?: number[];
}

export interface UkuleleChordData {
  chord: string;
  frets: number[]; // e.g. [0, 0, 0, 3] for C
  fingers?: number[];
  baseFret?: number;
}

export interface AppSettings {
  theme: AppTheme;
  fontSize: number; // 14 to 28
  columns: 1 | 2;
  chordsColor: string;
  instrument: InstrumentType;
  showChords: boolean;
  chordNotation: ChordNotation;
  autoScrollSpeed: number; // 1 to 10
  autoScrollCountdown: number; // seconds (0 to 5)
  showChordDiagrams: boolean;
}
