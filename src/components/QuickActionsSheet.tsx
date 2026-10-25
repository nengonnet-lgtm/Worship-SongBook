import React from 'react';
import { X, Sliders, Type, Columns, Eye, EyeOff, Music, RotateCcw, Printer, Edit3 } from 'lucide-react';
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
  const isStageBlack = settings.theme === 'stage-black';

  const sheetBg = isLight
    ? 'bg-white border-l border-blue-200 text-slate-900'
    : isDarkSlate
    ? 'bg-[#182338] border-l border-slate-700 text-slate-100'
    : 'bg-neutral-900 border-l border-neutral-800 text-neutral-100';

  const headerBg = isLight
    ? 'border-b border-blue-100 bg-sky-50/70'
    : isDarkSlate
    ? 'border-b border-slate-700 bg-[#0f172a]'
    : 'border-b border-neutral-800 bg-neutral-950/80';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Sheet */}
      <div className={`relative w-76 sm:w-84 h-full flex flex-col shadow-2xl z-10 overflow-hidden ${sheetBg}`}>
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between ${headerBg}`}>
          <div className="flex items-center gap-2">
            <Sliders className={`w-4 h-4 ${isLight ? 'text-blue-700' : isDarkSlate ? 'text-sky-400' : 'text-amber-400'}`} />
            <h3 className="font-bold text-sm tracking-tight">คอร์ด & ควบคุม (Quick Actions)</h3>
          </div>

          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isLight ? 'text-neutral-500 hover:bg-neutral-200' : isDarkSlate ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Controls */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 text-xs">
          {/* Transposition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Transposition
              </span>
              {transposeSemitones !== 0 && (
                <button
                  onClick={() => onTransposeChange(0)}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset ({song.key})</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => onTransposeChange(transposeSemitones - 1)}
                className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                title="Transpose -1 semitone"
              >
                ♭ -
              </button>

              <div className="flex flex-col items-center">
                <span className="text-xl font-bold font-mono text-amber-400">
                  {effectiveKey}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  {transposeSemitones === 0
                    ? `Original: ${song.key}`
                    : `${transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones} Semitones`}
                </span>
              </div>

              <button
                onClick={() => onTransposeChange(transposeSemitones + 1)}
                className="w-10 h-10 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-base flex items-center justify-center cursor-pointer transition-colors"
                title="Transpose +1 semitone"
              >
                + ♯
              </button>
            </div>
          </div>

          {/* Capo */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Capo Fret
              </span>
              <span className="font-mono text-xs text-neutral-300">
                {capo === 0 ? 'None' : `Capo ${capo}`}
              </span>
            </div>

            <div className="grid grid-cols-6 gap-1.5">
              {[0, 1, 2, 3, 4, 5].map((c) => (
                <button
                  key={c}
                  onClick={() => onCapoChange(c)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    capo === c
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  {c === 0 ? 'None' : c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[6, 7, 8, 9].map((c) => (
                <button
                  key={c}
                  onClick={() => onCapoChange(c)}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    capo === c
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  Capo {c}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size & Layout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Text Size ({settings.fontSize}px)
              </span>
            </div>

            <div className="flex items-center gap-3 p-2 rounded-xl bg-neutral-950 border border-neutral-800">
              <button
                onClick={() => onUpdateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                A-
              </button>
              <input
                type="range"
                min={12}
                max={28}
                value={settings.fontSize}
                onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className="flex-1 accent-amber-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
              />
              <button
                onClick={() => onUpdateSettings({ fontSize: Math.min(32, settings.fontSize + 2) })}
                className="w-9 h-9 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs flex items-center justify-center cursor-pointer"
              >
                A+
              </button>
            </div>
          </div>

          {/* Column Layout */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Column Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ columns: 1 })}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  settings.columns === 1
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-sm'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                1 Column (Vertical)
              </button>
              <button
                onClick={() => onUpdateSettings({ columns: 2 })}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  settings.columns === 2
                    ? 'bg-amber-400 text-neutral-950 border-amber-400 shadow-sm'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                2 Columns (Fit Page)
              </button>
            </div>
          </div>

          {/* Auto-scroll Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Auto-scroll Speed
              </span>
              <span className="text-xs font-mono text-amber-400">
                Level {scrollSpeed}/10
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              value={scrollSpeed}
              onChange={(e) => onScrollSpeedChange(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400 bg-neutral-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Stage Theme Switcher */}
          <div className="space-y-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-neutral-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'}`}>
              Stage Theme
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() =>
                  onUpdateSettings({
                    theme: 'stage-black',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
                  })
                }
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  settings.theme === 'stage-black'
                    ? 'bg-black border-amber-400 text-amber-400 font-bold shadow-md ring-1 ring-amber-400/40'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                    : isDarkSlate
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
                title="OLED Black: Pitch black stage background with amber chords"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-black border border-neutral-700" />
                <span>OLED Black</span>
              </button>

              <button
                onClick={() =>
                  onUpdateSettings({
                    theme: 'dark',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
                  })
                }
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  settings.theme === 'dark'
                    ? 'bg-[#1e293b] border-sky-400 text-sky-400 font-bold shadow-md ring-1 ring-sky-400/40'
                    : isLight
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-700 hover:bg-neutral-200'
                    : isDarkSlate
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Dark Slate: Rich cool slate-blue background with sky-cyan chords"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-[#0b1322] border border-sky-400" />
                <span>Dark Slate</span>
              </button>

              <button
                onClick={() =>
                  onUpdateSettings({
                    theme: 'light',
                    chordsColor: '#1d4ed8'
                  })
                }
                className={`py-2 px-1.5 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                  settings.theme === 'light'
                    ? 'bg-white border-blue-600 text-blue-700 font-bold shadow-md ring-1 ring-blue-600/40'
                    : isLight
                    ? 'bg-sky-50/60 border-blue-200 text-blue-900 hover:bg-sky-100'
                    : isDarkSlate
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-neutral-200'
                }`}
                title="Light Paper: Crisp white background with light blue & royal blue chords"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 shadow-xs" />
                <span>Light Paper</span>
              </button>
            </div>
          </div>

          {/* Notation & Chord Colors */}
          <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-neutral-200' : isDarkSlate ? 'border-slate-700' : 'border-neutral-800'}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-300">
                Nashville Numbers (1, 4, 5)
              </span>
              <button
                onClick={() =>
                  onUpdateSettings({
                    chordNotation: settings.chordNotation === 'nashville' ? 'standard' : 'nashville'
                  })
                }
                className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  settings.chordNotation === 'nashville'
                    ? 'bg-amber-400 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {settings.chordNotation === 'nashville' ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-300">
                Show Chords
              </span>
              <button
                onClick={() => onUpdateSettings({ showChords: !settings.showChords })}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  settings.showChords
                    ? 'bg-amber-500 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-400'
                }`}
              >
                {settings.showChords ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>

            {/* Chord Color Picker */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-neutral-300">
                Chord Color
              </span>
              <div className="flex items-center gap-2">
                {[
                  { name: 'Royal Blue (Light Paper)', hex: '#1d4ed8' },
                  { name: 'Sky Blue', hex: '#38bdf8' },
                  { name: 'Amber Gold', hex: '#fbbf24' },
                  { name: 'Emerald', hex: '#34d399' },
                  { name: 'Rose', hex: '#fb7185' }
                ].map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => onUpdateSettings({ chordsColor: col.hex })}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      settings.chordsColor === col.hex ? 'scale-125 border-white shadow-sm' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions Actions */}
          <div className="pt-4 border-t border-neutral-800 space-y-2">
            <button
              onClick={() => {
                onClose();
                onEditSong();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-400" />
              <span>Edit Song ChordPro</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onPrintSong();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
