import {
  normalizeThaiText,
  fixThaiChordProGraphemes
} from './thaiText';
import {
  CHORD_REGEX,
  isChordLine,
  splitGluedChords,
  convert2LinesToChordPro,
  hasTwoLineChordFormat
} from './chordProParser';

export interface FormatChordProOptions {
  standardizeSections?: boolean;
  normalizeChordBrackets?: boolean;
  standardizeChordCasing?: boolean;
  cleanSpacing?: boolean;
  includeHeaders?: boolean;
  title?: string;
  artist?: string;
  key?: string;
  tempo?: number;
}

// ปรับตัวอักษรของคอร์ดให้อยู่ในรูปแบบมาตรฐาน เช่น am -> Am, c#m7 -> C#m7, bb/d -> Bb/D
export function normalizeChordName(chordStr: string): string {
  const clean = chordStr.trim();
  if (!clean) return clean;

  const slashIdx = clean.indexOf('/');
  if (slashIdx !== -1) {
    const rootPart = clean.slice(0, slashIdx);
    const bassPart = clean.slice(slashIdx + 1);
    return `${normalizeChordRoot(rootPart)}/${normalizeChordRoot(bassPart)}`;
  }

  return normalizeChordRoot(clean);
}

function normalizeChordRoot(token: string): string {
  const trimmed = token.trim();
  const match = trimmed.match(/^([a-gA-G])([#b]?)(.*)$/);
  if (!match) return trimmed;

  const rootLetter = match[1].toUpperCase();
  let acc = match[2];
  if (acc === 'B' || acc === 'b') acc = 'b';
  if (acc === '#') acc = '#';

  let rest = match[3];
  // Standardize qualities: Maj -> maj, Min -> m, etc.
  if (/^maj/i.test(rest)) {
    rest = 'maj' + rest.slice(3);
  } else if (/^min/i.test(rest)) {
    rest = 'm' + rest.slice(3);
  } else if (/^m(?!aj)/.test(rest)) {
    rest = 'm' + rest.slice(1);
  } else if (/^dim/i.test(rest)) {
    rest = 'dim' + rest.slice(3);
  } else if (/^aug/i.test(rest)) {
    rest = 'aug' + rest.slice(3);
  } else if (/^sus/i.test(rest)) {
    rest = 'sus' + rest.slice(3);
  } else if (/^add/i.test(rest)) {
    rest = 'add' + rest.slice(3);
  }

  return `${rootLetter}${acc}${rest}`;
}

// แปลงหัวข้อท่อนต่างๆ ให้เป็นรูปแบบ ChordPro มาตรฐาน {c: ...}
export function standardizeSectionHeader(line: string): string {
  const trimmed = line.trim();

  // จัดการ Directive เดิม เช่น {comment: Verse 1} -> {c: Verse 1}
  const commentMatch = trimmed.match(/^\{(?:comment|section|c)\s*:\s*([^}]+)\}$/i);
  if (commentMatch) {
    return `{c: ${commentMatch[1].trim()}}`;
  }

  // แปลง [Verse 1], [Chorus], Verse 1:, Chorus:, ฯลฯ
  const patterns: [RegExp, string][] = [
    [/^\[?(?:intro|ท่อนอินโทร|อินโทร)\]?\s*[:|-]?\s*$/i, '{c: Intro}'],
    [/^\[?(?:verse\s*1|ท่อน\s*1|ท่อนที่\s*1)\]?\s*[:|-]?\s*$/i, '{c: Verse 1}'],
    [/^\[?(?:verse\s*2|ท่อน\s*2|ท่อนที่\s*2)\]?\s*[:|-]?\s*$/i, '{c: Verse 2}'],
    [/^\[?(?:verse\s*3|ท่อน\s*3|ท่อนที่\s*3)\]?\s*[:|-]?\s*$/i, '{c: Verse 3}'],
    [/^\[?(?:verse\s*4|ท่อน\s*4|ท่อนที่\s*4)\]?\s*[:|-]?\s*$/i, '{c: Verse 4}'],
    [/^\[?(?:verse)\]?\s*[:|-]?\s*$/i, '{c: Verse}'],
    [/^\[?(?:pre-chorus|pre chorus|ท่อนพรีฮุก|พรีฮุก)\]?\s*[:|-]?\s*$/i, '{c: Pre-Chorus}'],
    [/^\[?(?:chorus|hook|ท่อนฮุก|ฮุก)\]?\s*[:|-]?\s*$/i, '{c: Chorus}'],
    [/^\[?(?:chorus\s*1)\]?\s*[:|-]?\s*$/i, '{c: Chorus 1}'],
    [/^\[?(?:chorus\s*2)\]?\s*[:|-]?\s*$/i, '{c: Chorus 2}'],
    [/^\[?(?:bridge|ท่อนแยก|ท่อนบริดจ์|บริดจ์)\]?\s*[:|-]?\s*$/i, '{c: Bridge}'],
    [/^\[?(?:outro|ending|ท่อนจบ)\]?\s*[:|-]?\s*$/i, '{c: Outro}'],
    [/^\[?(?:solo|ท่อนโซโล่|โซโล่|guitar solo)\]?\s*[:|-]?\s*$/i, '{c: Solo}'],
    [/^\[?(?:interlude|ดนตรี)\]?\s*[:|-]?\s*$/i, '{c: Interlude}'],
    [/^\[?(?:tag)\]?\s*[:|-]?\s*$/i, '{c: Tag}'],
  ];

  for (const [regex, replacement] of patterns) {
    if (regex.test(trimmed)) {
      return replacement;
    }
  }

  // หากเป็นวงเล็บก้ามปูที่บรรจุชื่อท่อนอื่นๆ เช่น [V1], [C], [B]
  if (/^\[[A-Za-zก-๙0-9\s_-]+\]$/.test(trimmed)) {
    const inner = trimmed.slice(1, -1).trim();
    // ถ้าไม่ใช่คอร์ดเดี่ยวๆ
    if (!CHORD_REGEX.test(inner)) {
      return `{c: ${inner}}`;
    }
  }

  return line;
}

// ดึง metadata หัวเพลงจาก ChordPro
export function extractMetadataFromChordPro(text: string): {
  title?: string;
  artist?: string;
  key?: string;
  tempo?: number;
} {
  const meta: { title?: string; artist?: string; key?: string; tempo?: number } = {};
  if (!text) return meta;

  const lines = text.split('\n');
  for (const line of lines) {
    const match = line.trim().match(/^\{([a-zA-Z_]+)\s*:\s*([^}]+)\}$/);
    if (match) {
      const directive = match[1].toLowerCase();
      const val = match[2].trim();
      if (directive === 'title' || directive === 't') meta.title = val;
      if (directive === 'artist' || directive === 'a') meta.artist = val;
      if (directive === 'key' || directive === 'k') meta.key = val;
      if (directive === 'tempo' || directive === 'bpm') {
        const num = parseInt(val, 10);
        if (!isNaN(num)) meta.tempo = num;
      }
    }
  }
  return meta;
}

// ตรวจสอบและแปลงวงเล็บกลม (C) ให้เป็น [C] หากเป็นคอร์ดจริง
export function convertParenthesesChords(line: string): string {
  // หากเป็นบรรทัด directive ข้าม
  if (line.trim().startsWith('{') && line.trim().endsWith('}')) return line;

  // แปลง (C) -> [C] เฉพาะเมื่อข้อความข้างในตรงกับคอร์ด
  return line.replace(/\(([A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?)\)/g, '[$1]');
}

// ฟังก์ชันหลัก: จัดรูปแบบ ChordPro ให้สะอาด สวยงาม และถูกต้องตามมาตรฐาน 100%
export function formatChordPro(
  text: string,
  options: FormatChordProOptions = {}
): string {
  if (!text || !text.trim()) return text;

  const {
    standardizeSections = true,
    normalizeChordBrackets = true,
    standardizeChordCasing = true,
    cleanSpacing = true,
    includeHeaders = false,
    title,
    artist,
    key,
    tempo
  } = options;

  // 1. Normalize ภาษาไทย
  let processed = normalizeThaiText(text);

  // 2. หากเป็นรูปแบบ 2 บรรทัด (คอร์ดอยู่บนเนื้อ) ให้แปลงเป็น ChordPro ก่อน
  if (hasTwoLineChordFormat(processed)) {
    processed = convert2LinesToChordPro(processed);
  }

  // 3. ปรับคอร์ดในวงเล็บกลม (C) -> [C]
  if (normalizeChordBrackets) {
    const rawLines = processed.split('\n');
    processed = rawLines.map(convertParenthesesChords).join('\n');
  }

  // 4. แยกคอร์ดที่ติดกัน [C][G] -> [C]  [G]
  processed = splitGluedChords(processed);

  // 5. ปรับตัวพิมพ์ของคอร์ดใน [ ... ] ให้ถูกต้อง และตัดช่องว่างภายในวงเล็บ [ C ] -> [C]
  if (standardizeChordCasing || normalizeChordBrackets) {
    processed = processed.replace(/\[\s*([^\]]+?)\s*\]/g, (match, chordInner) => {
      // ตรวจสอบว่าใช่คอร์ดหรือไม่
      const cleanChord = chordInner.trim();
      if (CHORD_REGEX.test(cleanChord)) {
        return `[${normalizeChordName(cleanChord)}]`;
      }
      return match;
    });
  }

  // 6. ซ่อมแซมหน่วยอักขระไทย ไม่ให้ [Chord] แทรกระหว่างพยัญชนะกับสระ/วรรณยุกต์
  processed = fixThaiChordProGraphemes(processed);

  // 7. จัดรูปแบบบรรทัด หัวข้อท่อน และการเว้นวรรค
  const lines = processed.split('\n');
  const formattedLines: string[] = [];
  let prevLineWasEmpty = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trimEnd();
    const trimmed = line.trim();

    // จัดการบรรทัดว่าง
    if (!trimmed) {
      if (cleanSpacing) {
        if (!prevLineWasEmpty && formattedLines.length > 0) {
          formattedLines.push('');
          prevLineWasEmpty = true;
        }
      } else {
        formattedLines.push('');
      }
      continue;
    }

    // จัดการหัวข้อท่อน
    if (standardizeSections) {
      const sectionNormalized = standardizeSectionHeader(line);
      if (sectionNormalized !== line) {
        // ให้มีบรรทัดว่าง 1 บรรทัดก่อนหน้าหัวข้อท่อนเสมอ เพื่อความเป็นระเบียบ (ถ้าไม่ใช่บรรทัดแรก)
        if (cleanSpacing && formattedLines.length > 0 && !prevLineWasEmpty) {
          formattedLines.push('');
        }
        line = sectionNormalized;
      }
    }

    formattedLines.push(line);
    prevLineWasEmpty = false;
  }

  // 8. ตัดบรรทัดว่างหัวท้าย
  while (formattedLines.length > 0 && !formattedLines[0].trim()) {
    formattedLines.shift();
  }
  while (formattedLines.length > 0 && !formattedLines[formattedLines.length - 1].trim()) {
    formattedLines.pop();
  }

  // 9. หากเลือกให้ใส่ Metadata Headers {title: ...}, {key: ...} ด้านบน
  if (includeHeaders) {
    const existingMeta = extractMetadataFromChordPro(formattedLines.join('\n'));
    const finalTitle = title || existingMeta.title;
    const finalArtist = artist || existingMeta.artist;
    const finalKey = key || existingMeta.key;
    const finalTempo = tempo || existingMeta.tempo;

    // กรอง headers เดิมที่อยู่ด้านบนสุดออกเพื่อแทนที่ด้วยเวอร์ชันจัดระเบียบ
    const contentLines: string[] = [];
    let skippingHeaders = true;

    for (const l of formattedLines) {
      if (skippingHeaders && /^\{(?:title|t|artist|a|key|k|tempo|bpm|time|capo)\s*:[^}]*\}$/i.test(l.trim())) {
        continue;
      }
      skippingHeaders = false;
      contentLines.push(l);
    }

    const headerLines: string[] = [];
    if (finalTitle) headerLines.push(`{title: ${finalTitle}}`);
    if (finalArtist) headerLines.push(`{artist: ${finalArtist}}`);
    if (finalKey) headerLines.push(`{key: ${finalKey}}`);
    if (finalTempo) headerLines.push(`{tempo: ${finalTempo}}`);

    if (headerLines.length > 0) {
      return [...headerLines, '', ...contentLines].join('\n');
    }
    return contentLines.join('\n');
  }

  return formattedLines.join('\n');
}

export interface ChordProStats {
  chordCount: number;
  uniqueChords: string[];
  sectionCount: number;
  sections: string[];
  hasParenthesesChords: boolean;
  hasTwoLineFormat: boolean;
  hasGluedChords: boolean;
}

export function detectChordProStats(text: string): ChordProStats {
  if (!text) {
    return {
      chordCount: 0,
      uniqueChords: [],
      sectionCount: 0,
      sections: [],
      hasParenthesesChords: false,
      hasTwoLineFormat: false,
      hasGluedChords: false
    };
  }

  const chordsSet = new Set<string>();
  let chordMatches = 0;
  const chordRegex = /\[([^\]]+)\]/g;
  let match;

  while ((match = chordRegex.exec(text)) !== null) {
    const raw = match[1].trim();
    if (CHORD_REGEX.test(raw)) {
      chordsSet.add(raw);
      chordMatches++;
    }
  }

  const sections: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const commentMatch = trimmed.match(/^\{(?:comment|c|section)\s*:\s*([^}]+)\}$/i);
    if (commentMatch) {
      sections.push(commentMatch[1].trim());
    } else {
      const standard = standardizeSectionHeader(line);
      if (standard !== line) {
        const m = standard.match(/^\{c:\s*([^}]+)\}$/);
        if (m) sections.push(m[1]);
      }
    }
  }

  const hasParenthesesChords = /\(([A-G][#b]?(?:maj|min|m|M|dim|aug|sus|add)?(?:[0-9]|b5|#5|b9|#9|#11|b13)*(?:\/[A-G][#b]?)?)\)/.test(text);
  const hasTwoLine = hasTwoLineChordFormat(text);
  const hasGluedChords = /\]\s*\[/.test(text);

  return {
    chordCount: chordMatches,
    uniqueChords: Array.from(chordsSet),
    sectionCount: sections.length,
    sections,
    hasParenthesesChords,
    hasTwoLineFormat: hasTwoLine,
    hasGluedChords
  };
}

export function syncMetadataToChordPro(
  text: string,
  meta: { title?: string; artist?: string; key?: string; tempo?: number }
): string {
  return formatChordPro(text, {
    includeHeaders: true,
    title: meta.title,
    artist: meta.artist,
    key: meta.key,
    tempo: meta.tempo
  });
}

