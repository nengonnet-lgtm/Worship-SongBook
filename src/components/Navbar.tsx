import React from 'react';
import { Plus } from 'lucide-react';

interface Props {
  activeTab: 'library' | 'setlists';
  onSelectTab: (tab: 'library' | 'setlists') => void;
  onOpenNewSong: () => void;
  onOpenChordsModal: () => void;
  onToggleMetronome: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenNewSong,
  onOpenChordsModal,
  onToggleMetronome
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-neutral-800 bg-neutral-950 text-neutral-100 shrink-0 no-print select-none">
      {/* Zone 1: Brand wordmark (single text element) */}
      <div
        onClick={() => onSelectTab('library')}
        className="text-lg font-extrabold tracking-tight text-neutral-100 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
      >
        <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 rotate-45" />
        <span>Worship SongBook</span>
      </div>

      {/* Zone 2: 4-5 single-line nav links */}
      <nav className="flex items-center gap-6 text-sm font-medium text-neutral-400">
        <button
          onClick={() => onSelectTab('library')}
          className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'library' ? 'text-neutral-100 font-semibold underline underline-offset-8 decoration-amber-400 decoration-2' : ''
          }`}
        >
          Library
        </button>
        <button
          onClick={() => onSelectTab('setlists')}
          className={`hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'setlists' ? 'text-neutral-100 font-semibold underline underline-offset-8 decoration-amber-400 decoration-2' : ''
          }`}
        >
          Setlist
        </button>
        <button
          onClick={onOpenChordsModal}
          className="hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Chords
        </button>
        <button
          onClick={onToggleMetronome}
          className="hover:text-neutral-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Metronome
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center shrink-0">
        <button
          onClick={onOpenNewSong}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_0_12px_rgba(251,191,36,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>New Song</span>
        </button>
      </div>
    </header>
  );
};
