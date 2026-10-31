import React, { useRef } from 'react';
import {
  Music,
  ListMusic,
  BookOpen,
  Settings as SettingsIcon,
  X,
  Volume2,
  RefreshCw,
  Keyboard
} from 'lucide-react';
import { AppSettings, InstrumentType } from '../types/song';
import { PWAInstallButton } from './PWAInstallButton';
import { RadioGroup, tabIndexFor } from './RadioGroup';
import { useDialogBehavior } from '../utils/useDialog';
import { chordColorForTheme, getThemeStyles } from '../utils/themeStyles';

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
  onOpenShortcuts?: () => void;
  onUpdateSongs?: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const INSTRUMENTS: InstrumentType[] = ['guitar', 'ukulele', 'piano'];

// Theme buttons always show the look of the theme they select, so the choice is recognisable at a glance
const THEME_OPTIONS = [
  {
    value: 'stage-black',
    label: 'Ink',
    title: 'Ink: warm black stage background, cream text, amber chords',
    on: 'bg-[#0F0E0C] border-[#F59E0B] text-[#F3EEE3] font-bold shadow-sm',
    off: 'bg-[#0F0E0C] border-[#3A362F] text-[#A8A092] hover:border-[#6B655A]'
  },
  {
    value: 'dark',
    label: 'Midnight',
    title: 'Midnight: deep navy background, ice-white text, sky-blue chords',
    on: 'bg-[#0D1526] border-[#38BDF8] text-[#E8EEF8] font-bold shadow-sm',
    off: 'bg-[#0D1526] border-[#2C3D5E] text-[#93A3BF] hover:border-[#4A5F88]'
  },
  {
    value: 'light',
    label: 'Paper',
    title: 'Paper: soft warm-white background, ink text, deep amber chords',
    on: 'bg-[#F8F6F1] border-[#B45309] text-[#1F1C17] font-bold shadow-sm',
    off: 'bg-[#F8F6F1] border-[#D8D1C2] text-[#6A6458] hover:border-[#B5AC98]'
  }
] as const;

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
  onOpenShortcuts,
  onUpdateSongs,
  settings,
  onUpdateSettings
}) => {
  const t = getThemeStyles(settings.theme);
  const panelRef = useRef<HTMLDivElement>(null);
  useDialogBehavior(panelRef, onClose);

  // Main navigation rows (phone drawer; tablets use the NavRail)
  const navBase = `w-full flex items-center justify-between px-3.5 h-12 rounded-xl border transition-colors motion-reduce:transition-none cursor-pointer ${t.focus}`;
  const navActive = `${t.segOn} shadow-sm`;
  const navIdle = t.ghostBtn;

  const toolRow = `w-full flex items-center gap-3 px-3.5 h-11 rounded-xl ${t.textStrong} ${t.rowHover} transition-colors motion-reduce:transition-none cursor-pointer ${t.focus}`;
  const optionBase = `h-10 px-2 rounded-lg border text-xs font-semibold transition-colors motion-reduce:transition-none cursor-pointer ${t.focus}`;

  const countBadge = (active: boolean) =>
    `text-xs font-keys px-2 py-0.5 rounded-md ${active ? 'bg-black/15 font-bold' : t.numberOff}`;

  const themeSelected = THEME_OPTIONS.some((o) => o.value === settings.theme);
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
        className={`relative w-72 sm:w-80 h-full border-r flex flex-col shadow-2xl z-10 focus:outline-none ${t.dialog}`}
      >
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${t.dialogBar}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center font-black ${t.accentBtn}`}>
              <Music className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-semibold text-base tracking-tight leading-tight">Worship SongBook</h2>
              <p className={`text-xs font-keys ${t.textMuted}`}>Stage &amp; Chord Manager</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-lg transition-colors motion-reduce:transition-none cursor-pointer ${t.iconBtn} ${t.focus}`}
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
            <span className={countBadge(activeTab === 'library')}>{songCount}</span>
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
            <span className={countBadge(activeTab === 'setlists')}>{setlistCount}</span>
          </button>

          <h3 className={`pt-5 pb-1.5 px-3 font-display text-xs font-medium ${t.textMuted}`}>
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
            <BookOpen className={`w-4 h-4 ${t.accentText}`} aria-hidden="true" />
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
            <Volume2 className={`w-4 h-4 ${t.accentText}`} aria-hidden="true" />
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
                <RefreshCw className={`w-4 h-4 ${t.accentText}`} aria-hidden="true" />
                <span>อัปเดตเพลงจาก sampleSongs</span>
              </span>
            </button>
          )}

          {onOpenShortcuts && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenShortcuts();
              }}
              className={`${toolRow} justify-between`}
            >
              <span className="flex items-center gap-3">
                <Keyboard className={`w-4 h-4 ${t.accentText}`} aria-hidden="true" />
                <span>คีย์ลัด &amp; แป้นเหยียบ (Shortcuts)</span>
              </span>
              <kbd className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded border ${t.numberOff}`}>?</kbd>
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
                <SettingsIcon className={`w-4 h-4 ${t.accentText}`} aria-hidden="true" />
                <span>การตั้งค่าระบบ (Settings)</span>
              </span>
              <span className={`text-xs font-keys ${t.textMuted}`}>ปรับแต่ง</span>
            </button>
          )}

          <h3 className={`pt-5 pb-1.5 px-3 font-display text-xs font-medium ${t.textMuted}`}>
            Display &amp; stage mode
          </h3>

          <div className={`p-3 space-y-4 rounded-xl border ${t.card}`}>
            {/* Theme */}
            <div>
              <span className={`block text-sm mb-2 font-medium ${t.textStrong}`}>Stage theme</span>
              <RadioGroup label="Stage theme" className="grid grid-cols-3 gap-1.5">
                {THEME_OPTIONS.map((opt, i) => {
                  const selected = settings.theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      tabIndex={tabIndexFor(selected, i, themeSelected)}
                      onClick={() =>
                        onUpdateSettings({
                          theme: opt.value,
                          chordsColor: chordColorForTheme(opt.value, settings.chordsColor)
                        })
                      }
                      title={opt.title}
                      className={`${optionBase} ${selected ? opt.on : opt.off}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </RadioGroup>
            </div>

            {/* Instrument */}
            <div>
              <span className={`block text-sm mb-2 font-medium ${t.textStrong}`}>Default instrument</span>
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
                      className={`${optionBase} capitalize ${selected ? t.segOn : t.segOff}`}
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
        <div className={`p-3 border-t ${t.dialogBar}`}>
          <PWAInstallButton variant="full" />
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t text-xs flex items-center justify-between ${t.dialogBar} ${t.textMuted}`}>
          <span>Worship SongBook v1.0</span>
          <span>Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
