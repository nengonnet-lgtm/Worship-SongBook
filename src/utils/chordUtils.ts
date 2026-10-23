export const KEYS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
];

export const NOTE_TO_INDEX: Record<string, number> = {
  'C': 0, 'B#': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3,
  'E': 4, 'FB': 4, 'F': 5, 'E#': 5, 'F#': 6, 'GB': 6, 'G': 7,
  'G#': 8, 'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11, 'CB': 11,
};

// ตารางการสะกดชื่อโน้ตตามคีย์ดนตรีสากล (Enharmonic spelling per Key)
// แก้ปัญหาคีย์ F คอร์ด A# แสดงเป็น Bb, หรือคีย์ D คอร์ด Gbm แสดงเป็น F#m เป็นต้น
export const KEY_ENHARMONICS: Record<string, string[]> = {
  // Flat major keys (คีย์เมเจอร์ที่มี b)
  'F':   ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Bb':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Eb':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Ab':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Db':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Gb':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

  // Flat minor keys (คีย์ไมเนอร์ที่มี b)
  'Dm':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Gm':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Cm':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Fm':  ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Bbm': ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],

  // Sharp major keys (คีย์เมเจอร์ที่มี #)
  'G':   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
  'D':   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
  'A':   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'E':   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'B':   ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'F#':  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'C#':  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

  // Sharp minor keys (คีย์ไมเนอร์ที่มี #)
  'Em':  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
  'Bm':  ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'F#m': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'C#m': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'G#m': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],

  // Neutral keys (ไม่มีชาร์ป/แฟลต)
  'C':   ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'],
  'Am':  ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'],
};

// ดึงสเกลที่เหมาะสมสำหรับคีย์ที่ระบุ
export function getScaleForKey(key?: string): string[] {
  if (!key) return KEY_ENHARMONICS['C'];
  const clean = key.trim();
  const titleKey = clean.charAt(0).toUpperCase() + clean.slice(1);
  if (KEY_ENHARMONICS[titleKey]) return KEY_ENHARMONICS[titleKey];
  const root = titleKey.replace(/m$/, '');
  if (KEY_ENHARMONICS[root]) return KEY_ENHARMONICS[root];
  return KEY_ENHARMONICS['C'];
}

// วัฏจักรชื่อคีย์สากล (ไม่ใช้ A#, D#, G# เป็นชื่อคีย์ เพราะในสากลใช้ Bb, Eb, Ab)
const MAJOR_KEYS_CYCLE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MAJOR_KEYS_SHARP = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEYS_CYCLE = ['Cm', 'C#m', 'Dm', 'Ebm', 'Em', 'Fm', 'F#m', 'Gm', 'Abm', 'Am', 'Bbm', 'Bm'];

// คำนวณชื่อคีย์ใหม่เมื่อทดคีย์ (Transpose Key)
export function transposeKey(baseKey: string, semitones: number): string {
  if (!baseKey) return 'C';
  if (semitones === 0) {
    // ปรับชื่อคีย์ที่แปลกให้เป็นมาตรฐานสากล เช่น A# -> Bb, D# -> Eb, G# -> Ab
    if (baseKey === 'A#') return 'Bb';
    if (baseKey === 'D#') return 'Eb';
    if (baseKey === 'G#') return 'Ab';
    if (baseKey === 'A#m') return 'Bbm';
    if (baseKey === 'Gbm') return 'F#m';
    return baseKey;
  }

  const isMinor = /m$/i.test(baseKey.trim()) && !/maj/i.test(baseKey);
  const rootMatch = baseKey.trim().match(/^([A-Ga-g][#b]?)/);
  if (!rootMatch) return baseKey;

  const root = rootMatch[1].toUpperCase();
  if (!(root in NOTE_TO_INDEX)) return baseKey;

  const currentIdx = NOTE_TO_INDEX[root];
  const newIdx = (currentIdx + (semitones % 12) + 12) % 12;

  if (isMinor) {
    return MINOR_KEYS_CYCLE[newIdx];
  }

  const preferSharps = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#'].includes(baseKey.trim());
  const cycle = preferSharps ? MAJOR_KEYS_SHARP : MAJOR_KEYS_CYCLE;
  return cycle[newIdx];
}

// ปรับหรือทดตัวโน้ตเดี่ยวโดยใช้การสะกดตามคีย์ดนตรีที่ระบุ
export function transposeSingleNote(note: string, semitones: number, key = 'C'): string {
  const upper = note.toUpperCase();
  if (!(upper in NOTE_TO_INDEX)) return note;
  const index = NOTE_TO_INDEX[upper];
  const newIndex = (index + (semitones % 12) + 12) % 12;
  const scale = getScaleForKey(key);
  return scale[newIndex];
}

// จัดรูปแบบคอร์ดให้ถูกต้องตามคีย์ (เช่น คีย์ F เปลี่ยน A# เป็น Bb, คีย์ D เปลี่ยน Gbm เป็น F#m)
export function formatChordForKey(chord: string, key = 'C'): string {
  return transposeNote(chord, 0, key);
}

// ทดคีย์ของคอร์ด และสะกดชื่อคอร์ดและเบสตาม targetKey
export function transposeNote(chord: string, semitones: number, targetKey = 'C'): string {
  if (!chord) return chord;

  const parts = chord.split('/');
  const rootMatch = parts[0].match(/^([A-Ga-g][#b]?)(.*)$/);
  if (!rootMatch) return chord;

  const [, rootNote, quality] = rootMatch;
  const transposedRoot = transposeSingleNote(rootNote, semitones, targetKey);
  let result = transposedRoot + quality;

  if (parts.length > 1) {
    const bassMatch = parts[1].match(/^([A-Ga-g][#b]?)(.*)$/);
    if (bassMatch) {
      const [, bassNote, bassQuality] = bassMatch;
      const transposedBass = transposeSingleNote(bassNote, semitones, targetKey);
      result += '/' + transposedBass + bassQuality;
    } else {
      result += '/' + parts[1];
    }
  }

  return result;
}

export function getSemitonesBetweenKeys(fromKey: string, toKey: string): number {
  if (!fromKey || !toKey || fromKey === toKey) return 0;
  const fromMatch = fromKey.match(/^([A-Ga-g][#b]?)/);
  const toMatch = toKey.match(/^([A-Ga-g][#b]?)/);
  if (!fromMatch || !toMatch) return 0;
  const fromIdx = NOTE_TO_INDEX[fromMatch[1].toUpperCase()];
  const toIdx = NOTE_TO_INDEX[toMatch[1].toUpperCase()];
  if (fromIdx === undefined || toIdx === undefined) return 0;
  let diff = (toIdx - fromIdx) % 12;
  if (diff > 6) diff -= 12;
  if (diff < -5) diff += 12;
  return diff;
}

const THAI_NON_SPACING_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;
export const CHORD_REGEX = /^[A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?$/;
export const CHORD_EXTRACT_REGEX = /(?:^|(?<=[\s|/:,(-]))([A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?)(?=$|[\s|/:,)-])/g;

// แยกคอร์ดที่พิมพ์ติดกัน เช่น AD -> A D, BmA -> Bm A, [A][D] -> [A]  [D]
export function splitGluedChords(text: string): string {
  if (!text) return text;
  let result = text.replace(/\]\s*\[/g, ']  [');
  const chordPattern = '(?:[A-G][#b]?(?:maj7|maj9|maj|min7|min|dim7|dim|aug|sus4|sus2|sus|add9|add|m7b5|m7|m9|m|7|9|11|13)?(?:\\/[A-G][#b]?)?)';
  const gluedRegex = new RegExp(`\\b(${chordPattern})(${chordPattern})\\b`, 'g');
  result = result.replace(gluedRegex, '$1  $2');
  result = result.replace(gluedRegex, '$1  $2');
  return result;
}

export function isChordToken(token: string): boolean {
  const clean = token.replace(/^[|/()]+|[|/(),.:]+$/g, '');
  return clean.length > 0 && CHORD_REGEX.test(clean);
}

export function isChordLine(line: string): boolean {
  const cleanLine = splitGluedChords(line);
  const trimmed = cleanLine.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('{') || (trimmed.startsWith('[') && trimmed.endsWith(']'))) return false;
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 0) return false;
  const chordCount = tokens.filter(
    (t) => isChordToken(t) || t === '/' || t === '|' || t === '||' || t === '-' || t === 'x' || t === '2x'
  ).length;
  return chordCount / tokens.length >= 0.5;
}

export const INTRO_PREFIX_REGEX = /^(Intro|Outro|Solo|IN|Hook|Bridge|Riff|Ending|Interlude)\s*[:|-]\s*/i;
export const INSTRUMENTAL_HEADER_REGEX = /^(\{c:\s*(?:Intro|Solo|Instrumental|Interlude|Riff)\s*\}|\[?(?:Intro|Solo|Instrumental|Interlude|Riff)\]?)\s*[:|-]?\s*$/i;

export function convertStandaloneChordLine(line: string): string {
  const cleanLine = splitGluedChords(line);
  if (cleanLine.includes('[') && cleanLine.includes(']')) return cleanLine;
  const regex = new RegExp(CHORD_EXTRACT_REGEX.source, 'g');
  return cleanLine.replace(regex, '[$1]');
}

export function hasTwoLineChordFormat(text: string): boolean {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length - 1; i++) {
    if (isChordLine(lines[i]) && !isChordLine(lines[i + 1]) && lines[i + 1].trim().length > 0) {
      return true;
    }
  }
  return false;
}

export function convertTextToChordPro(text: string): string {
  const lines = text.split('\n');
  const resultLines: string[] = [];
  let inInstrumentalSection = false;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const trimmed = currentLine.trim();
    const nextLine = lines[i + 1];

    if (INSTRUMENTAL_HEADER_REGEX.test(trimmed)) {
      inInstrumentalSection = true;
      resultLines.push(currentLine);
      continue;
    }

    if (trimmed.startsWith('{c:') || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      if (!INSTRUMENTAL_HEADER_REGEX.test(trimmed)) {
        inInstrumentalSection = false;
      }
    }

    // กรณี 1: บรรทัดขึ้นต้นด้วย Intro / Solo / Outro เช่น "Intro : G Em C D"
    if (INTRO_PREFIX_REGEX.test(trimmed)) {
      resultLines.push(convertStandaloneChordLine(currentLine));
      continue;
    }

    // กรณี 2: บรรทัดคอร์ด
    if (isChordLine(currentLine)) {
      const hasValidLyricNext =
        nextLine !== undefined &&
        nextLine.trim().length > 0 &&
        !isChordLine(nextLine) &&
        !nextLine.trim().startsWith('{') &&
        !nextLine.trim().startsWith('[') &&
        !INTRO_PREFIX_REGEX.test(nextLine.trim()) &&
        !INSTRUMENTAL_HEADER_REGEX.test(nextLine.trim()) &&
        !(inInstrumentalSection && /^\d+\.\s/.test(nextLine.trim()));

      // หากไม่มีเนื้อร้องด้านล่าง เช่น คอร์ดเดี่ยวๆ ในท่อน Intro ท้ายท่อน หรือท่อน Solo
      if (!hasValidLyricNext) {
        resultLines.push(convertStandaloneChordLine(currentLine));
        continue;
      }

      inInstrumentalSection = false;

      const chordMatches: { chord: string; index: number }[] = [];
      const regex = new RegExp(CHORD_EXTRACT_REGEX.source, 'g');
      let match;
      while ((match = regex.exec(currentLine)) !== null) {
        if (CHORD_REGEX.test(match[1])) {
          chordMatches.push({ chord: match[1], index: match.index });
        }
      }

      if (chordMatches.length === 0) {
        resultLines.push(currentLine);
        continue;
      }

      const lyricLine = nextLine;
      let merged = '';
      let lyricVisualIdx = 0;
      let chordMatchIdx = 0;
      let lastChordEndIdx = 0;

      for (let charIdx = 0; charIdx < lyricLine.length; charIdx++) {
        while (
          chordMatchIdx < chordMatches.length &&
          chordMatches[chordMatchIdx].index <= lyricVisualIdx
        ) {
          const currentChord = chordMatches[chordMatchIdx];
          if (chordMatchIdx > 0 && currentChord.index <= lastChordEndIdx) {
            merged += '  ';
          }
          merged += `[${currentChord.chord}]`;
          lastChordEndIdx = currentChord.index + currentChord.chord.length;
          chordMatchIdx++;
        }

        const char = lyricLine[charIdx];
        merged += char;

        if (!char.match(THAI_NON_SPACING_REGEX)) {
          lyricVisualIdx++;
        }
      }

      while (chordMatchIdx < chordMatches.length) {
        const currentChord = chordMatches[chordMatchIdx];
        const spaceCount = Math.max(2, currentChord.index - lastChordEndIdx);
        merged += ' '.repeat(spaceCount) + `[${currentChord.chord}]`;
        lastChordEndIdx = currentChord.index + currentChord.chord.length;
        chordMatchIdx++;
      }

      resultLines.push(merged);
      i++;
    } else {
      resultLines.push(currentLine);
    }
  }

  return resultLines.join('\n');
}

export function convertChordProTo2LineText(text: string): string {
  const lines = text.split('\n');
  const output: string[] = [];

  for (const line of lines) {
    if (!line.includes('[')) {
      output.push(line);
      continue;
    }

    let chordLine = '';
    let lyricLine = '';
    let visualPos = 0;
    const regex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(line)) !== null) {
      const lyricBefore = line.slice(lastIndex, match.index);
      lyricLine += lyricBefore;

      for (const char of lyricBefore) {
        if (!char.match(THAI_NON_SPACING_REGEX)) {
          visualPos++;
        }
      }

      const chord = match[1];
      while (chordLine.length < visualPos) {
        chordLine += ' ';
      }
      chordLine += chord;

      lastIndex = regex.lastIndex;
    }

    const remainingLyric = line.slice(lastIndex);
    lyricLine += remainingLyric;

    output.push(chordLine);
    output.push(lyricLine);
  }

  return output.join('\n');
}