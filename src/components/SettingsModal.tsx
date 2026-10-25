import React from 'react';
import { X, Settings, Type, Columns, Eye, EyeOff, Music, Moon, Sun, Monitor, Palette, Sparkles, Check } from 'lucide-react';
import { AppSettings, AppTheme, InstrumentType, ChordNotation } from '../types/song';

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
  { name: 'Pure White', hex: '#ffffff' }
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

  const modalBg = isLight ? 'bg-white text-slate-900 border-slate-200' : 'bg-neutral-900 text-neutral-100 border-neutral-800';
  const headerBg = isLight ? 'bg-sky-50/80 border-slate-200' : 'bg-neutral-950/80 border-neutral-800';
  const cardBg = isLight ? 'bg-slate-50 border-slate-200' : 'bg-neutral-950/50 border-neutral-800/80';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog - Compact Size */}
      <div className={`relative w-full max-w-[440px] max-h-[85vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleIn ${modalBg}`}>
        {/* Header - Compact */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 ${headerBg}`}>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-blue-600 text-white' : 'bg-amber-400 text-neutral-950 font-bold'}`}>
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight">
                ตั้งค่าระบบ (Settings)
              </h2>
              <p className={`text-[11px] leading-tight ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                ปรับแต่งธีม ตัวอักษร สีคอร์ด และการแสดงผล
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-slate-200 text-slate-600' : 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body - Compact */}
        <div className="px-4 py-3.5 overflow-y-auto space-y-3.5 text-xs">
          {/* Section 1: Stage Theme */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-neutral-400">
              <Palette className="w-3 h-3 text-amber-400" />
              <span>ธีมการแสดงผล (Theme)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'stage-black',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
                  })
                }
                className={`py-2 px-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  settings.theme === 'stage-black'
                    ? 'bg-black border-amber-400 text-amber-400 font-bold ring-2 ring-amber-400/20'
                    : 'bg-black/50 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">OLED</span>
                </div>
                <span className="text-[10px] opacity-75">ดำสนิท</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'dark',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
                  })
                }
                className={`py-2 px-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'bg-[#182338] border-sky-400 text-sky-400 font-bold ring-2 ring-sky-400/20'
                    : 'bg-[#111a2c]/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Slate</span>
                </div>
                <span className="text-[10px] opacity-75">เทาน้ำเงิน</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    theme: 'light',
                    chordsColor: '#1d4ed8'
                  })
                }
                className={`py-2 px-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'bg-white border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  <span className="font-bold text-xs">Light</span>
                </div>
                <span className="text-[10px] opacity-75">สว่าง</span>
              </button>
            </div>
          </div>

          {/* Section 2: Chords Color */}
          <div className="space-y-1.5">
            <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
              สีตัวอักษรคอร์ด (Chord Color)
            </span>
            <div className="grid grid-cols-8 gap-1.5 bg-neutral-950/40 p-2 rounded-xl border border-neutral-800">
              {CHORD_COLORS.map((col) => {
                const isSelected = settings.chordsColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    title={col.name}
                    onClick={() => onUpdateSettings({ chordsColor: col.hex })}
                    className={`flex items-center justify-center p-1 rounded-lg transition-all cursor-pointer aspect-square ${
                      isSelected
                        ? 'bg-white/20 ring-2 ring-white scale-105'
                        : 'hover:bg-neutral-800/60'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-black/40 shadow-xs flex items-center justify-center"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 ${col.hex === '#ffffff' || col.hex === '#facc15' || col.hex === '#fbbf24' ? 'text-black' : 'text-white'}`} />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Font Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span>ขนาดตัวอักษรเนื้อเพลง</span>
              <span className="font-mono text-xs text-amber-400 font-bold">
                {settings.fontSize || 16}px
              </span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-950/40">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: Math.max(12, (settings.fontSize || 16) - 1) })}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center cursor-pointer text-xs"
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
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold flex items-center justify-center cursor-pointer text-xs"
              >
                A+
              </button>
            </div>
          </div>

          {/* Section 4: Columns & Show Chords */}
          <div className="grid grid-cols-2 gap-2">
            {/* Columns */}
            <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                คอลัมน์ (Columns)
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ columns: 1 })}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.columns === 1
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Columns className="w-3 h-3 rotate-90" />
                  <span>1 แถว</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ columns: 2 })}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.columns === 2
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Columns className="w-3 h-3" />
                  <span>2 แถว</span>
                </button>
              </div>
            </div>

            {/* Chords Visibility */}
            <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                แสดงคอร์ด (Chords)
              </span>
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showChords: true })}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.showChords !== false
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>แสดง</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showChords: false })}
                  className={`py-1.5 px-1.5 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    settings.showChords === false
                      ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3 h-3" />
                  <span>ซ่อน</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Instrument & Notation */}
          <div className="grid grid-cols-2 gap-2">
            {/* Default Instrument */}
            <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                เครื่องดนตรี
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
                  <button
                    key={inst}
                    type="button"
                    onClick={() => onUpdateSettings({ instrument: inst })}
                    className={`py-1.5 px-1 rounded-lg capitalize border text-[10px] font-semibold transition-all cursor-pointer text-center truncate ${
                      settings.instrument === inst
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {inst === 'guitar' ? 'กีตาร์' : inst === 'ukulele' ? 'อูคูเลเล่' : 'เปียโน'}
                  </button>
                ))}
              </div>
            </div>

            {/* Chord Notation */}
            <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
              <span className="block font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                รูปแบบตัวโน้ต
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['standard', 'solfege', 'nashville'] as ChordNotation[]).map((notat) => (
                  <button
                    key={notat}
                    type="button"
                    onClick={() => onUpdateSettings({ chordNotation: notat })}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer text-center truncate ${
                      settings.chordNotation === notat
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold shadow-xs'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-300 hover:text-white'
                    }`}
                  >
                    {notat === 'standard' ? 'C D E' : notat === 'solfege' ? 'Do Re' : '1 2 3'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 6: Auto-Scroll Speed */}
          <div className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-[10px] text-neutral-400">
                ความเร็วเลื่อนหน้าจออัตโนมัติ
              </span>
              <span className="font-mono text-xs font-bold text-amber-400">
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
        <div className={`px-4 py-2.5 border-t flex items-center justify-end shrink-0 ${headerBg}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs cursor-pointer shadow-xs transition-colors"
          >
            เรียบร้อย (Done)
          </button>
        </div>
      </div>
    </div>
  );
};

