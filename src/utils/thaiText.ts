/**
 * Thai Typography & Unicode Helpers for Chord Sheet Rendering
 * 
 * แก้ไขปัญหา "Dotted Circle / วงกลมไข่ปลา ◌ บน iPad / แท็บเล็ต"
 * สาเหตุหลักใน WebKit / Safari CoreText บน iOS/iPadOS:
 * 1. การที่สระบน/ล่าง หรือวรรณยุกต์ (Combining Marks) ถูกแยกออกจากพยัญชนะต้น
 *    โดยแท็ก HTML (เช่น <span>, <div>) หรือคอร์ด ทำให้ขึ้นต้นข้อความใน span เดี่ยวๆ
 * 2. การที่คอร์ดถูกแทรกคั่นกลางระหว่างพยัญชนะกับสระ/วรรณยุกต์ (เช่น ก[C]ิน, ท[C]ี่, ผ[C]ู้)
 * 3. ลำดับ Unicode ไม่ถูกต้อง (เช่น วรรณยุกต์มาก่อนสระล่าง เช่น คุ้ม แทนที่จะเป็น คุ้ม)
 * 4. การปิด ligatures ใน CSS (font-variant-ligatures: none) ทำให้ CoreText ไม่รวมหัวสระ/วรรณยุกต์
 */

// อักขระสระบน สระล่าง วรรณยุกต์ และเครื่องหมายกำกับเสียงภาษาไทย (Non-spacing combining marks)
export const THAI_COMBINING_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;
export const THAI_COMBINING_GLOBAL_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;

// พยัญชนะไทย ก-ฮ รวม ฤ ฦ
export const THAI_CONSONANTS_REGEX = /[\u0E01-\u0E2E\u0E24\u0E26]/;

// สระหน้าภาษาไทย เ แ โ ใ ไ
export const THAI_LEADING_VOWELS_REGEX = /[\u0E40-\u0E44]/;

// สระบน: ั (หันอากาศ), ิ ี ึ ื, ็ (ไต่คู้), ํ (นิคหิต)
export const THAI_UPPER_VOWELS_REGEX = /[\u0E31\u0E34-\u0E37\u0E47\u0E4D]/;

// สระล่าง และ พินทุ: ุ, ู, ฺ
export const THAI_LOWER_VOWELS_REGEX = /[\u0E38-\u0E3A]/;

// วรรณยุกต์: ่, ้, ๊, ๋ และ ทัณฑฆาต/การันต์: ์, ยามักการ: ๎
export const THAI_TONE_MARKS_REGEX = /[\u0E48-\u0E4E]/;

/**
 * จัดการ Normalize ข้อความภาษาไทยตามมาตรฐาน Unicode NFC
 * และสลับลำดับอักขระที่พิมพ์ผิดมาตรฐาน เช่น วรรณยุกต์มาก่อนสระ (เช่น คุ้ม -> คุ้ม)
 * เพื่อป้องกันไม่ให้ CoreText บน iOS/iPadOS มองว่าเป็น Uncombined Sequence แล้ววาดวงกลมไข่ปลา ◌
 */
export function normalizeThaiText(text: string): string {
  if (!text) return text;

  // 1. Unicode NFC Normalization
  let normalized = text.normalize('NFC');

  // 2. แก้ลำดับผิด: วรรณยุกต์มาก่อนสระบน (เช่น ้ + ิ -> ิ + ้)
  normalized = normalized.replace(/([\u0E48-\u0E4B])([\u0E31\u0E34-\u0E37\u0E47\u0E4D])/g, '$2$1');

  // 3. แก้ลำดับผิด: วรรณยุกต์มาก่อนสระล่าง (เช่น คุ้ม -> คุ้ม, ้ + ุ -> ุ + ้)
  normalized = normalized.replace(/([\u0E48-\u0E4B])([\u0E38\u0E39\u0E3A])/g, '$2$1');

  // 4. แก้ลำดับผิด: สระอำซ้ำซ้อนกับนิคหิต
  normalized = normalized.replace(/\u0E4D\u0E33/g, '\u0E33');

  // 5. ตัดสระบน/ล่าง หรือวรรณยุกต์ที่ซ้ำซ้อนติดกัน (Typo จากการพิมพ์ซ้ำ เช่น ัั, ่่, ้้)
  normalized = normalized.replace(/([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E])\1+/g, '$1');

  // 6. กำจัดสระบน/ล่าง/วรรณยุกต์ที่อยู่อย่างโดดเดี่ยวโดยไม่มีพยัญชนะนำหน้าเลย (Orphan combining marks)
  // เช่น เครื่องหมายสระ/วรรณยุกต์ที่ขึ้นต้นบรรทัด หรืออยู่หลังช่องว่างโดยไม่มีพยัญชนะ
  normalized = normalized.replace(/(^|[\s|/:,(-])([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+)/g, '$1');

  return normalized;
}

/**
 * คำนวณความกว้างเชิงสายตา (Visual Width) ของข้อความภาษาไทย
 * โดยไม่นับสระบน สระล่าง และวรรณยุกต์ ซึ่งมีความกว้างเป็น 0 (Non-spacing)
 */
export function getThaiVisualLength(text: string): number {
  if (!text) return 0;
  return text.replace(THAI_COMBINING_GLOBAL_REGEX, '').length;
}

/**
 * ซ่อมแซม ChordPro ที่แทรกคอร์ดไว้กลางหน่วยอักขระภาษาไทย (Grapheme Cluster)
 * ป้องกันไม่ให้คอร์ดไปคั่นระหว่าง พยัญชนะต้น กับ สระบน/ล่าง หรือวรรณยุกต์
 * ตัวอย่าง:
 *   ผ[C]ู้   -> [C]ผู้
 *   ท[C]ี่   -> [C]ที่
 *   ก[D]ิน   -> [D]กิน
 *   ข[G]้า   -> [G]ข้า
 *   ค[D]ำ   -> [D]คำ
 *   เร[C]ียน -> [C]เรียน
 *   เ[C]ธอ   -> [C]เธอ
 *   ที[C]่   -> [C]ที่
 */
export function fixThaiChordProGraphemes(text: string): string {
  if (!text || !text.includes('[')) return text;

  let result = text;

  // วนรอบเพื่อคลายการซ้อนทับหลายกรณี เช่น เร[C]ียน หรือมีช่องว่าง
  for (let pass = 0; pass < 3; pass++) {
    const prev = result;

    // กรณี A: คอร์ดแทรกระหว่างพยัญชนะต้น กับ สระบน/ล่าง/วรรณยุกต์/สระอำ
    // เช่น ผ[C]ู้ -> [C]ผู้, ท[C]ี่ -> [C]ที่, ก[D]ิน -> [D]กิน, ค[D]ำ -> [D]คำ, ว[G]ัน -> [G]วัน
    result = result.replace(
      /([ก-ฮ\u0E24\u0E26])(\s*)\[([^\]]+)\]([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0E33]+)/g,
      '[$3]$1$4'
    );

    // กรณี B: คอร์ดแทรกระหว่างสระหน้า (เ แ โ ใ ไ) กับพยัญชนะต้น
    // เช่น เ[C]ธอ -> [C]เธอ, ไ[D]ป -> [D]ไป, แ[G]ต่ -> [G]แต่, โ[E]ลก -> [E]โลก
    result = result.replace(
      /([\u0E40-\u0E44])(\s*)\[([^\]]+)\]([ก-ฮ\u0E24\u0E26])/g,
      '[$3]$1$4'
    );

    // กรณี C: คอร์ดแทรกระหว่างสระบน/ล่าง กับวรรณยุกต์
    // เช่น ที[C]่ -> [C]ที่
    result = result.replace(
      /([ก-ฮ\u0E24\u0E26][\u0E31\u0E34-\u0E3A\u0E47\u0E4D]*)(\s*)\[([^\]]+)\]([\u0E48-\u0E4E]+)/g,
      '[$3]$1$4'
    );

    if (result === prev) break;
  }

  // กรณี D: คอร์ดนำหน้าสระบน/ล่าง/วรรณยุกต์ที่ไม่มีพยัญชนะต้นอยู่ตรงนั้น
  // เช่น [C]ิ หรือ [C]้ (หลงเหลือจากการตัดต่อผิด)
  // ให้ลบสระบน/ล่าง/วรรณยุกต์ที่กำพร้าออก เพื่อไม่ให้ iPad วาดวงกลมไข่ปลา ◌
  result = result.replace(/\[([^\]]+)\]([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+)/g, '[$1]');

  return result;
}

export interface ThaiSanitizableItem {
  chord?: string;
  lyric?: string;
}

/**
 * ตรวจสอบและแก้ไข items ของแต่ละบรรทัดให้มั่นใจ 100% ว่าไม่มี item.lyric ใดเริ่มต้นด้วยสระบน/ล่าง หรือวรรณยุกต์
 * หากพบว่ามี item ใดเริ่มต้นด้วยสระบน/ล่าง/วรรณยุกต์ จะดึงพยัญชนะต้นจาก item ก่อนหน้ามารวมไว้ใน span เดียวกัน
 * ทำให้ WebKit บน iPadOS / Safari มีพยัญชนะต้นอยู่ใน Text Run เดียวกัน จึงไม่เกิดวงกลมไข่ปลา ◌ อย่างแน่นอน
 */
export function sanitizeParsedLineItems<T extends ThaiSanitizableItem>(items: T[]): T[] {
  if (!items || items.length === 0) return items;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.lyric) continue;

    // ตรวจสอบว่า item.lyric ขึ้นต้นด้วยสระบน/สระล่าง/วรรณยุกต์ หรือไม่
    const match = item.lyric.match(/^([\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+)/);
    if (match) {
      // หากมี item ก่อนหน้า
      if (i > 0 && items[i - 1].lyric) {
        const prevLyric = items[i - 1].lyric || '';
        // หาพยัญชนะไทยตัวสุดท้ายจาก prevLyric
        const lastConsonantMatch = prevLyric.match(/([ก-ฮ\u0E24\u0E26])(\s*)$/);
        if (lastConsonantMatch) {
          const consonant = lastConsonantMatch[1];
          const trailingSpaces = lastConsonantMatch[2] || '';

          // ตัดพยัญชนะออกจาก item ก่อนหน้า
          items[i - 1].lyric = prevLyric.slice(0, prevLyric.length - lastConsonantMatch[0].length) + trailingSpaces;

          // ย้ายพยัญชนะมาไว้หน้า item ปัจจุบัน
          items[i].lyric = consonant + item.lyric;
          continue;
        }
      }

      // หากไม่มีพยัญชนะก่อนหน้าเลย เป็นเครื่องหมายกำพร้าโดดๆ ให้ตัดเครื่องหมายกำพร้าออก
      items[i].lyric = item.lyric.replace(/^[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]+/, '');
    }
  }

  return items;
}
