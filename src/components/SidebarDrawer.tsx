import React, { useRef } from 'react';
import {
  Music,
  ListMusic,
  BookOpen,
  Settings as SettingsIcon,
  X,
  Volume2
} from 'lucide-react';
import { AppSettings, InstrumentType } from '../types/song';
import { PWAInstallButton } from './PWAInstallButton';
import { RadioGroup, tabIndexFor } from './RadioGroup';
import { useDialogBehavior } from '../utils/useDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'library' | 'setlists' | 'tags';
  onSelectTab: (tab: 'library' | 'setlists' | 'tags') => void;
  songCount: number;
  setlistCount: number;
  onOpenChords: () => void;
  onOpenMetronome: () => void;
  onOpenSettings?: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300';

// Main navigation rows. The amber outline on idle rows is kept as designed.
const navBase = `w-full flex items-center justify-between px-3.5 h-12 rounded-xl border transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;
const navActive = 'bg-amber-400 text-neutral-950 font-bold shadow-sm border-amber-400';
const navIdle = 'text-neutral-300 hover:bg-sky-700 hover:text-white border-amber-400/80';

const toolRow = `w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;

const optionBase = `h-10 px-2 rounded-lg border text-xs font-semibold transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;
const optionIdle =
  'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600';

const INSTRUMENTS: InstrumentType[] = ['guitar', 'ukulele', 'piano'];

export const SidebarDrawer: React.FC<Props> = (props) =>
  props.isOpen ? <DrawerPanel {...props} /> : null;

const DrawerPanel: React.FC<Props> = ({
  onClose,
  activeTab,
  onSelectTab,
  songCount,
  setlistCount,
  onOpenChords,
  onOpenMetronome,
  onOpenSettings,
  settings,
  onUpdateSettings
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior(panelRef, onClose);

  const themeOptions = [
    {
      value: 'stage-black',
      label: 'OLED Black',
      title: 'OLED Black: pitch black stage background with amber chords',
      on: 'bg-black border-amber-400 text-amber-400 font-bold shadow-sm',
      onPatch: () => ({
        theme: 'stage-black' as const,
        chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
      })
    },
    {
      value: 'dark',
      label: 'Dark Slate',
      title: 'Dark Slate: cool slate-blue background with sky-cyan chords',
      on: 'bg-[#1e293b] border-sky-400 text-sky-400 font-bold shadow-sm',
      onPatch: () => ({
        theme: 'dark' as const,
        chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
      })
    },
    {
      value: 'light',
      label: 'Light Paper',
      title: 'Light Paper: crisp white background with royal blue chords',
      on: 'bg-white border-blue-600 text-blue-700 font-bold shadow-sm',
      onPatch: () => ({ theme: 'light' as const, chordsColor: '#1d4ed8' })
    }
  ];

  const themeSelected = themeOptions.some((o) => o.value === settings.theme);
  const instrumentSelected = INSTRUMENTS.some((i) => i === settings.instrument);

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main menu"
        tabIndex={-1}
        className="relative w-72 sm:w-80 h-full bg-neutral-900 border-r border-neutral-800 text-neutral-100 flex flex-col shadow-2xl z-10 focus:outline-none"
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20">
              <Music className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base tracking-tight leading-tight">Worship SongBook</h2>
              <p className="text-xs text-neutral-400 font-mono">Stage &amp; Chord Manager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              onSelectTab('library');
              onClose();
            }}
            aria-current={activeTab === 'library' ? 'page' : undefined}
            className={`${navBase} ${activeTab === 'library' ? navActive : navIdle}`}
          >
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4" aria-hidden="true" />
              <span>Songs</span>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                activeTab === 'library'
                  ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {songCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('setlists');
              onClose();
            }}
            aria-current={activeTab === 'setlists' ? 'page' : undefined}
            className={`${navBase} ${activeTab === 'setlists' ? navActive : navIdle}`}
          >
            <div className="flex items-center gap-3">
              <ListMusic className="w-4 h-4" aria-hidden="true" />
              <span>Setlist</span>
            </div>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded-md ${
                activeTab === 'setlists'
                  ? 'bg-neutral-950/20 text-neutral-950 font-bold'
                  : 'bg-neutral-800 text-neutral-400'
              }`}
            >
              {setlistCount}
            </span>
          </button>

          <h3 className="pt-5 pb-1.5 px-3 text-xs font-semibold text-neutral-400">
            Tools &amp; practice
          </h3>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenChords();
            }}
            className={toolRow}
          >
            <BookOpen className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Chord Reference</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMetronome();
            }}
            className={toolRow}
          >
            <Volume2 className="w-4 h-4 text-amber-400" aria-hidden="true" />
            <span>Stage Metronome</span>
          </button>

          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className={`${toolRow} justify-between`}
            >
              <span className="flex items-center gap-3">
                <SettingsIcon className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>การตั้งค่าระบบ (Settings)</span>
              </span>
              <span className="text-xs text-neutral-400 font-mono">ปรับแต่ง</span>
            </button>
          )}

          <h3 className="pt-5 pb-1.5 px-3 text-xs font-semibold text-neutral-400">
            Display &amp; stage mode
          </h3>

          <div className="p-3 space-y-4 bg-neutral-950/40 rounded-xl border border-neutral-800/80">
            {/* Theme */}
            <div>
              <span className="block text-sm text-neutral-300 mb-2 font-medium">Stage theme</span>
              <RadioGroup label="Stage theme" className="grid grid-cols-3 gap-1.5">
                {themeOptions.map((opt, i) => {
                  const selected = settings.theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={tabIndexFor(selected, i, themeSelected)}
                      onClick={() => onUpdateSettings(opt.onPatch())}
                      title={opt.title}
                      className={`${optionBase} ${selected ? opt.on : optionIdle}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Instrument */}
            <div>
              <span className="block text-sm text-neutral-300 mb-2 font-medium">
                Default instrument
              </span>
              <RadioGroup label="Default instrument" className="grid grid-cols-3 gap-1.5">
                {INSTRUMENTS.map((inst, i) => {
                  const selected = settings.instrument === inst;
                  return (
                    <button
                      key={inst}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={tabIndexFor(selected, i, instrumentSelected)}
                      onClick={() => onUpdateSettings({ instrument: inst })}
                      className={`${optionBase} capitalize ${
                        selected ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold' : optionIdle
                      }`}
                    >
                      {inst}
                    </button>
                  );
                })}
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* PWA install */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80">
          <PWAInstallButton variant="full" />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-neutral-900 bg-neutral-950/90 text-xs text-neutral-400 flex items-center justify-between">
          <span>Worship SongBook v1.0</span>
          <span>Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
