import { GuitarChordData, UkuleleChordData } from '../types/song';

// Guitar chords database (standard tuning E-A-D-G-B-E from string 6 to 1)
// -1 means mute (X), 0 means open string (O), 1..n is fret
export const GUITAR_CHORDS: Record<string, GuitarChordData> = {
  // Major
  'C': { chord: 'C', frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  'D': { chord: 'D', frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
  'E': { chord: 'E', frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0] },
  'F': { chord: 'F', frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barres: [1] },
  'G': { chord: 'G', frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3] },
  'A': { chord: 'A', frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'B': { chord: 'B', frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barres: [2] },

  // Minor
  'Am': { chord: 'Am', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0] },
  'Bm': { chord: 'Bm', frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barres: [2] },
  'Cm': { chord: 'Cm', frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barres: [3] },
  'Dm': { chord: 'Dm', frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1] },
  'Em': { chord: 'Em', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
  'Fm': { chord: 'Fm', frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barres: [1] },
  'Gm': { chord: 'Gm', frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barres: [3] },

  // 7ths
  'C7': { chord: 'C7', frets: [-1, 3, 2, 3, 1, 0], fingers: [0, 3, 2, 4, 1, 0] },
  'D7': { chord: 'D7', frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3] },
  'E7': { chord: 'E7', frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0] },
  'F7': { chord: 'F7', frets: [1, 3, 1, 2, 1, 1], barres: [1] },
  'G7': { chord: 'G7', frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1] },
  'A7': { chord: 'A7', frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0] },
  'B7': { chord: 'B7', frets: [-1, 2, 1, 2, 0, 2], fingers: [0, 2, 1, 3, 0, 4] },

  // Minor 7ths
  'Am7': { chord: 'Am7', frets: [-1, 0, 2, 0, 1, 0], fingers: [0, 0, 2, 0, 1, 0] },
  'Bm7': { chord: 'Bm7', frets: [-1, 2, 0, 2, 0, 2], fingers: [0, 1, 0, 2, 0, 3] },
  'Dm7': { chord: 'Dm7', frets: [-1, -1, 0, 2, 1, 1], fingers: [0, 0, 0, 2, 1, 1] },
  'Em7': { chord: 'Em7', frets: [0, 2, 0, 0, 0, 0], fingers: [0, 1, 0, 0, 0, 0] },
  'F#m': { chord: 'F#m', frets: [2, 4, 4, 2, 2, 2], fingers: [1, 3, 4, 1, 1, 1], barres: [2] },
  'F#m7': { chord: 'F#m7', frets: [2, 4, 2, 2, 2, 2], barres: [2] },
  'C#m': { chord: 'C#m', frets: [-1, 4, 6, 6, 5, 4], barres: [4] },
  'G#m': { chord: 'G#m', frets: [4, 6, 6, 4, 4, 4], barres: [4] },

  // Major 7ths
  'Cmaj7': { chord: 'Cmaj7', frets: [-1, 3, 2, 0, 0, 0], fingers: [0, 3, 2, 0, 0, 0] },
  'Dmaj7': { chord: 'Dmaj7', frets: [-1, -1, 0, 2, 2, 2], fingers: [0, 0, 0, 1, 2, 3] },
  'Ebmaj7': { chord: 'Ebmaj7', frets: [-1, -1, 1, 3, 3, 3], fingers: [0, 0, 1, 2, 3, 4], baseFret: 1 },
  'Fmaj7': { chord: 'Fmaj7', frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0] },
  'Gmaj7': { chord: 'Gmaj7', frets: [3, 2, 0, 0, 0, 2], fingers: [2, 1, 0, 0, 0, 3] },
  'Amaj7': { chord: 'Amaj7', frets: [-1, 0, 2, 1, 2, 0], fingers: [0, 0, 2, 1, 3, 0] },
  'Bbmaj7': { chord: 'Bbmaj7', frets: [-1, 1, 3, 2, 3, 1], fingers: [0, 1, 3, 2, 4, 1], barres: [1] },

  // Sus & Add
  'Csus4': { chord: 'Csus4', frets: [-1, 3, 3, 0, 1, 1], fingers: [0, 3, 4, 0, 1, 1] },
  'Dsus4': { chord: 'Dsus4', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 4] },
  'Dsus': { chord: 'Dsus', frets: [-1, -1, 0, 2, 3, 3], fingers: [0, 0, 0, 1, 2, 4] },
  'Gsus4': { chord: 'Gsus4', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  'Gsus': { chord: 'Gsus', frets: [3, 3, 0, 0, 1, 3], fingers: [2, 3, 0, 0, 1, 4] },
  'Asus4': { chord: 'Asus4', frets: [-1, 0, 2, 2, 3, 0], fingers: [0, 0, 1, 2, 3, 0] },
  'Cadd9': { chord: 'Cadd9', frets: [-1, 3, 2, 0, 3, 3], fingers: [0, 2, 1, 0, 3, 4] },
  'Dsus2': { chord: 'Dsus2', frets: [-1, -1, 0, 2, 3, 0], fingers: [0, 0, 0, 1, 3, 0] },
  'Asus2': { chord: 'Asus2', frets: [-1, 0, 2, 2, 0, 0], fingers: [0, 0, 1, 2, 0, 0] },

  // Flats / Sharps Common
  'Bb': { chord: 'Bb', frets: [-1, 1, 3, 3, 3, 1], barres: [1] },
  'Bbm': { chord: 'Bbm', frets: [-1, 1, 3, 3, 2, 1], barres: [1] },
  'Cm7': { chord: 'Cm7', frets: [-1, 3, 5, 3, 4, 3], barres: [3] },
  'Eb': { chord: 'Eb', frets: [-1, -1, 1, 3, 4, 3], fingers: [0, 0, 1, 2, 4, 3] },
  'Eb7': { chord: 'Eb7', frets: [-1, -1, 1, 3, 2, 3], fingers: [0, 0, 1, 3, 2, 4] },
  'Ab': { chord: 'Ab', frets: [4, 6, 6, 5, 4, 4], barres: [4] },
  'Db': { chord: 'Db', frets: [-1, 4, 6, 6, 6, 4], barres: [4] },
  'F#': { chord: 'F#', frets: [2, 4, 4, 3, 2, 2], barres: [2] }
};

// Ukulele chords database (G-C-E-A tuning)
export const UKULELE_CHORDS: Record<string, UkuleleChordData> = {
  'C': { chord: 'C', frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
  'D': { chord: 'D', frets: [2, 2, 2, 0], fingers: [1, 2, 3, 0] },
  'E': { chord: 'E', frets: [4, 4, 4, 2], baseFret: 1 },
  'F': { chord: 'F', frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
  'G': { chord: 'G', frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
  'A': { chord: 'A', frets: [2, 1, 0, 0], fingers: [2, 1, 0, 0] },
  'B': { chord: 'B', frets: [4, 3, 2, 2], baseFret: 1 },
  'Am': { chord: 'Am', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },
  'Bm': { chord: 'Bm', frets: [4, 2, 2, 2], baseFret: 1 },
  'Cm': { chord: 'Cm', frets: [0, 3, 3, 3] },
  'Dm': { chord: 'Dm', frets: [2, 2, 1, 0], fingers: [2, 3, 1, 0] },
  'Em': { chord: 'Em', frets: [0, 4, 3, 2], fingers: [0, 3, 2, 1] },
  'Fm': { chord: 'Fm', frets: [1, 0, 1, 3] },
  'Gm': { chord: 'Gm', frets: [0, 2, 3, 1], fingers: [0, 2, 3, 1] },
  'C7': { chord: 'C7', frets: [0, 0, 0, 1], fingers: [0, 0, 0, 1] },
  'G7': { chord: 'G7', frets: [0, 2, 1, 2], fingers: [0, 2, 1, 3] },
  'F#m': { chord: 'F#m', frets: [2, 1, 2, 0] },
  'Bb': { chord: 'Bb', frets: [3, 2, 1, 1] },
  'Cmaj7': { chord: 'Cmaj7', frets: [0, 0, 0, 2], fingers: [0, 0, 0, 1] },
  'Gmaj7': { chord: 'Gmaj7', frets: [0, 2, 2, 2], fingers: [0, 1, 2, 3] },
  'Dmaj7': { chord: 'Dmaj7', frets: [2, 1, 2, 0], fingers: [2, 1, 3, 0] },
  'Amaj7': { chord: 'Amaj7', frets: [1, 1, 0, 0], fingers: [1, 2, 0, 0] },
  'Fmaj7': { chord: 'Fmaj7', frets: [2, 4, 1, 0], fingers: [2, 4, 1, 0] },
  'Eb': { chord: 'Eb', frets: [0, 3, 3, 1], fingers: [0, 2, 3, 1] },
  'Ebmaj7': { chord: 'Ebmaj7', frets: [3, 3, 3, 5], fingers: [1, 1, 1, 3] },
  'Bbmaj7': { chord: 'Bbmaj7', frets: [3, 2, 1, 0], fingers: [3, 2, 1, 0] }
};

// Piano chord notes mapping (Semitone offsets from C4 = 60)
// For visual rendering and synthesis
const NOTE_BASE_MIDI: Record<string, number> = {
  'C': 60, 'C#': 61, 'Db': 61, 'D': 62, 'D#': 63, 'Eb': 63,
  'E': 64, 'F': 65, 'F#': 66, 'Gb': 66, 'G': 67, 'G#': 68,
  'Ab': 68, 'A': 69, 'A#': 70, 'Bb': 70, 'B': 71
};

export function getChordMidiNotes(chordStr: string): number[] {
  // Simple heuristic for notes in chord
  const match = chordStr.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return [60, 64, 67]; // default C major

  const root = match[1];
  const quality = match[2] || '';
  const base = NOTE_BASE_MIDI[root] || 60;

  if (quality.startsWith('m7') || quality.startsWith('min7')) {
    return [base, base + 3, base + 7, base + 10];
  }
  if (quality.startsWith('maj7')) {
    return [base, base + 4, base + 7, base + 11];
  }
  if (quality.startsWith('7')) {
    return [base, base + 4, base + 7, base + 10];
  }
  if (quality.startsWith('m') || quality.startsWith('min')) {
    return [base, base + 3, base + 7];
  }
  if (quality.startsWith('sus4')) {
    return [base, base + 5, base + 7];
  }
  if (quality.startsWith('sus2')) {
    return [base, base + 2, base + 7];
  }
  if (quality.startsWith('add9')) {
    return [base, base + 4, base + 7, base + 14];
  }
  if (quality.startsWith('dim')) {
    return [base, base + 3, base + 6];
  }
  // Default Major triad
  return [base, base + 4, base + 7];
}

// Convert MIDI number to frequency (Hz)
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// Web Audio API Polyphonic Pluck Synthesizer for chord preview
let audioCtx: AudioContext | null = null;

export function playChordSound(chordStr: string) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const notes = getChordMidiNotes(chordStr);
    const now = audioCtx.currentTime;

    // Strum delay simulation (each string strummed ~25ms apart)
    notes.forEach((midi, index) => {
      if (!audioCtx) return;
      const freq = midiToFreq(midi);
      const startTime = now + index * 0.035;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Warm acoustic triangle / sine blend
      osc.type = index % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Pluck envelope: sharp attack, smooth exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  } catch (err) {
    console.warn('AudioContext playback error', err);
  }
}
