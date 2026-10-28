import React from 'react';
import './chordSheetFont.css';
import { layoutChordLine } from '../utils/chordProParser';
import type { ParsedLineItem } from '../utils/chordProParser';

/**
 * ChordLine — แสดงคอร์ดเหนือเนื้อเพลง 1 บรรทัด
 *
 * โหมด A "ตรงกับ Editor" (ใช้เมื่อทุกคอร์ดมีคอลัมน์ต้นฉบับ item.col จากช่อง Editor แบบ 2 บรรทัด)
 *   วางคอร์ดที่คอลัมน์เดิมเป๊ะ ๆ ด้วยฟอนต์/ขนาดเดียวกับช่อง Editor จึงเห็นตำแหน่งเหมือน Editor
 *   (ตำแหน่งยึดใน ChordPro ถูกเลื่อนไปหน้าพยัญชนะเมื่อคอร์ดตกก่อนสระ/วรรณยุกต์ ทำให้คอร์ดเลื่อนซ้ายไป 1 ช่อง
 *    จึงต้องใช้คอลัมน์เดิมแทนตำแหน่งยึด)
 *
 * โหมด B "ผูกกับตัวอักษร" (ใช้เมื่อไม่มีคอลัมน์ต้นฉบับ เช่น เพลงที่เก็บเป็น [คอร์ด] แทรกในเนื้อ)
 *   แต่ละ item เป็นคอลัมน์เล็ก ๆ คอร์ดอยู่เหนือเนื้อร้องช่วงนั้น ไม่ขึ้นกับความกว้างฟอนต์ของอุปกรณ์
 *
 * ทั้งสองโหมดใส่ text-size-adjust: 100% กัน iOS Safari ขยายขนาดตัวอักษรของบรรทัดคอร์ดกับเนื้อร้องไม่เท่ากัน
 */

interface ChordLineProps {
  items: ParsedLineItem[];
  showChords?: boolean;
  chordColor?: string;
  lyricClassName?: string;
  onChordClick?: (chord: string) => void;
}

const NO_AUTOSIZE = {
  letterSpacing: 0,
  WebkitTextSizeAdjust: '100%',
  textSizeAdjust: '100%'
} as React.CSSProperties;

const ANCHORED_ROOT_STYLE = {
  ...NO_AUTOSIZE,
  display: 'flex',
  alignItems: 'flex-start',
  width: 'max-content',
  minWidth: '100%',
  whiteSpace: 'pre'
} as React.CSSProperties;

const COLUMN_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 auto'
};

export const ChordLine: React.FC<ChordLineProps> = ({
  items,
  showChords = true,
  chordColor,
  lyricClassName = '',
  onChordClick
}) => {
  if (!items || items.length === 0) return null;

  const hasChord = showChords && items.some((it) => Boolean(it.chord));

  // ไม่แสดงคอร์ด: ต่อเนื้อร้องเป็นข้อความเดียว ไม่แบ่ง text run
  if (!hasChord) {
    const text = items.map((it) => it.lyric || '').join('');
    if (!text.trim()) return null;
    return (
      <div
        className={`chord-sheet-font leading-tight select-none whitespace-pre ${lyricClassName}`}
        style={NO_AUTOSIZE}
      >
        {text}
      </div>
    );
  }

  const layout = layoutChordLine(items);

  // ---------- โหมด A: ตรงกับ Editor ----------
  if (layout.hasExactColumns) {
    return (
      <div className="chord-sheet-font leading-tight select-none" style={NO_AUTOSIZE}>
        {layout.chordLine.trim() && (
          <div className="whitespace-pre font-bold block" style={{ color: chordColor }}>
            {layout.chordLine.split(/(\s+)/).map((token, tIdx) => {
              if (token && token.trim()) {
                return (
                  <span
                    key={tIdx}
                    onClick={onChordClick ? () => onChordClick(token) : undefined}
                    className={onChordClick ? 'cursor-pointer hover:underline active:opacity-70' : undefined}
                    title={onChordClick ? `ดูคอร์ด ${token}` : undefined}
                  >
                    {token}
                  </span>
                );
              }
              return token;
            })}
          </div>
        )}
        {layout.lyricLine.trim() ? (
          <div className={`whitespace-pre block ${lyricClassName}`}>{layout.lyricLine}</div>
        ) : null}
      </div>
    );
  }

  // ---------- โหมด B: ผูกกับตัวอักษร ----------
  const hasLyric = items.some((it) => (it.lyric || '').trim().length > 0);

  return (
    <div className="chord-sheet-font leading-tight select-none" style={ANCHORED_ROOT_STYLE}>
      {items.map((item, idx) => {
        const chord = item.chord || '';
        const lyric = item.lyric || '';
        return (
          <div key={idx} style={COLUMN_STYLE}>
            {/* แถวคอร์ด: เว้นขวา 0.75em กันคอร์ดที่อยู่ติดกันชนกัน */}
            <span
              onClick={chord && onChordClick ? () => onChordClick(chord) : undefined}
              className={chord && onChordClick ? 'cursor-pointer hover:underline active:opacity-70' : undefined}
              title={chord && onChordClick ? `ดูคอร์ด ${chord}` : undefined}
              style={{
                color: chordColor,
                fontWeight: 700,
                minHeight: '1.25em',
                paddingRight: chord ? '0.75em' : 0
              }}
            >
              {chord || '\u00A0'}
            </span>

            {/* แถวเนื้อร้อง: ถ้าทั้งบรรทัดเป็นคอร์ดล้วน ซ่อนความสูงแต่ยังคงความกว้างช่องว่างไว้ */}
            <span
              className={lyricClassName}
              style={hasLyric ? undefined : { height: 0, overflow: 'hidden' }}
            >
              {lyric}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ChordLine;
