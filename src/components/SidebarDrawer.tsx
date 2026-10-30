import React, { useRef } from 'react';
import {
  Music,
  ListMusic,
  BookOpen,
  Settings as SettingsIcon,
  X,
  Volume2,
  RefreshCw
} from 'lucide-react';
import { AppSettings, InstrumentType } from '../types/song';
import { PWAInstallButton } from './PWAInstallButton';
import { RadioGroup, tabIndexFor } from './RadioGroup';
import { useDialogBehavior } from '../utils/useDialog';
import { chordColorForTheme } from '../utils/themeStyles';

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
  onUpdateSongs?: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B]';

// Main navigation rows (phone drawer; tablets use the NavRail)
const navBase = `w-full flex items-center justify-between px-3.5 h-12 rounded-xl border transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;
const navActive = 'bg-[#F59E0B] text-[#0F0E0C] font-bold shadow-sm border-[#F59E0B]';
const navIdle = 'text-[#F3EEE3] hover:bg-[#262320] border-[#3A362F]';

const toolRow = `w-full flex items-center gap-3 px-3.5 h-11 rounded-xl text-[#F3EEE3] hover:bg-[#262320] transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;

const optionBase = `h-10 px-2 rounded-lg border text-xs font-semibold transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`;
const optionIdle =
  'bg-transparent border-[#3A362F] text-[#A8A092] hover:text-[#F3EEE3] hover:border-[#6B655A]';

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
  onUpdateSongs,
  settings,
  onUpdateSettings
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior(panelRef, onClose);

  const themeOptions = [
    {
      value: 'stage-black',
      label: 'Ink',
      title: 'Ink: warm black stage background, cream text, bright yellow-orange chords',
      on: 'bg-[#0F0E0C] border-[#F59E0B] text-[#F3EEE3] font-bold shadow-sm',
      onPatch: () => ({
        theme: 'stage-black' as const,
        chordsColor: chordColorForTheme('stage-black', settings.chordsColor)
      })
    },
    {
      value: 'dark',
      label: 'Graphite',
      title: 'Graphite: cool charcoal background with golden amber chords',
      on: 'bg-[#101418] border-[#F59E0B] text-[#E9EDF2] font-bold shadow-sm',
      onPatch: () => ({
        theme: 'dark' as const,
        chordsColor: chordColorForTheme('dark', settings.chordsColor)
      })
    },
    {
      value: 'light',
      label: 'Paper',
      title: 'Paper: warm paper background, ink text, warm amber chords',
      on: 'bg-[#F6F1E7] border-[#D97706] text-[#1A1815] font-bold shadow-sm',
      onPatch: () => ({ theme: 'light' as const, chordsColor: chordColorForTheme('light') })
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
        className="relative w-72 sm:w-80 h-full bg-[#141210] border-r border-[#2C2924] text-[#F3EEE3] flex flex-col shadow-2xl z-10 focus:outline-none"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#2C2924] bg-[#0F0E0C] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-[#F59E0B] flex items-center justify-center text-[#0F0E0C] font-black">
              <Music className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-base tracking-tight leading-tight">Worship SongBook</h2>
              <p className="text-xs text-[#A8A092] font-keys">Stage &amp; Chord Manager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-[#A8A092] hover:text-[#F3EEE3] hover:bg-[#262320] transition-colors motion-reduce:transition-none cursor-pointer ${focusRing}`}
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
              className={`text-xs font-keys px-2 py-0.5 rounded-md ${
                activeTab === 'library'
                  ? 'bg-[#0F0E0C]/20 text-[#0F0E0C] font-bold'
                  : 'bg-[#2C2924] text-[#A8A092]'
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
              className={`text-xs font-keys px-2 py-0.5 rounded-md ${
                activeTab === 'setlists'
                  ? 'bg-[#0F0E0C]/20 text-[#0F0E0C] font-bold'
                  : 'bg-[#2C2924] text-[#A8A092]'
              }`}
            >
              {setlistCount}
            </span>
          </button>

          <h3 className="pt-5 pb-1.5 px-3 font-display text-xs font-medium text-[#A8A092]">
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
            <BookOpen className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
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
            <Volume2 className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
            <span>Stage Metronome</span>
          </button>

          {onUpdateSongs && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onUpdateSongs();
              }}
              className={`${toolRow} justify-between`}
            >
              <span className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>อัปเดตเพลงจาก sampleSongs</span>
              </span>
            </button>
          )}

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
                <SettingsIcon className="w-4 h-4 text-[#F59E0B]" aria-hidden="true" />
                <span>การตั้งค่าระบบ (Settings)</span>
              </span>
              <span className="text-xs text-[#A8A092] font-keys">ปรับแต่ง</span>
            </button>
          )}

          <h3 className="pt-5 pb-1.5 px-3 font-display text-xs font-medium text-[#A8A092]">
            Display &amp; stage mode
          </h3>

          <div className="p-3 space-y-4 bg-[#0F0E0C]/60 rounded-xl border border-[#2C2924]">
            {/* Theme */}
            <div>
              <span className="block text-sm text-[#F3EEE3] mb-2 font-medium">Stage theme</span>
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
              <span className="block text-sm text-[#F3EEE3] mb-2 font-medium">
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
                        selected ? 'bg-[#F59E0B] text-[#0F0E0C] border-[#F59E0B] font-bold' : optionIdle
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
        <div className="p-3 border-t border-[#2C2924] bg-[#0F0E0C]/80">
          <PWAInstallButton variant="full" />
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#2C2924] bg-[#0F0E0C] text-xs text-[#A8A092] flex items-center justify-between">
          <span>Worship SongBook v1.0</span>
          <span>Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
