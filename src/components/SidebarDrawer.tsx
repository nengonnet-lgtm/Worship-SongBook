import React from 'react';
import {
  Music,
  ListMusic,
  Tag,
  BookOpen,
  Settings as SettingsIcon,
  X,
  FileText,
  Volume2,
  Moon,
  Sun,
  ShieldAlert
} from 'lucide-react';
import { AppSettings, AppTheme, InstrumentType } from '../types/song';
import { PWAInstallButton } from './PWAInstallButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'library' | 'setlists' | 'tags';
  onSelectTab: (tab: 'library' | 'setlists' | 'tags') => void;
  songCount: number;
  setlistCount: number;
  onOpenChords: () => void;
  onOpenMetronome: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

export const SidebarDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  songCount,
  setlistCount,
  onOpenChords,
  onOpenMetronome,
  settings,
  onUpdateSettings
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-72 sm:w-80 h-full bg-neutral-900 border-r border-neutral-800 text-neutral-100 flex flex-col shadow-2xl z-10">
        {/* Header (SongBook Pro branding) */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 font-black shadow-md shadow-amber-500/20">
              <Music className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-base tracking-tight leading-tight">
                Worship SongBook
              </h2>
              <p className="text-[11px] text-neutral-400 font-mono">
                Stage & Chord Manager
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 text-sm font-medium">
          <button
            onClick={() => {
              onSelectTab('library');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'library'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <Music className="w-4 h-4" />
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
            onClick={() => {
              onSelectTab('setlists');
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'setlists'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-sm'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <ListMusic className="w-4 h-4" />
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

          <div className="pt-3 pb-1 px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Tools & Practice
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenChords();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Chord Reference</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenMetronome();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Stage Metronome</span>
          </button>

          {/* Settings Section */}
          <div className="pt-4 pb-1 px-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Display & Stage Mode
          </div>

          <div className="px-3 py-2 space-y-3 bg-neutral-950/40 rounded-xl border border-neutral-800/80">
            {/* Theme switcher */}
            <div>
              <span className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Stage Theme
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                <button
                  onClick={() => onUpdateSettings({
                    theme: 'stage-black',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
                  })}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    settings.theme === 'stage-black'
                      ? 'bg-black border-amber-400 text-amber-400 font-bold shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="OLED Black: Pitch black stage background with amber chords"
                >
                  OLED Black
                </button>
                <button
                  onClick={() => onUpdateSettings({
                    theme: 'dark',
                    chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
                  })}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-[#1e293b] border-sky-400 text-sky-400 font-bold shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Dark Slate: Rich cool slate-blue background with sky-cyan chords"
                >
                  Dark Slate
                </button>
                <button
                  onClick={() => onUpdateSettings({
                    theme: 'light',
                    chordsColor: '#1d4ed8'
                  })}
                  className={`py-1.5 px-2 rounded-lg border transition-all cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-white border-blue-600 text-blue-700 font-bold shadow-sm'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                  title="Light Paper: Crisp white background with light blue & royal blue chords"
                >
                  Light Paper
                </button>
              </div>
            </div>

            {/* Instrument selector */}
            <div>
              <span className="block text-xs text-neutral-400 mb-1.5 font-medium">
                Default Instrument
              </span>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
                  <button
                    key={inst}
                    onClick={() => onUpdateSettings({ instrument: inst })}
                    className={`py-1.5 px-1 rounded-lg capitalize border transition-all cursor-pointer ${
                      settings.instrument === inst
                        ? 'bg-amber-400 text-neutral-950 border-amber-400 font-bold'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {inst}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom PWA Install Button */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80">
          <PWAInstallButton variant="full" />
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 border-t border-neutral-900 bg-neutral-950/90 text-xs text-neutral-500 flex items-center justify-between">
          <span>Worship SongBook v1.0</span>
          <span>Offline Ready</span>
        </div>
      </div>
    </div>
  );
};
