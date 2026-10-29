import React from 'react';
import { Plus, Settings } from 'lucide-react';

interface Props {
  activeTab: 'library' | 'setlists';
  onSelectTab: (tab: 'library' | 'setlists') => void;
  onOpenNewSong: () => void;
  onOpenChordsModal: () => void;
  onToggleMetronome: () => void;
  /** Optional: shows a settings button at the right when provided */
  onOpenSettings?: () => void;
  /** Optional: lets the Chords / Metronome links show that they are currently open */
  isChordsOpen?: boolean;
  isMetronomeOpen?: boolean;
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950';

const linkBase = `h-10 px-3 rounded-lg whitespace-nowrap shrink-0 cursor-pointer transition-colors motion-reduce:transition-none hover:text-neutral-100 hover:bg-neutral-900 ${focusRing}`;
const linkActive =
  'text-neutral-100 font-semibold underline underline-offset-8 decoration-amber-400 decoration-2';

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenNewSong,
  onOpenChordsModal,
  onToggleMetronome,
  onOpenSettings,
  isChordsOpen,
  isMetronomeOpen
}) => {
  return (
    <header className="flex items-center justify-between gap-4 md:gap-8 px-4 md:px-6 py-3 border-b border-neutral-800 bg-neutral-950 text-neutral-100 shrink-0 no-print select-none">
      {/* Brand: a real button so it can be reached and used from the keyboard */}
      <button
        type="button"
        onClick={() => onSelectTab('library')}
        aria-label="Worship SongBook, go to Library"
        className={`h-10 px-1 -mx-1 rounded-lg text-lg font-extrabold tracking-tight text-neutral-100 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${focusRing}`}
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 rotate-45" aria-hidden="true" />
        <span>Worship SongBook</span>
      </button>

      {/* Main navigation; scrolls sideways instead of overflowing on narrow screens */}
      <nav
        aria-label="Main"
        className="flex items-center gap-1 md:gap-3 text-sm font-medium text-neutral-400 min-w-0 overflow-x-auto"
      >
        <button
          type="button"
          onClick={() => onSelectTab('library')}
          aria-current={activeTab === 'library' ? 'page' : undefined}
          className={`${linkBase} ${activeTab === 'library' ? linkActive : ''}`}
        >
          Library
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('setlists')}
          aria-current={activeTab === 'setlists' ? 'page' : undefined}
          className={`${linkBase} ${activeTab === 'setlists' ? linkActive : ''}`}
        >
          Setlist
        </button>
        <button
          type="button"
          onClick={onOpenChordsModal}
          aria-pressed={isChordsOpen}
          className={`${linkBase} ${isChordsOpen ? 'text-amber-400' : ''}`}
        >
          Chords
        </button>
        <button
          type="button"
          onClick={onToggleMetronome}
          aria-pressed={isMetronomeOpen}
          className={`${linkBase} ${isMetronomeOpen ? 'text-amber-400' : ''}`}
        >
          Metronome
        </button>
      </nav>

      {/* Primary action (and settings, when the parent provides it) */}
      <div className="flex items-center gap-2 shrink-0">
        {onOpenSettings && (
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings (การตั้งค่า)"
            title="Settings (การตั้งค่า)"
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900 cursor-pointer transition-colors motion-reduce:transition-none ${focusRing}`}
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
        <button
          type="button"
          onClick={onOpenNewSong}
          className={`flex items-center gap-1.5 h-10 px-4 text-sm font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors motion-reduce:transition-none whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.2)] ${focusRing}`}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>New Song</span>
        </button>
      </div>
    </header>
  );
};
