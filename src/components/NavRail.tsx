import React from 'react';
import { Music, ListMusic, BookOpen, Timer, Settings, RefreshCw, Keyboard } from 'lucide-react';
import { getThemeStyles } from '../utils/themeStyles';

interface Props {
  activeTab: 'library' | 'setlists';
  onSelectTab: (tab: 'library' | 'setlists') => void;
  onOpenChords: () => void;
  onOpenMetronome: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts?: () => void;
  /** Replace library songs with the bundled sampleSongs (asks for confirmation in App) */
  onUpdateSongs?: () => void;
  isMetronomeOpen?: boolean;
  theme?: string;
}

/**
 * Persistent navigation for tablets and larger screens (md and up). On phones the hamburger menu and
 * SidebarDrawer stay in charge, so this rail renders nothing there.
 */
export const NavRail: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  onOpenChords,
  onOpenMetronome,
  onOpenSettings,
  onOpenShortcuts,
  onUpdateSongs,
  isMetronomeOpen,
  theme
}) => {
  const t = getThemeStyles(theme);

  const item = (active: boolean) =>
    `w-[72px] h-16 rounded-2xl flex flex-col items-center justify-center gap-1 font-display font-medium text-xs cursor-pointer transition-colors motion-reduce:transition-none ${
      active ? t.railItemOn : t.railItem
    } ${t.focus}`;

  return (
    <nav
      aria-label="Main"
      className={`hidden md:flex w-[88px] shrink-0 flex-col items-center gap-1.5 py-5 border-r no-print ${t.rail}`}
    >
      <div
        aria-hidden="true"
        className={`w-11 h-11 mb-4 rounded-xl flex items-center justify-center ${t.accentBtn}`}
      >
        <Music className="w-6 h-6" strokeWidth={2.2} />
      </div>

      <button
        type="button"
        onClick={() => onSelectTab('library')}
        aria-current={activeTab === 'library' ? 'page' : undefined}
        className={item(activeTab === 'library')}
      >
        <Music className="w-[22px] h-[22px]" aria-hidden="true" />
        Songs
      </button>
      <button
        type="button"
        onClick={() => onSelectTab('setlists')}
        aria-current={activeTab === 'setlists' ? 'page' : undefined}
        className={item(activeTab === 'setlists')}
      >
        <ListMusic className="w-[22px] h-[22px]" aria-hidden="true" />
        Setlists
      </button>
      <button type="button" onClick={onOpenChords} className={item(false)}>
        <BookOpen className="w-[22px] h-[22px]" aria-hidden="true" />
        Chords
      </button>
      <button
        type="button"
        onClick={onOpenMetronome}
        aria-pressed={isMetronomeOpen}
        className={item(Boolean(isMetronomeOpen))}
      >
        <Timer className="w-[22px] h-[22px]" aria-hidden="true" />
        Metronome
      </button>

      {onUpdateSongs && (
        <button
          type="button"
          onClick={onUpdateSongs}
          title="อัปเดตเพลงจาก sampleSongs"
          aria-label="อัปเดตเพลงจาก sampleSongs"
          className={`${item(false)} mt-auto`}
        >
          <RefreshCw className="w-[22px] h-[22px]" aria-hidden="true" />
          อัปเดต
        </button>
      )}
      {onOpenShortcuts && (
        <button
          type="button"
          onClick={onOpenShortcuts}
          title="คีย์ลัดคีย์บอร์ด & แป้นเหยียบ (กด ?)"
          aria-label="คีย์ลัดคีย์บอร์ด (กด ?)"
          className={`${item(false)} ${onUpdateSongs ? '' : 'mt-auto'}`}
        >
          <Keyboard className="w-[22px] h-[22px]" aria-hidden="true" />
          Shortcuts
        </button>
      )}

      <button
        type="button"
        onClick={onOpenSettings}
        className={`${item(false)} ${onUpdateSongs || onOpenShortcuts ? '' : 'mt-auto'}`}
      >
        <Settings className="w-[22px] h-[22px]" aria-hidden="true" />
        Settings
      </button>
    </nav>
  );
};

export default NavRail;
