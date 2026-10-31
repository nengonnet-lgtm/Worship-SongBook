import React, { useState, useMemo } from 'react';
import { KEYS, getSemitonesBetweenKeys, transposeNote } from '../utils/chordUtils';
import { getThemeStyles } from '../utils/themeStyles';
import {
  ChevronLeft,
  ChevronRight,
  Music,
  Plus,
  Sparkles,
  Layers,
  Wand2,
  Hash
} from 'lucide-react';

interface Props {
  currentKey: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onInsertChord: (chord: string) => void;
  usedChords: string[];
  theme?: string;
}

export const ChordHelperSidebar: React.FC<Props> = ({
  currentKey,
  isCollapsed,
  onToggleCollapse,
  onInsertChord,
  usedChords,
  theme
}) => {
  const t = getThemeStyles(theme);
  const [activeTab, setActiveTab] = useState<'key' | 'custom' | 'symbols'>('key');
  const [selectedRoot, setSelectedRoot] = useState('C');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [selectedBass, setSelectedBass] = useState('');

  // คำนวณคอร์ดในคีย์ปัจจุบัน (Diatonic Chords & Extensions)
  const keyChords = useMemo(() => {
    const semitones = getSemitonesBetweenKeys('C', currentKey || 'C');
    const safeKey = currentKey || 'C';

    // คอร์ดหลักในคีย์ C
    const basePrimary = [
      { degree: 'I', chord: 'C' },
      { degree: 'IV', chord: 'F' },
      { degree: 'V', chord: 'G' },
      { degree: 'vi', chord: 'Am' }
    ];

    // คอร์ดรองในคีย์ C
    const baseSecondary = [
      { degree: 'ii', chord: 'Dm' },
      { degree: 'iii', chord: 'Em' },
      { degree: 'vii°', chord: 'Bdim' }
    ];

    // คอร์ดเบสยอดนิยม (Slash Chords) ในคีย์ C
    const baseSlash = [
      { label: 'V/3', chord: 'G/B' },
      { label: 'I/3', chord: 'C/E' },
      { label: 'V/7', chord: 'D/F#' },
      { label: 'IV/6', chord: 'F/A' }
    ];

    // คอร์ดต่อขยายยอดนิยม (Worship Extensions) ในคีย์ C
    const baseExtensions = [
      'Csus4', 'Gsus4', 'Dsus4', 'Asus4',
      'Cadd9', 'Gadd9', 'Fadd9',
      'Cmaj7', 'Fmaj7', 'G7',
      'Am7', 'Em7', 'Dm7'
    ];

    return {
      primary: basePrimary.map(item => ({
        degree: item.degree,
        chord: transposeNote(item.chord, semitones, safeKey)
      })),
      secondary: baseSecondary.map(item => ({
        degree: item.degree,
        chord: transposeNote(item.chord, semitones, safeKey)
      })),
      slash: baseSlash.map(item => ({
        label: item.label,
        chord: transposeNote(item.chord, semitones, safeKey)
      })),
      extensions: baseExtensions.map(c => transposeNote(c, semitones, safeKey))
    };
  }, [currentKey]);

  // คอร์ดอิสระที่สร้างขึ้นจาก Custom Builder
  const customChord = useMemo(() => {
    let result = selectedRoot + selectedQuality;
    if (selectedBass && selectedBass !== selectedRoot) {
      result += '/' + selectedBass;
    }
    return result;
  }, [selectedRoot, selectedQuality, selectedBass]);

  // กรณีแถบคอร์ดถูกยุบ (Collapsed Mode)
  if (isCollapsed) {
    return (
      <div className={`w-11 shrink-0 border-r flex flex-col items-center py-2.5 gap-2 select-none z-10 transition-all duration-200 ${t.dialog}`}>
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors shadow-xs ${t.ghostBtn}`}
          title="ขยายแถบตัวช่วยแทรกคอร์ด (Expand Chord Sidebar)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* ป้ายแสดงคีย์ย่อ */}
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold"
          style={{
            backgroundColor: `${t.signalHex}22`,
            border: `1px solid ${t.signalHex}55`,
            color: t.signalHex
          }}
        >
          {currentKey}
        </div>

        {/* ข้อความแนวตั้ง */}
        <div
          onClick={onToggleCollapse}
          className={`my-1 cursor-pointer py-2 text-[10px] font-bold tracking-wider transition-colors ${t.textMuted} hover:opacity-100`}
          style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
        >
          คอร์ดด่วน
        </div>

        {/* ปุ่มลัดคอร์ดหลักแบบย่อ */}
        <div className="flex-1 w-full flex flex-col items-center gap-1 overflow-y-auto scrollbar-none px-1">
          {keyChords.primary.map((item) => (
            <button
              key={item.chord}
              type="button"
              onClick={() => onInsertChord(item.chord)}
              className={`w-full py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer text-center truncate ${t.ghostBtn}`}
              title={`แทรก [${item.chord}] (${item.degree})`}
            >
              {item.chord}
            </button>
          ))}

          {/* คอร์ดที่ใช้ในเพลง (3 คอร์ดแรก) */}
          {usedChords.slice(0, 3).map((chord) => (
            <button
              key={chord}
              type="button"
              onClick={() => onInsertChord(chord)}
              className="w-full py-1 text-[10px] font-bold rounded border transition-colors cursor-pointer text-center truncate"
              style={{
                backgroundColor: `${t.signalHex}18`,
                borderColor: `${t.signalHex}44`,
                color: t.signalHex
              }}
              title={`แทรก [${chord}]`}
            >
              {chord}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // กรณีแถบคอร์ดเปิดอยู่ (Expanded Mode)
  return (
    <div className={`w-60 sm:w-64 shrink-0 border-r flex flex-col h-full overflow-hidden select-none z-10 transition-all duration-200 ${t.dialog}`}>
      {/* 1. Header Bar */}
      <div className={`px-3 py-2 border-b flex items-center justify-between shrink-0 ${t.dialogBar}`}>
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
            style={{
              backgroundColor: `${t.signalHex}22`,
              color: t.signalHex
            }}
          >
            <Music className="w-3.5 h-3.5" />
          </div>
          <span className={`font-bold text-xs truncate ${t.textStrong}`}>
            ตัวช่วยแทรกคอร์ด
          </span>
          <span
            className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono"
            style={{
              backgroundColor: `${t.signalHex}22`,
              color: t.signalHex
            }}
          >
            {currentKey}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className={`p-1 rounded-md cursor-pointer transition-colors ${t.iconBtn}`}
          title="ยุบแถบคอร์ด (Collapse Sidebar)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Sub Tabs */}
      <div className={`flex items-center p-1 border-b text-[11px] font-medium shrink-0 gap-1 ${t.dialogBar}`}>
        <button
          type="button"
          onClick={() => setActiveTab('key')}
          className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer border ${
            activeTab === 'key'
              ? t.segOn
              : t.segOff
          }`}
        >
          คีย์ {currentKey}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer border ${
            activeTab === 'custom'
              ? t.segOn
              : t.segOff
          }`}
        >
          สร้างคอร์ด
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('symbols')}
          className={`flex-1 py-1 rounded text-center transition-colors cursor-pointer border ${
            activeTab === 'symbols'
              ? t.segOn
              : t.segOff
          }`}
        >
          สัญลักษณ์
        </button>
      </div>

      {/* 3. Main Content Area */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 scrollbar-thin">
        {/* คอร์ดที่ใช้ในเพลงปัจจุบัน (แสดงเสมอ) */}
        {usedChords.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                style={{ color: t.signalHex }}
              >
                <Sparkles className="w-2.5 h-2.5" />
                ใช้ในเพลงนี้ ({usedChords.length})
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {usedChords.map((chord) => (
                <button
                  key={chord}
                  type="button"
                  onClick={() => onInsertChord(chord)}
                  className="px-1 py-1 text-xs font-bold font-mono rounded border transition-colors cursor-pointer truncate text-center shadow-xs"
                  style={{
                    backgroundColor: `${t.signalHex}18`,
                    borderColor: `${t.signalHex}44`,
                    color: t.signalHex
                  }}
                  title={`แทรก [${chord}]`}
                >
                  {chord}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: คอร์ดในคีย์ปัจจุบัน (Diatonic & Worship Chords) */}
        {activeTab === 'key' && (
          <div className="space-y-3">
            {/* คอร์ดหลักในคีย์ (I, IV, V, vi) */}
            <div>
              <span
                className="block text-[10px] font-bold uppercase tracking-wider mb-1.5"
                style={{ color: t.signalHex }}
              >
                คอร์ดหลัก (Primary Chords)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {keyChords.primary.map((item) => (
                  <button
                    key={item.chord}
                    type="button"
                    onClick={() => onInsertChord(item.chord)}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer group flex flex-col items-center justify-center shadow-xs ${t.ghostBtn}`}
                  >
                    <span
                      className="font-bold text-sm font-mono tracking-tight group-hover:scale-105 transition-transform"
                      style={{ color: t.signalHex }}
                    >
                      {item.chord}
                    </span>
                    <span className={`text-[9px] font-mono ${t.textMuted}`}>
                      ท่อนหลัก ({item.degree})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* คอร์ดรองในคีย์ (ii, iii, vii°) */}
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                คอร์ดรอง (Secondary Chords)
              </span>
              <div className="grid grid-cols-3 gap-1">
                {keyChords.secondary.map((item) => (
                  <button
                    key={item.chord}
                    type="button"
                    onClick={() => onInsertChord(item.chord)}
                    className={`py-1 px-1 rounded border text-xs font-mono font-semibold transition-colors cursor-pointer text-center ${t.ghostBtn}`}
                    title={`${item.degree}`}
                  >
                    {item.chord}
                  </button>
                ))}
              </div>
            </div>

            {/* คอร์ดเบสยอดนิยม (Slash Chords) */}
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                คอร์ดเบส (Slash Chords)
              </span>
              <div className="grid grid-cols-2 gap-1">
                {keyChords.slash.map((item) => (
                  <button
                    key={item.chord}
                    type="button"
                    onClick={() => onInsertChord(item.chord)}
                    className={`py-1 px-1.5 rounded border text-xs font-mono font-semibold transition-colors cursor-pointer text-center truncate ${t.ghostBtn}`}
                    title={`คอร์ดส่ง ${item.label}`}
                  >
                    {item.chord}
                  </button>
                ))}
              </div>
            </div>

            {/* คอร์ดขยายยอดนิยม (Worship Extensions: sus4, add9, 7) */}
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                คอร์ดสีสัน (Extensions: sus4, add9, 7)
              </span>
              <div className="grid grid-cols-3 gap-1">
                {keyChords.extensions.map((chord) => (
                  <button
                    key={chord}
                    type="button"
                    onClick={() => onInsertChord(chord)}
                    className={`py-1 px-1 rounded border text-[11px] font-mono font-medium transition-colors cursor-pointer text-center truncate ${t.ghostBtn}`}
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: สร้างคอร์ดอิสระ (Custom Chord Builder) */}
        {activeTab === 'custom' && (
          <div className="space-y-3">
            {/* โน้ตตัวต้น (Root Note) */}
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>
                1. ตัวโน้ตหลัก (Root)
              </span>
              <div className="grid grid-cols-4 gap-1">
                {['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedRoot(n)}
                    className={`py-1 text-xs font-bold font-mono rounded border transition-colors cursor-pointer ${
                      selectedRoot === n
                        ? t.segOn
                        : t.segOff
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* ชนิดคอร์ด (Quality) */}
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>
                2. ประเภทคอร์ด (Quality)
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: 'Major', val: '' },
                  { label: 'm (Minor)', val: 'm' },
                  { label: '7', val: '7' },
                  { label: 'maj7', val: 'maj7' },
                  { label: 'm7', val: 'm7' },
                  { label: 'sus4', val: 'sus4' },
                  { label: 'sus2', val: 'sus2' },
                  { label: 'add9', val: 'add9' },
                  { label: 'dim', val: 'dim' },
                  { label: 'aug', val: 'aug' },
                  { label: '6', val: '6' },
                  { label: '2', val: '2' }
                ].map((q) => (
                  <button
                    key={q.label}
                    type="button"
                    onClick={() => setSelectedQuality(q.val)}
                    className={`py-1 text-[11px] font-mono rounded border transition-colors cursor-pointer ${
                      selectedQuality === q.val
                        ? t.segOn
                        : t.segOff
                    }`}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            {/* โน้ตเบส (Bass Note) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${t.textMuted}`}>
                  3. โน้ตเบส (/Bass - เสริม)
                </span>
                {selectedBass && (
                  <button
                    type="button"
                    onClick={() => setSelectedBass('')}
                    className={`text-[9px] cursor-pointer ${t.textMuted} hover:opacity-100`}
                  >
                    ลบเบส
                  </button>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {['', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'B'].map((b) => (
                  <button
                    key={b || 'none'}
                    type="button"
                    onClick={() => setSelectedBass(b)}
                    className={`py-1 text-xs font-mono rounded border transition-colors cursor-pointer ${
                      selectedBass === b
                        ? t.segOn
                        : t.segOff
                    }`}
                  >
                    {b ? `/${b}` : 'ไม่มี'}
                  </button>
                ))}
              </div>
            </div>

            {/* ปุ่มแทรกคอร์ดที่สร้างขึ้น */}
            <div className={`pt-2 border-t ${t.popoverDivider}`}>
              <button
                type="button"
                onClick={() => onInsertChord(customChord)}
                className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors ${t.accentBtn}`}
              >
                <Plus className="w-4 h-4" />
                <span>แทรกคอร์ด [{customChord}]</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: เครื่องหมายและจังหวะ (Musical Symbols & Directives) */}
        {activeTab === 'symbols' && (
          <div className="space-y-3">
            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                รอบการเล่น / ห้องเพลง
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {['(2 รอบ)', '(4 รอบ)', '| / / / / |', '| / / |', '(หยุด)', '(ดนตรี)'].map((sym) => (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onInsertChord(` ${sym} `)}
                    className={`py-1.5 px-2 rounded border text-xs font-mono transition-colors cursor-pointer text-center ${t.ghostBtn}`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className={`block text-[10px] font-bold uppercase tracking-wider mb-1.5 ${t.textMuted}`}>
                หัวข้อท่อนเพลง (ChordPro Directives)
              </span>
              <div className="space-y-1">
                {[
                  '{c: Intro}',
                  '{c: Verse 1}',
                  '{c: Verse 2}',
                  '{c: Pre-Chorus}',
                  '{c: Chorus}',
                  '{c: Bridge}',
                  '{c: Solo}',
                  '{c: Outro}'
                ].map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => onInsertChord(`\n${dir}\n`)}
                    className={`w-full py-1 px-2.5 rounded border text-xs font-mono text-left transition-colors cursor-pointer flex items-center justify-between ${t.ghostBtn}`}
                  >
                    <span style={{ color: t.signalHex }}>{dir}</span>
                    <span className={`text-[10px] ${t.textMuted}`}>แทรก</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Footer Help Tip */}
      <div className={`p-2 border-t text-[10px] ${t.textMuted} text-center shrink-0 ${t.dialogBar}`}>
        คลิกที่คอร์ดเพื่อแทรกตรงตำแหน่งเคอร์เซอร์
      </div>
    </div>
  );
};
