import React, { useLayoutEffect, useRef, useState } from 'react';
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
 * ตัดบรรทัดอัตโนมัติ (ใหม่)
 *   บรรทัดที่พอดีความกว้างจะแสดงเหมือนเดิมทุกประการ (โหมด A/B ข้างบน)
 *   เฉพาะบรรทัดที่กว้างเกินพื้นที่ (เช่น iPad แนวตั้ง, ฟอนต์ใหญ่) จะถูกแบ่งเป็นช่วง ๆ ตามตำแหน่งคอร์ด
 *   แต่ละช่วงเป็นคอลัมน์ "คอร์ดอยู่เหนือเนื้อร้องช่วงนั้น" แล้วตัดขึ้นบรรทัดใหม่ได้ คอร์ดจึงไม่หลุดจากคำที่กำกับ
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

const WRAPPED_ROOT_STYLE = {
  ...NO_AUTOSIZE,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  rowGap: '0.4em',
  width: '100%',
  whiteSpace: 'pre-wrap',
  overflowWrap: 'break-word'
} as React.CSSProperties;

const COLUMN_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 auto'
};

const WRAPPED_COLUMN_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  flex: '0 1 auto',
  minWidth: 0,
  maxWidth: '100%'
};

// สระบน/ล่างและวรรณยุกต์ไทย: เริ่มช่วงใหม่ด้วยตัวเหล่านี้ไม่ได้
const THAI_COMBINING = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/;

interface Chunk {
  chord: string;
  lyric: string;
}

/** แบ่งบรรทัดโหมด A (คอร์ด 1 บรรทัด + เนื้อ 1 บรรทัด) เป็นช่วง ๆ ตามคอลัมน์ของแต่ละคอร์ด */
function chunksFromColumns(chordLine: string, lyricLine: string): Chunk[] {
  const chords: { text: string; col: number }[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(chordLine))) chords.push({ text: m[0], col: m.index });

  const starts: number[] = [];
  chords.forEach((c, i) => {
    let col = Math.min(c.col, lyricLine.length);
    while (col > 0 && THAI_COMBINING.test(lyricLine[col] ?? '')) col--;
    starts.push(Math.max(col, i > 0 ? starts[i - 1] : 0));
  });

  const chunks: Chunk[] = [];
  const firstStart = starts.length ? starts[0] : lyricLine.length;
  if (lyricLine.slice(0, firstStart)) chunks.push({ chord: '', lyric: lyricLine.slice(0, firstStart) });
  chords.forEach((c, i) => {
    chunks.push({
      chord: c.text,
      lyric: lyricLine.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : undefined)
    });
  });
  return chunks;
}

export const ChordLine: React.FC<ChordLineProps> = ({
  items,
  showChords = true,
  chordColor,
  lyricClassName = '',
  onChordClick
}) => {
  // Hooks first (the early returns below must not change the hook order)
  const outerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  // Start wrapped: a wrapped line can never push its parent wider than the screen.
  // The layout effect below switches to the exact layout before the first paint when it fits.
  const [wrapped, setWrapped] = useState(true);

  const update = () => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure) return;
    setWrapped(measure.offsetWidth > outer.clientWidth + 1);
  };

  useLayoutEffect(() => {
    update();
  });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const measure = measureRef.current;
    if (!outer || !measure || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    ro.observe(measure);
    return () => ro.disconnect();
  }, []);

  if (!items || items.length === 0) return null;

  const hasChord = showChords && items.some((it) => Boolean(it.chord));

  // ไม่แสดงคอร์ด: ต่อเนื้อร้องเป็นข้อความเดียว ตัดบรรทัดได้ตามปกติ
  if (!hasChord) {
    const text = items.map((it) => it.lyric || '').join('');
    if (!text.trim()) return null;
    return (
      <div
        className={`chord-sheet-font leading-tight select-none whitespace-pre-wrap ${lyricClassName}`}
        style={{ ...NO_AUTOSIZE, overflowWrap: 'break-word' }}
      >
        {text}
      </div>
    );
  }

  const layout = layoutChordLine(items);
  const hasLyric = items.some((it) => (it.lyric || '').trim().length > 0);

  const chordSpan = (chord: string, interactive: boolean, extra?: React.CSSProperties) => (
    <span
      onClick={interactive && chord && onChordClick ? () => onChordClick(chord) : undefined}
      className={interactive && chord && onChordClick ? 'cursor-pointer hover:underline active:opacity-70' : undefined}
      title={interactive && chord && onChordClick ? `ดูคอร์ด ${chord}` : undefined}
      style={{
        color: chordColor,
        fontWeight: 700,
        minHeight: '1.25em',
        paddingRight: chord ? '0.75em' : 0,
        ...extra
      }}
    >
      {chord || '\u00A0'}
    </span>
  );

  /** คอลัมน์ "คอร์ดเหนือเนื้อร้อง" ใช้ทั้งโหมด B และบรรทัดที่ถูกตัด */
  const renderColumns = (chunks: Chunk[], interactive: boolean, column: React.CSSProperties) =>
    chunks.map((chunk, idx) => (
      <div key={idx} style={column}>
        {chordSpan(chunk.chord, interactive)}
        <span className={lyricClassName} style={hasLyric ? undefined : { height: 0, overflow: 'hidden' }}>
          {chunk.lyric}
        </span>
      </div>
    ));

  // ---------- ความกว้างปกติ (ไม่ตัดบรรทัด) ----------
  const renderExact = (interactive: boolean) => {
    // โหมด A: ตรงกับ Editor
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
                      onClick={interactive && onChordClick ? () => onChordClick(token) : undefined}
                      className={
                        interactive && onChordClick ? 'cursor-pointer hover:underline active:opacity-70' : undefined
                      }
                      title={interactive && onChordClick ? `ดูคอร์ด ${token}` : undefined}
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

    // โหมด B: ผูกกับตัวอักษร
    return (
      <div className="chord-sheet-font leading-tight select-none" style={ANCHORED_ROOT_STYLE}>
        {renderColumns(
          items.map((it) => ({ chord: it.chord || '', lyric: it.lyric || '' })),
          interactive,
          COLUMN_STYLE
        )}
      </div>
    );
  };

  // ---------- บรรทัดที่กว้างเกิน: แบ่งเป็นช่วง ๆ แล้วตัดขึ้นบรรทัดใหม่ ----------
  const renderWrapped = () => {
    // คอร์ดล้วน (เช่น Intro): ตัดที่ช่องว่างระหว่างคอร์ด
    if (layout.hasExactColumns && !layout.lyricLine.trim()) {
      return (
        <div
          className="chord-sheet-font leading-tight select-none whitespace-pre-wrap font-bold"
          style={{ ...NO_AUTOSIZE, color: chordColor }}
        >
          {layout.chordLine.split(/(\s+)/).map((token, tIdx) =>
            token && token.trim() ? (
              <span
                key={tIdx}
                onClick={onChordClick ? () => onChordClick(token) : undefined}
                className={onChordClick ? 'cursor-pointer hover:underline active:opacity-70' : undefined}
              >
                {token}
              </span>
            ) : (
              token
            )
          )}
        </div>
      );
    }

    const chunks = layout.hasExactColumns
      ? chunksFromColumns(layout.chordLine, layout.lyricLine)
      : items.map((it) => ({ chord: it.chord || '', lyric: it.lyric || '' }));

    return (
      <div className="chord-sheet-font leading-tight select-none" style={WRAPPED_ROOT_STYLE}>
        {renderColumns(chunks, true, WRAPPED_COLUMN_STYLE)}
      </div>
    );
  };

  return (
    <div ref={outerRef} style={{ position: 'relative', width: '100%', minWidth: 0, overflow: 'hidden' }}>
      {/* ตัววัดความกว้างจริงของบรรทัด (ซ่อน ไม่กินที่) ใช้ตัดสินว่าต้องตัดบรรทัดหรือไม่ */}
      <div
        ref={measureRef}
        aria-hidden="true"
        data-chord-measure=""
        className="print:hidden"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 'max-content',
          height: 0,
          overflow: 'hidden',
          visibility: 'hidden',
          pointerEvents: 'none'
        }}
      >
        {renderExact(false)}
      </div>

      <div className="print:hidden">{wrapped ? renderWrapped() : renderExact(true)}</div>

      {/* Printed page: the exact layout (chords at the same positions as on screen). It is never wrapped;
          SongViewer shrinks the printed font size just enough for the widest line to fit the paper. */}
      <div className="hidden print:block">{renderExact(true)}</div>
    </div>
  );
};

export default ChordLine;
