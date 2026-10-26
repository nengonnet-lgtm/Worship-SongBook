import React from 'react';
import { X, Settings, Columns, Eye, EyeOff, Moon, Sun, Monitor, Palette, Music, Check, Sliders } from 'lucide-react';
import { AppSettings, InstrumentType, ChordNotation } from '../types/song';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const CHORD_COLORS = [
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Amber', hex: '#fbbf24' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Rose', hex: '#fb7185' },
  { name: 'Purple', hex: '#c084fc' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'White', hex: '#ffffff' }
];

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  const isLight = settings.theme === 'light';
  const isDarkSlate = settings.theme === 'dark';

  const modalBg = isLight
    ? 'bg-white text-slate-900 border-slate-200'
    : isDarkSlate
    ? 'bg-[#111c30] text-slate-100 border-slate-700/80'
    : 'bg-neutral-900 text-neutral-100 border-neutral-800';

  const headerBg = isLight
    ? 'bg-sky-50/80 border-slate-200'
    : isDarkSlate
    ? 'bg-[#0b1424] border-slate-700/80'
    : 'bg-neutral-950/80 border-neutral-800';

  const cardBg = isLight
    ? 'bg-slate-50 border-slate-200'
    : isDarkSlate
    ? 'bg-[#0b1424]/60 border-slate-800'
    : 'bg-neutral-950/50 border-neutral-800/80';

  const subtextClass = isLight ? 'text-slate-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400';
  const controlBg = isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-neutral-800/80 border-neutral-700 text-neutral-300';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog - Compact Size (max-w-[390px]) */}
      <div className={`relative w-full max-w-[390px] max-h-[82vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleIn ${modalBg}`}>
        {/* Header - Compact */}
        <div className={`px-3.5 py-2.5 border-b flex items-center justify-between shrink-0 ${headerBg}`}>
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-blue-600 text-white' : 'bg-amber-400 text-neutral-950 font-bold'}`}>
              <Settings className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm tracking-tight truncate">
                ตั้งค่าระบบ (Settings)
              </h2>
              <p className={`text-[10px] leading-tight truncate ${subtextClass}`}>
                ปรับแต่งธีม สีคอร์ด และการแสดงผล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="ปิด (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body - Dense & Clean */}
        <div className="px-3.5 py-3 overflow-y-auto space-y-2.5 text-xs">
          {/* Section 1: Stage Theme */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1.5`}>
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-neutral-400">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>ธีมการแสดงผล (Theme)</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'stage-black',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
                  })
                }
                className={`py-1.5 px-1 rounded-lg border text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'stage-black'
                    ? 'bg-black border-amber-400 text-amber-400 font-bold shadow-xs'
                    : 'bg-black/40 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span className="text-[11px] font-semibold">OLED</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'dark',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
                  })
                }
                className={`py-1.5 px-1 rounded-lg border text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-[#182338] border-sky-400 text-sky-400 font-bold shadow-xs'
                    : 'bg-[#111a2c]/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Monitor className="w-3 h-3" />
                <span className="text-[11px] font-semibold">Slate</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'light',
                    chordsColor: '#1d4ed8'
                  })
                }
                className={`py-1.5 px-1 rounded-lg border text-center flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-white border-blue-600 text-blue-700 font-bold shadow-xs'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Sun className="w-3 h-3" />
                <span className="text-[11px] font-semibold">Light</span>
              </button>
            </div>
          </div>

          {/* Section 2: Chords Color */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1.5`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span>สีคอร์ด (Chord Color)</span>
              <span className="font-mono text-[10px] text-amber-400">
                {CHORD_COLORS.find(c => c.hex === settings.chordsColor)?.name || 'Custom'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {CHORD_COLORS.map((col) => {
                const isSelected = settings.chordsColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.name}
                    onClick={() => onUpdateSettings({ chordsColor: col.hex })}
                    className={`p-0.5 rounded-full transition-transform cursor-pointer ${
                      isSelected ? 'ring-2 ring-white scale-110' : 'hover:scale-105 opacity-85 hover:opacity-100'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/30 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-2.5 h-2.5 ${col.hex === '#ffffff' || col.hex === '#facc15' || col.hex === '#fbbf24' ? 'text-black stroke-[3]' : 'text-white stroke-[3]'}`} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Font Size */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1.5`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span>ขนาดตัวอักษรเนื้อเพลง</span>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {settings.fontSize || 16}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: Math.max(12, (settings.fontSize || 16) - 1) })}
                className="w-6 h-6 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                title="ลดขนาดตัวอักษร"
              >
                A-
              </button>
              <input
                type="range"
                min={12}
                max={30}
                step={1}
                value={settings.fontSize || 16}
                onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-neutral-700 rounded-lg appearance-none"
              />
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: Math.min(30, (settings.fontSize || 16) + 1) })}
                className="w-6 h-6 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center cursor-pointer text-[10px]"
                title="เพิ่มขนาดตัวอักษร"
              >
                A+
              </button>
            </div>
          </div>

          {/* Section 4: Columns & Show Chords (Side-by-side) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Columns */}
            <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                คอลัมน์ (Columns)
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ columns: 1 })}
                  className={`py-1 px-1 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.columns === 1
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : controlBg
                  }`}
                >
                  <Columns className="w-2.5 h-2.5 rotate-90" />
                  <span>1 แถว</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ columns: 2 })}
                  className={`py-1 px-1 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.columns === 2
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : controlBg
                  }`}
                >
                  <Columns className="w-2.5 h-2.5" />
                  <span>2 แถว</span>
                </button>
              </div>
            </div>

            {/* Chords Visibility */}
            <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                แสดงคอร์ด (Chords)
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showChords: true })}
                  className={`py-1 px-1 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.showChords !== false
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : controlBg
                  }`}
                >
                  <Eye className="w-2.5 h-2.5" />
                  <span>แสดง</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showChords: false })}
                  className={`py-1 px-1 rounded-lg border text-[10px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.showChords === false
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : controlBg
                  }`}
                >
                  <EyeOff className="w-2.5 h-2.5" />
                  <span>ซ่อน</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Instrument & Notation (Side-by-side) */}
          <div className="grid grid-cols-2 gap-2">
            {/* Instrument */}
            <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                เครื่องดนตรี
              </span>
              <div className="grid grid-cols-3 gap-0.5">
                {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => onUpdateSettings({ instrument: inst })}
                    className={`py-1 px-0.5 rounded-md border text-[9px] font-semibold transition-all cursor-pointer text-center truncate ${
                      settings.instrument === inst
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                        : controlBg
                    }`}
                  >
                    {inst === 'guitar' ? 'กีตาร์' : inst === 'ukulele' ? 'อูคู' : 'เปียโน'}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Notation */}
            <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                รูปแบบตัวโน้ต
              </span>
              <div className="grid grid-cols-3 gap-0.5">
                {(['standard', 'solfege', 'nashville'] as ChordNotation[]).map((notat) => (
                  <button
                    key={notat}
                    type="button"
                    onClick={() => onUpdateSettings({ chordNotation: notat })}
                    className={`py-1 px-0.5 rounded-md border text-[9px] font-semibold transition-all cursor-pointer text-center truncate ${
                      settings.chordNotation === notat
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                        : controlBg
                    }`}
                  >
                    {notat === 'standard' ? 'C D E' : notat === 'solfege' ? 'Do Re' : '1 2 3'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Auto-Scroll Speed */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                ความเร็วเลื่อนหน้าจอ (Auto-scroll)
              </span>
              <span className="font-mono text-[11px] font-bold text-amber-400">
                ระดับ {settings.autoScrollSpeed || 3}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={settings.autoScrollSpeed || 3}
              onChange={(e) => onUpdateSettings({ autoScrollSpeed: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-neutral-700 rounded-lg appearance-none"
            />
          </div>
        </div>

        {/* Footer - Compact */}
        <div className={`px-3.5 py-2 border-t flex items-center justify-end shrink-0 ${headerBg}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            เรียบร้อย (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
