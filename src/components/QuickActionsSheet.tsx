import React from 'react';
import { X, Sliders, RotateCcw, Printer, Edit3, Eye, EyeOff, Columns, Type } from 'lucide-react';
import { AppSettings, Song } from '../types/song';
import { transposeNote } from '../utils/chordUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  song: Song;
  transposeSemitones: number;
  onTransposeChange: (semitones: number) => void;
  capo: number;
  onCapoChange: (capo: number) => void;
  scrollSpeed: number;
  onScrollSpeedChange: (speed: number) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onEditSong: () => void;
  onPrintSong: () => void;
}

export const QuickActionsSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  song,
  transposeSemitones,
  onTransposeChange,
  capo,
  onCapoChange,
  scrollSpeed,
  onScrollSpeedChange,
  settings,
  onUpdateSettings,
  onEditSong,
  onPrintSong
}) => {
  if (!isOpen) return null;

  const effectiveKey = transposeNote(song.key || 'C', transposeSemitones);

  const isDarkSlate = settings.theme === 'dark';
  const isLight = settings.theme === 'light';

  // Compact floating panel colors with backdrop blur
  const panelBg = isLight
    ? 'bg-white/95 border-[#E6E0D4] text-[#1F1C17] shadow-xl shadow-[#1F1C17]/15'
    : isDarkSlate
    ? 'bg-[#16223B]/95 border-[#2C3D5E] text-[#E8EEF8] shadow-2xl shadow-black/60'
    : 'bg-[#1C1A16]/95 border-[#3A362F] text-[#F3EEE3] shadow-2xl shadow-black/80';

  const headerBg = isLight
    ? 'border-b border-[#E6E0D4] bg-[#F3EFE6]/80'
    : isDarkSlate
    ? 'border-b border-[#2C3D5E] bg-[#111B30]/90'
    : 'border-b border-[#2C2924] bg-[#141210]/90';

  const cardBg = isLight
    ? 'bg-[#F8F6F1] border-[#E6E0D4]'
    : isDarkSlate
    ? 'bg-[#0D1526]/60 border-[#22304A]'
    : 'bg-[#0F0E0C]/60 border-[#2C2924]';

  const controlBg = isLight
    ? 'bg-white border-[#D8D1C2] text-[#1F1C17] hover:bg-[#F0ECE2]'
    : isDarkSlate
    ? 'bg-[#16223B] border-[#2C3D5E] text-[#C9D5E8] hover:bg-[#1D2B48] hover:text-white'
    : 'bg-[#1A1815] border-[#3A362F] text-[#D9D3C5] hover:bg-[#262320] hover:text-white';

  return (
    <>
      {/* Non-intrusive backdrop: Subtle transparent overlay so lyrics remain visible behind */}
      <div
        className="fixed inset-0 z-30 bg-black/15 backdrop-blur-[0.5px] transition-opacity"
        onClick={onClose}
      />

      {/* Compact Floating Quick Actions Panel (Anchored to top-right below navbar) */}
      <aside
        className={`fixed top-14 right-2 sm:right-4 z-40 w-[295px] sm:w-[320px] max-h-[calc(100vh-4.5rem)] flex flex-col rounded-2xl border backdrop-blur-xl overflow-hidden animate-scaleIn ${panelBg}`}
        aria-label="Quick Actions"
      >
        {/* Header - Compact */}
        <div className={`px-3 py-2 flex items-center justify-between shrink-0 ${headerBg}`}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Sliders className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-[#B45309]' : isDarkSlate ? 'text-sky-400' : 'text-amber-400'}`} />
            <h3 className="font-bold text-xs tracking-tight truncate">
              แถบควบคุมด่วน (Quick Actions)
            </h3>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors cursor-pointer shrink-0 ${
              isLight ? 'text-slate-500 hover:bg-slate-200' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
            title="ปิด (Close)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Compact Controls */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-2 text-xs">
          {/* 1. Transposition Stepper */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1.5`}>
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              <span>คีย์เพลง (Key Transpose)</span>
              {transposeSemitones !== 0 && (
                <button
                  type="button"
                  onClick={() => onTransposeChange(0)}
                  className="flex items-center gap-1 text-[10px] text-amber-400 hover:underline cursor-pointer font-normal"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset ({song.key})</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-1 p-1 rounded-lg bg-neutral-950/40 border border-neutral-800/80">
              <button
                type="button"
                onClick={() => onTransposeChange(transposeSemitones - 1)}
                className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                title="ลดคีย์ -1 (♭)"
              >
                ♭ -
              </button>

              <div className="flex flex-col items-center justify-center">
                <span className="text-base font-bold font-mono text-amber-400 leading-none">
                  {effectiveKey}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono mt-0.5">
                  {transposeSemitones === 0
                    ? `ต้นฉบับ (${song.key})`
                    : `${transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones} st`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onTransposeChange(transposeSemitones + 1)}
                className="w-8 h-8 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm flex items-center justify-center cursor-pointer transition-colors"
                title="เพิ่มคีย์ +1 (♯)"
              >
                + ♯
              </button>
            </div>
          </div>

          {/* 2. Capo Quick Fret Selector */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                คาโป (Capo)
              </span>
              <span className="font-mono text-[10px] text-neutral-300 font-semibold">
                {capo === 0 ? 'ไม่ใส่ (None)' : `ช่องที่ ${capo}`}
              </span>
            </div>

            <div className="grid grid-cols-8 gap-0.5">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => onCapoChange(c)}
                  className={`py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer text-center ${
                    capo === c
                      ? 'bg-amber-400 text-neutral-950 shadow-xs'
                      : 'bg-neutral-800/80 text-neutral-300 hover:bg-neutral-700'
                  }`}
                  title={c === 0 ? 'No Capo' : `Capo Fret ${c}`}
                >
                  {c === 0 ? '0' : c}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Text Size & Layout */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1.5`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                ขนาดตัวอักษร
              </span>
              <span className="font-mono text-[10px] text-amber-400 font-bold">
                {settings.fontSize}px
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 1) })}
                className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                title="ลดขนาดตัวอักษร"
              >
                A-
              </button>
              <input
                type="range"
                min={12}
                max={30}
                step={1}
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className="flex-1 accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
              />
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontSize: Math.min(30, settings.fontSize + 1) })}
                className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-[10px] flex items-center justify-center cursor-pointer"
                title="เพิ่มขนาดตัวอักษร"
              >
                A+
              </button>
            </div>
          </div>

          {/* 4. Columns & Chords Quick Toggles */}
          <div className="grid grid-cols-2 gap-1.5">
            {/* Column Mode */}
            <div className={`p-1.5 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[9px] text-neutral-400">
                การจัดคอลัมน์
              </span>
              <div className="grid grid-cols-2 gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ columns: 1 })}
                  className={`py-1 px-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  className={`py-1 px-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
            <div className={`p-1.5 rounded-xl border ${cardBg} space-y-1`}>
              <span className="block font-bold uppercase tracking-wider text-[9px] text-neutral-400">
                การแสดงคอร์ด
              </span>
              <div className="grid grid-cols-2 gap-0.5">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ showChords: true })}
                  className={`py-1 px-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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
                  className={`py-1 px-1 rounded text-[10px] font-semibold border flex items-center justify-center gap-1 transition-all cursor-pointer ${
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

          {/* 5. Auto-scroll Speed */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-bold uppercase tracking-wider text-neutral-400">
                ความเร็วเลื่อนอัตโนมัติ
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                {scrollSpeed}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={scrollSpeed}
              onChange={(e) => onScrollSpeedChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 bg-neutral-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* 6. Quick Chord Colors */}
          <div className={`p-2 rounded-xl border ${cardBg} space-y-1`}>
            <span className="block font-bold uppercase tracking-wider text-[9px] text-neutral-400">
              สีตัวอักษรคอร์ด
            </span>
            <div className="flex items-center justify-between gap-1 pt-0.5">
              {[
                { name: 'Sky Blue', hex: '#38bdf8' },
                { name: 'Amber Gold', hex: '#fbbf24' },
                { name: 'Emerald', hex: '#34d399' },
                { name: 'Rose', hex: '#fb7185' },
                { name: 'Royal Blue', hex: '#1d4ed8' },
                { name: 'White', hex: '#ffffff' }
              ].map((col) => (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() => onUpdateSettings({ chordsColor: col.hex })}
                  className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                    settings.chordsColor === col.hex ? 'scale-125 border-white ring-1 ring-white shadow-xs' : 'border-black/30'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          {/* 7. Action Buttons (Edit & Print) */}
          <div className="grid grid-cols-2 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEditSong();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold transition-colors cursor-pointer border border-neutral-700"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              <span>แก้ไขเพลง</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onPrintSong();
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold transition-colors cursor-pointer border border-neutral-700"
            >
              <Printer className="w-3 h-3 text-sky-400" />
              <span>พิมพ์ / PDF</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
