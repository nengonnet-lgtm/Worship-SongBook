import { transposeNote } from './chordUtils';
import {
  normalizeThaiText,
  fixThaiChordProGraphemes,
  sanitizeParsedLineItems,
  getThaiVisualLength,
  THAI_COMBINING_REGEX
} from './thaiText';

export interface ParsedLineItem {
  lyric: string;
  chord?: string;
  // คอลัมน์เดิมของคอร์ดในช่อง Editor แบบ 2 บรรทัด (นับเฉพาะตัวอักษรหลัก ไม่นับสระบน/ล่าง/วรรณยุกต์)
  // ใช้วางคอร์ดให้ตรงกับที่เห็นใน Editor เป๊ะ แม้ตำแหน่งยึดใน ChordPro จะถูกเลื่อนเพื่อไม่ให้ตัดหน่วยอักขระไทย
  col?: number;
}

export interface ParsedLine {
  type: 'lyric' | 'comment' | 'empty';
  comment?: string;
  items?: ParsedLineItem[];
  isChordOnly?: boolean;
}

export interface ParsedSection {
  title: string;
  lines: ParsedLine[];
}

export interface ParsedSong {
  sections: ParsedSection[];
  allChords: string[];
}

// ตรวจสอบรูปแบบคอร์ดมาตรฐาน เช่น C, Am, F#m, Bb/D, Cmaj7, Gmaj7, Dmaj7, Gsus4
export const CHORD_REGEX = /^[A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?$/;
export const CHORD_EXTRACT_REGEX = /(?:^|(?<=[\s|/:,(-]))([A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?)(?=$|[\s|/:,)-])/g;
const INTRO_PREFIX_REGEX = /^(Intro|Outro|Solo|IN|Hook|Bridge|Riff|Ending|Interlude)\s*[:|-]\s*/i;
const INSTRUMENTAL_HEADER_REGEX = /^(\{c:\s*(?:Intro|Solo|Instrumental|Interlude|Riff)\s*\}|\[?(?:Intro|Solo|Instrumental|Interlude|Riff)\]?)\s*[:|-]?\s*$/i;

// แยกคอร์ดที่พิมพ์ติดกัน เช่น AD -> A D, BmA -> Bm A, [A][D] -> [A]  [D]
export function splitGluedChords(text: string): string {
  if (!text) return text;
  // 1. แยกคอร์ดในวงเล็บที่ติดกัน เช่น [A][D] -> [A]  [D]
  let result = text.replace(/\]\s*\[/g, ']  [');

  // 2. แยกคอร์ดตัวอักษรที่ติดกัน เช่น AD -> A D, BmA -> Bm A
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

export function convertStandaloneChordLine(line: string): string {
  return convertStandaloneChordLineWithCols(line).text;
}

// เหมือน convertStandaloneChordLine แต่คืนคอลัมน์เดิมของแต่ละคอร์ดมาด้วย
export function convertStandaloneChordLineWithCols(line: string): { text: string; cols?: number[] } {
  const cleanLine = splitGluedChords(line);
  if (cleanLine.includes('[') && cleanLine.includes(']')) return { text: cleanLine };
  const regex = new RegExp(CHORD_EXTRACT_REGEX.source, 'g');
  const cols: number[] = [];
  const text = cleanLine.replace(regex, (_match: string, chord: string, offset: number) => {
    cols.push(getThaiVisualLength(cleanLine.slice(0, offset)));
    return `[${chord}]`;
  });
  return { text, cols };
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

// ตรวจสอบว่าบรรทัดนี้เป็นบรรทัดคอร์ดล้วน / Intro / Solo หรือไม่
export function checkIfChordOnly(items: ParsedLineItem[]): boolean {
  const hasChords = items.some((it) => Boolean(it.chord));
  if (!hasChords) return false;

  const fullText = items.map((it) => it.lyric || '').join('').trim();
  if (!fullText) return true;

  // หากไม่มีเนื้อร้องจริงหลงเหลืออยู่ (มีเพียงเครื่องหมายวรรคตอน ขีด สแลช หรือคำหัวข้อท่อน) ให้ถือเป็นคอร์ดล้วน
  const stripped = fullText
    .replace(/^(Intro|Outro|Solo|IN|Hook|Bridge|Riff|Ending|Interlude)\s*[:|-]?/i, '')
    .replace(/\(\s*[^)]*\s*\)/gi, '')
    .replace(/\b\d+x\b/gi, '')
    .replace(/[|/\\,\-.:~_\s]+/g, '')
    .trim();

  return stripped.length === 0;
}

// ฟังก์ชันแปลงข้อความแบบ 2 บรรทัด (คอร์ดบน-เนื้อล่าง) ให้เป็นรูปแบบ ChordPro [คอร์ด]
export function convert2LinesToChordPro(text: string): string {
  if (!text) return text;
  return convert2LinesToChordProWithCols(text).text;
}

// เหมือน convert2LinesToChordPro แต่คืน "คอลัมน์เดิมของคอร์ดในบรรทัดคอร์ด" ของแต่ละบรรทัดผลลัพธ์มาด้วย
// (cols[i] ตรงกับบรรทัดที่ i ของ text; undefined = บรรทัดนั้นไม่มีคอลัมน์ต้นฉบับ)
export function convert2LinesToChordProWithCols(
  text: string
): { text: string; cols: (number[] | undefined)[] } {
  if (!text) return { text, cols: [] };
  const cleanInput = normalizeThaiText(text);
  const lines = cleanInput.split('\n');
  const resultLines: string[] = [];
  const resultCols: (number[] | undefined)[] = [];
  const pushLine = (line: string, cols?: number[]) => {
    resultLines.push(line);
    resultCols.push(cols);
  };
  let inInstrumentalSection = false;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    const trimmed = currentLine.trim();
    const nextLine = lines[i + 1];

    // ตรวจสอบหัวข้อท่อนดนตรีบรรเลงล้วน เช่น [Intro], Intro:, [Solo]
    if (INSTRUMENTAL_HEADER_REGEX.test(trimmed)) {
      inInstrumentalSection = true;
      pushLine(currentLine);
      continue;
    }

    if (trimmed.startsWith('{c:') || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      if (!INSTRUMENTAL_HEADER_REGEX.test(trimmed)) {
        inInstrumentalSection = false;
      }
    }

    // กรณี 1: บรรทัดขึ้นต้นด้วย Intro / Solo / Outro เช่น "Intro : G Em C D" หรือ "Intro : C / Am / F / G (2 รอบ)"
    if (INTRO_PREFIX_REGEX.test(trimmed)) {
      const standalone = convertStandaloneChordLineWithCols(currentLine);
      pushLine(standalone.text, standalone.cols);
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
        const standalone = convertStandaloneChordLineWithCols(currentLine);
        pushLine(standalone.text, standalone.cols);
        continue;
      }

      inInstrumentalSection = false;

      // ค้นหาตำแหน่งคอร์ดทั้งหมดในบรรทัดบนเพื่อรวมเข้ากับเนื้อร้องบรรทัดล่าง
      const chordMatches: { chord: string; index: number }[] = [];
      const regex = new RegExp(CHORD_EXTRACT_REGEX.source, 'g');
      let match;
      while ((match = regex.exec(currentLine)) !== null) {
        if (CHORD_REGEX.test(match[1])) {
          chordMatches.push({ chord: match[1], index: match.index });
        }
      }

      if (chordMatches.length === 0) {
        pushLine(currentLine);
        continue;
      }

      // นำคอร์ดแทรกเข้าไปในบรรทัดเนื้อร้องภาษาไทยโดยรักษาตำแหน่งตัวอักษรและไม่ตัดหน่วยอักขระไทย
      const lyricLine = nextLine;
      const normalizedLyric = normalizeThaiText(lyricLine);
      let merged = '';
      let lyricVisualIdx = 0;
      let chordMatchIdx = 0;
      let lastChordEndIdx = 0;

      for (let charIdx = 0; charIdx < normalizedLyric.length; charIdx++) {
        const char = normalizedLyric[charIdx];
        const isCombining = THAI_COMBINING_REGEX.test(char);

        while (
          chordMatchIdx < chordMatches.length &&
          chordMatches[chordMatchIdx].index <= lyricVisualIdx
        ) {
          const currentChord = chordMatches[chordMatchIdx];

          // หากตำแหน่งตัวอักษรปัจจุบันเป็นสระบน/ล่าง หรือวรรณยุกต์ และ merged ลงท้ายด้วยพยัญชนะไทย
          // ให้ย้ายตำแหน่งคอร์ดไปอยู่ "ก่อนหน้า" พยัญชนะต้น เพื่อไม่ให้แยกพยัญชนะกับสระ/วรรณยุกต์ออกจากกัน
          if (isCombining && /[ก-ฮ\u0E24\u0E26]$/.test(merged)) {
            const lastChar = merged.slice(-1);
            let prefix = merged.slice(0, -1);
            // หากมีสระหน้านำพยัญชนะนั้นอยู่ เช่น เ แ โ ใ ไ ให้เลื่อนคอร์ดไปหน้าสระหน้าด้วย
            if (/[\u0E40-\u0E44]$/.test(prefix)) {
              const leadingVowel = prefix.slice(-1);
              prefix = prefix.slice(0, -1);
              merged = prefix + `[${currentChord.chord}]` + leadingVowel + lastChar;
            } else {
              merged = prefix + `[${currentChord.chord}]` + lastChar;
            }
          } else {
            if (chordMatchIdx > 0 && currentChord.index <= lastChordEndIdx && merged.endsWith(']')) {
              merged += '  ';
            }
            merged += `[${currentChord.chord}]`;
          }

          lastChordEndIdx = currentChord.index + currentChord.chord.length;
          chordMatchIdx++;
        }

        merged += char;

        // นับตำแหน่ง Index เฉพาะตัวอักษรหลัก (ไม่นับสระบน-ล่าง/วรรณยุกต์ไทย)
        if (!isCombining) {
          lyricVisualIdx++;
        }
      }

      // หากยังมีคอร์ดเหลืออยู่ที่เกินความยาวเนื้อร้อง
      while (chordMatchIdx < chordMatches.length) {
        const currentChord = chordMatches[chordMatchIdx];
        const spaceCount = Math.max(2, currentChord.index - lastChordEndIdx);
        merged += ' '.repeat(spaceCount) + `[${currentChord.chord}]`;
        lastChordEndIdx = currentChord.index + currentChord.chord.length;
        chordMatchIdx++;
      }

      pushLine(
        fixThaiChordProGraphemes(merged),
        chordMatches.map((m) => m.index)
      );
      i++; // ข้ามบรรทัดเนื้อร้องเพราะรวมแล้ว
    } else {
      pushLine(currentLine);
    }
  }

  return { text: resultLines.join('\n'), cols: resultCols };
}

// ฟังก์ชันหลักสำหรับ Parse เนื้อเพลงและคอร์ด
export function parseChordPro(
  content: string,
  transposeSemitones: number = 0,
  targetKey?: string,
  notation?: string,
  originalKey?: string
): ParsedSong {
  // 1. Normalize ภาษาไทย และแปลงรูปแบบ 2 บรรทัดเป็น ChordPro
  const cleanInput = normalizeThaiText(content || '');
  const converted = convert2LinesToChordProWithCols(cleanInput);
  const chordProText = fixThaiChordProGraphemes(converted.text);

  const lines = chordProText.split('\n');
  // คอลัมน์คอร์ดดั้งเดิมจาก Editor ใช้ได้เมื่อจำนวนบรรทัดยังตรงกันทุกบรรทัดเท่านั้น
  const lineCols = lines.length === converted.cols.length ? converted.cols : [];
  const sections: ParsedSection[] = [];
  const allChordsSet = new Set<string>();

  let currentSection: ParsedSection = {
    title: '',
    lines: []
  };

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const rawLine = lines[lineIdx];
    const originalCols = lineCols[lineIdx];
    let chordSeq = 0;
    // ซ่อมแซมหน่วยอักขระไทยในแต่ละบรรทัด
    const line = fixThaiChordProGraphemes(splitGluedChords(rawLine.trimEnd()));

    // 1. Directives เช่น {c: Verse 1}, {c: Intro}, {title: ...}
    if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
      const inner = line.trim().slice(1, -1).trim();
      const colonIdx = inner.indexOf(':');
      const directive = colonIdx !== -1 ? inner.slice(0, colonIdx).trim().toLowerCase() : inner.toLowerCase();
      const value = colonIdx !== -1 ? inner.slice(colonIdx + 1).trim() : '';

      const sectionDirectives = [
        'c', 'comment', 'section', 'verse', 'chorus', 'bridge',
        'intro', 'outro', 'solo', 'hook', 'interlude'
      ];

      if (sectionDirectives.includes(directive)) {
        if (currentSection.lines.length > 0) {
          sections.push(currentSection);
        }
        currentSection = {
          title: value || (directive !== 'c' && directive !== 'comment' && directive !== 'section' ? directive : 'Comment'),
          lines: []
        };
      } else {
        currentSection.lines.push({
          type: 'comment',
          comment: value || inner
        });
      }
      continue;
    }

    // 2. Section Headers เช่น [Intro], [Verse 1], [Chorus]
    const sectionHeaderMatch = line.trim().match(
      /^\[(Verse|Chorus|Bridge|Intro|Outro|Hook|Pre-Chorus|Solo|Tag|Ending|Interlude|Riff|Instrumental|Verse\s+\d+|Chorus\s+\d+|ท่อน\s*\w+).*\]$/i
    );
    if (sectionHeaderMatch) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.trim().slice(1, -1),
        lines: []
      };
      continue;
    }

    // 3. Standalone Header เช่น "Intro:" หรือ "Intro" หรือ "VERSE 1" ที่อยู่เดี่ยวๆ
    const standaloneHeaderMatch = line.trim().match(
      /^(Intro|Outro|Solo|Verse\s*\d*|Chorus\s*\d*|Bridge|Hook|Interlude|Ending|Instrumental)\s*[:|-]?\s*$/i
    );
    if (standaloneHeaderMatch) {
      if (currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        title: standaloneHeaderMatch[1],
        lines: []
      };
      continue;
    }

    // 4. บรรทัดว่าง
    if (!line.trim()) {
      currentSection.lines.push({ type: 'empty' });
      continue;
    }

    // 5. แยกคอร์ดกับเนื้อร้อง [Chord]Lyric
    const items: ParsedLineItem[] = [];
    const chordRegex = /\[([^\]]+)\]/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = chordRegex.exec(line)) !== null) {
      const lyricBefore = line.slice(lastIndex, match.index);
      const rawChord = match[1].trim();

      // ป้องกันกรณีคำหัวข้อ เช่น [Intro] หลุดมาในบรรทัดคอร์ด
      const isHeaderWord = /^(Intro|Outro|Solo|Verse|Chorus|Bridge|Hook|Interlude)$/i.test(rawChord);
      if (isHeaderWord) {
        if (items.length === 0) {
          items.push({ lyric: rawChord + ' : ' });
        } else {
          items[items.length - 1].lyric += rawChord + ' : ';
        }
        lastIndex = chordRegex.lastIndex;
        continue;
      }

      const activeKey = targetKey || originalKey || 'C';
      const transposedChord = transposeNote(rawChord, transposeSemitones, activeKey);
      allChordsSet.add(transposedChord);

      if (items.length === 0 && lyricBefore) {
        items.push({ lyric: lyricBefore });
      } else if (items.length > 0 && lyricBefore) {
        items[items.length - 1].lyric += lyricBefore;
      }

      items.push({
        chord: transposedChord,
        lyric: '',
        col: originalCols ? originalCols[chordSeq] : undefined
      });
      chordSeq++;

      lastIndex = chordRegex.lastIndex;
    }

    // จำนวนคอร์ดไม่ตรงกับคอลัมน์ต้นฉบับ (เช่น มีหัวข้อ [Intro] ปนในบรรทัด) -> ไม่ใช้คอลัมน์ของบรรทัดนี้
    if (originalCols && chordSeq !== originalCols.length) {
      items.forEach((it) => {
        delete it.col;
      });
    }

    const remainingLyric = line.slice(lastIndex);
    if (items.length === 0) {
      items.push({ lyric: remainingLyric });
    } else if (remainingLyric) {
      items[items.length - 1].lyric += remainingLyric;
    }

    // ตรวจสอบและกำจัดปัญหาอักขระลอยตัว (ป้องกันวงกลมไข่ปลาบน iPad/แท็บเล็ต 100%)
    const sanitizedItems = sanitizeParsedLineItems(items);
    const isChordOnly = checkIfChordOnly(sanitizedItems);

    currentSection.lines.push({
      type: 'lyric',
      items: sanitizedItems,
      isChordOnly
    });
  }

  if (currentSection.lines.length > 0) {
    sections.push(currentSection);
  }

  return {
    sections: sections.length > 0 ? sections : [{ title: '', lines: [] }],
    allChords: Array.from(allChordsSet)
  };
}

export interface ChordLineLayout {
  chordLine: string;
  lyricLine: string;
  // true = ทุกคอร์ดมีคอลัมน์ต้นฉบับจาก Editor (วางตรงกับ Editor ได้เป๊ะ)
  hasExactColumns: boolean;
}

/**
 * สร้างข้อความ 2 บรรทัด (คอร์ดบน-เนื้อล่าง) จาก items ของ 1 บรรทัด
 * - ถ้ามีคอลัมน์ต้นฉบับ (col) จะวางคอร์ดที่คอลัมน์นั้นเสมอ จึงตรงกับช่อง Editor
 * - เว้นอย่างน้อย 1 ช่องว่างจากคอร์ดก่อนหน้า (กรณี Transpose แล้วคอร์ดยาวขึ้น)
 * - ถ้าไม่มี col ใช้ตำแหน่งตัวอักษรหลักของเนื้อร้องแทน
 */
export function layoutChordLine(items: ParsedLineItem[]): ChordLineLayout {
  let chordLine = '';
  let lyricLine = '';
  let lyricVisualLen = 0;
  let chordCount = 0;
  let allHaveCols = true;

  for (const item of items) {
    if (item.chord) {
      chordCount++;
      let target = lyricVisualLen;
      if (typeof item.col === 'number') {
        target = item.col;
      } else {
        allHaveCols = false;
      }
      const minPos = chordLine.length > 0 ? chordLine.length + 1 : 0;
      chordLine = chordLine.padEnd(Math.max(target, minPos), ' ') + item.chord;
    }

    const lyric = item.lyric || '';
    lyricLine += lyric;
    lyricVisualLen += getThaiVisualLength(lyric);
  }

  return { chordLine, lyricLine, hasExactColumns: chordCount > 0 && allHaveCols };
}
