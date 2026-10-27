import React, { useRef, useEffect, useMemo } from 'react';
import { CHORD_REGEX, isChordLine } from '../utils/chordProParser';

interface Props {
  value: string;
  onChange: (value: string) => void;
  chordColor?: string;
  placeholder?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  highlightEnabled?: boolean;
}

export const ChordProSyntaxEditor: React.FC<Props> = ({
  value,
  onChange,
  chordColor = '#38bdf8',
  placeholder,
  textareaRef: externalTextareaRef,
  highlightEnabled = true
}) => {
  const localTextareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const textareaRef = externalTextareaRef || localTextareaRef;

  // ซิงค์การเลื่อน (Scroll) ระหว่าง Textarea กับ Backdrop ให้ตรงกัน 100%
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.currentTarget.scrollTop;
      backdropRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value, textareaRef]);

  // Tokenize ข้อความเพื่อทำ Real-time Syntax Highlighting
  const highlightedNodes = useMemo(() => {
    if (!highlightEnabled) return null;

    const lines = value.split('\n');

    return lines.map((line, lineIdx) => {
      const isLastLine = lineIdx === lines.length - 1;

      // 1. ตรวจสอบ Directive เต็มบรรทัด เช่น {c: Verse 1}, {title: ...}, {key: G}
      const trimmed = line.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const isSectionDirective = /^\{(?:c|comment|section)\s*:[^}]*\}$/i.test(trimmed);
        const isMetaDirective = /^\{(?:title|t|artist|a|key|k|tempo|bpm|time|capo)\s*:[^}]*\}$/i.test(trimmed);

        let directiveColor = '#fbbf24'; // Amber สำหรับท่อนเพลง
        let bgColor = 'rgba(251, 191, 36, 0.12)';
        let shadowColor = 'rgba(251, 191, 36, 0.25)';

        if (isMetaDirective) {
          directiveColor = '#a78bfa'; // Violet สำหรับข้อมูลเพลง
          bgColor = 'rgba(167, 139, 250, 0.12)';
          shadowColor = 'rgba(167, 139, 250, 0.25)';
        } else if (!isSectionDirective) {
          directiveColor = '#34d399'; // Emerald สำหรับคำสั่งอื่นๆ
          bgColor = 'rgba(52, 211, 153, 0.12)';
          shadowColor = 'rgba(52, 211, 153, 0.25)';
        }

        return (
          <React.Fragment key={lineIdx}>
            <span
              style={{
                color: directiveColor,
                fontWeight: 700,
                backgroundColor: bgColor,
                borderRadius: '2px',
                boxShadow: `0 0 0 1px ${shadowColor}`
              }}
            >
              {line}
            </span>
            {!isLastLine && '\n'}
          </React.Fragment>
        );
      }

      // 2. ตรวจสอบหัวข้อท่อนแบบวงเล็บ เช่น [Verse 1], [Chorus], [Intro]
      const sectionMatch = trimmed.match(/^\[(Verse|Chorus|Bridge|Intro|Outro|Hook|Pre-Chorus|Solo|Tag|Ending|Interlude|Riff|Instrumental|Verse\s+\d+|Chorus\s+\d+|ท่อน\s*\w+).*\]$/i);
      if (sectionMatch) {
        return (
          <React.Fragment key={lineIdx}>
            <span
              style={{
                color: '#34d399',
                fontWeight: 700,
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                borderRadius: '2px',
                boxShadow: '0 0 0 1px rgba(52, 211, 153, 0.25)'
              }}
            >
              {line}
            </span>
            {!isLastLine && '\n'}
          </React.Fragment>
        );
      }

      // 3. ตรวจสอบบรรทัดที่เป็นคอร์ดล้วน (เช่น คอร์ดบนเนื้อเพลงแบบ 2 บรรทัด หรือ Intro : G Em C D)
      const isStandaloneChord = isChordLine(line);
      if (isStandaloneChord) {
        const tokens = line.split(/(\s+)/);
        return (
          <React.Fragment key={lineIdx}>
            {tokens.map((tok, tIdx) => {
              const clean = tok.replace(/^[|/()]+|[|/(),.:]+$/g, '').trim();
              if (clean && CHORD_REGEX.test(clean)) {
                return (
                  <span
                    key={tIdx}
                    style={{
                      color: chordColor,
                      fontWeight: 700,
                      backgroundColor: 'rgba(56, 189, 248, 0.15)',
                      borderRadius: '2px',
                      boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.25)'
                    }}
                  >
                    {tok}
                  </span>
                );
              }
              return (
                <span key={tIdx} style={{ color: '#a3a3a3' }}>
                  {tok}
                </span>
              );
            })}
            {!isLastLine && '\n'}
          </React.Fragment>
        );
      }

      // 4. บรรทัดเนื้อร้องที่มีคอร์ด ChordPro แทรก [คอร์ด]
      // Regular Expression สำหรับดึง [คอร์ด], {คำสั่ง}, หรือตัวอักษรธรรมดา
      const chordAndDirectiveRegex = /(\[[^\]\n]*\]?|\{[^}\n]*\}?)/g;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = chordAndDirectiveRegex.exec(line)) !== null) {
        const textBefore = line.slice(lastIndex, match.index);
        if (textBefore) {
          elements.push(
            <span key={`txt-${lastIndex}`} style={{ color: '#e5e5e5' }}>
              {textBefore}
            </span>
          );
        }

        const token = match[1];

        // กรณีเป็นคอร์ดในวงเล็บก้ามปู เช่น [C], [Am7], [F#m]
        if (token.startsWith('[')) {
          const inner = token.replace(/^\[|\]$/g, '').trim();
          const isSectionHeader = /^(Intro|Outro|Solo|Verse|Chorus|Bridge|Hook|Interlude|Ending)$/i.test(inner);

          if (isSectionHeader) {
            elements.push(
              <span
                key={`sec-${match.index}`}
                style={{
                  color: '#34d399',
                  fontWeight: 700,
                  backgroundColor: 'rgba(52, 211, 153, 0.12)',
                  borderRadius: '2px',
                  boxShadow: '0 0 0 1px rgba(52, 211, 153, 0.25)'
                }}
              >
                {token}
              </span>
            );
          } else if (CHORD_REGEX.test(inner) || !token.endsWith(']')) {
            // คอร์ดมาตรฐาน หรือกำลังพิมพ์คอร์ดอยู่ (ยังไม่ปิดวงเล็บ ])
            elements.push(
              <span
                key={`ch-${match.index}`}
                style={{
                  color: chordColor,
                  fontWeight: 700,
                  backgroundColor: 'rgba(56, 189, 248, 0.16)',
                  borderRadius: '2px',
                  boxShadow: '0 0 0 1px rgba(56, 189, 248, 0.25)'
                }}
              >
                {token}
              </span>
            );
          } else {
            // วงเล็บข้อความทั่วไป
            elements.push(
              <span
                key={`brk-${match.index}`}
                style={{
                  color: '#fbbf24',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)'
                }}
              >
                {token}
              </span>
            );
          }
        } else if (token.startsWith('{')) {
          // คำสั่ง Directive ในบรรทัด
          elements.push(
            <span
              key={`dir-${match.index}`}
              style={{
                color: '#fbbf24',
                fontWeight: 600,
                backgroundColor: 'rgba(251, 191, 36, 0.12)',
                borderRadius: '2px'
              }}
            >
              {token}
            </span>
          );
        }

        lastIndex = chordAndDirectiveRegex.lastIndex;
      }

      const textAfter = line.slice(lastIndex);
      if (textAfter) {
        elements.push(
          <span key={`txt-end-${lastIndex}`} style={{ color: '#e5e5e5' }}>
            {textAfter}
          </span>
        );
      }

      return (
        <React.Fragment key={lineIdx}>
          {elements}
          {!isLastLine && '\n'}
        </React.Fragment>
      );
    });
  }, [value, highlightEnabled, chordColor]);

  // สไตล์ Monospace ที่ใช้ร่วมกันทั้ง Backdrop และ Textarea เพื่อความตรงเป๊ะ 100%
  const sharedEditorStyle: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
    fontSize: '14px',
    lineHeight: 1.625,
    letterSpacing: '0px',
    tabSize: 2,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    overflowWrap: 'break-word',
    boxSizing: 'border-box'
  };

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden bg-neutral-950">
      {/* 1. Backdrop Layer สำหรับแสดง Real-time Syntax Highlighting */}
      {highlightEnabled && (
        <div
          ref={backdropRef}
          aria-hidden="true"
          className="absolute inset-0 p-4 overflow-auto pointer-events-none select-none text-neutral-200"
          style={sharedEditorStyle}
        >
          {highlightedNodes}
          {/* ช่องว่างเสริมกรณีขึ้นบรรทัดใหม่ท้ายไฟล์ เพื่อให้เลื่อนได้เท่ากับ textarea */}
          {value.endsWith('\n') && <br />}
        </div>
      )}

      {/* 2. Interactive Textarea Layer ซ้อนทับอยู่ด้านบน */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={`absolute inset-0 w-full h-full p-4 bg-transparent resize-none focus:outline-none focus:ring-0 ${
          highlightEnabled
            ? 'text-transparent caret-amber-400 selection:bg-sky-500/30 selection:text-transparent'
            : 'text-neutral-200 caret-amber-400 selection:bg-amber-500/30'
        } z-10`}
        style={sharedEditorStyle}
      />
    </div>
  );
};
