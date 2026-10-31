import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Setlist, Song, AppSettings } from '../types/song';
import { SongViewer } from './SongViewer';
import { ConfirmDialog } from './ConfirmDialog';
import { getThemeStyles } from '../utils/themeStyles';
import type { ThemeStyles } from '../utils/themeStyles';
import { useDialogBehavior, useDismiss } from '../utils/useDialog';
import {
  buildEntries,
  removeSlot,
  selectionAfterMove,
  selectionAfterRemove,
  swapSlots
} from '../utils/setlistOrder';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Music,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Check,
  X,
  Menu,
  Maximize2,
  ArrowUpDown
} from 'lucide-react';

interface Props {
  setlists: Setlist[];
  songs: Song[];
  activeSetlist: Setlist | null;
  onOpenMenu: () => void;
  onSelectSetlist: (setlist: Setlist | null) => void;
  onCreateSetlist: (title: string, date: string, description: string) => void;
  onUpdateSetlist: (setlist: Setlist) => void;
  onDeleteSetlist: (id: string) => void;
  onStartPerformance: (setlist: Setlist, startSongIdx?: number) => void;
  onOpenSong: (song: Song) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onEditSong: (song: Song) => void;
}

// วันที่ปัจจุบันเป็น DD-MM-YYYY (เช่น 19-10-2026)
const getFormattedTodayDate = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${day}-${month}-${year}`;
};

const overlay = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs';

/* ------------------------------------------------------------------ */
/* Dialog: create a setlist                                             */
/* ------------------------------------------------------------------ */
const CreateSetlistDialog: React.FC<{
  t: ThemeStyles;
  onCreate: (title: string, date: string, description: string) => void;
  onClose: () => void;
}> = ({ t, onCreate, onClose }) => {
  const panelRef = useRef<HTMLFormElement>(null);
  const uid = useId();
  const [title, setTitle] = useState(getFormattedTodayDate());
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [desc, setDesc] = useState('');
  useDialogBehavior(panelRef, onClose);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate(title.trim(), date, desc.trim());
  };

  const field = `w-full h-11 px-3.5 rounded-lg border text-sm ${t.field} ${t.focus}`;
  const label = `block text-sm font-medium mb-1.5 ${t.textMuted}`;

  return (
    <div className={overlay} onClick={onClose}>
      <form
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 animate-scaleIn motion-reduce:animate-none focus:outline-none ${t.dialog}`}
      >
        <div className={`flex items-center justify-between pb-3 border-b ${t.popoverDivider}`}>
          <h2 id={`${uid}-title`} className="font-bold text-base">
            Create New Setlist
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`w-10 h-10 -mr-2 flex items-center justify-center rounded-lg cursor-pointer ${t.iconBtn} ${t.focus}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div>
          <label htmlFor={`${uid}-name`} className={label}>
            Setlist Title
          </label>
          <input
            id={`${uid}-name`}
            data-autofocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 19-10-2026"
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-date`} className={label}>
            Performance Date
          </label>
          <input
            id={`${uid}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${uid}-desc`} className={label}>
            Description / Venue
          </label>
          <input
            id={`${uid}-desc`}
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="e.g. Main Auditorium, 10:00 AM"
            className={field}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`h-11 px-5 rounded-lg border text-sm font-semibold cursor-pointer ${t.ghostBtn} ${t.focus}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim()}
            className={`h-11 px-5 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.accentBtn} ${t.focus}`}
          >
            Create Setlist
          </button>
        </div>
      </form>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Dialog: add songs (multi-select)                                     */
/* ------------------------------------------------------------------ */
const AddSongsDialog: React.FC<{
  t: ThemeStyles;
  setlistTitle: string;
  songs: Song[];
  existingIds: string[];
  onAdd: (songIds: string[]) => void;
  onClose: () => void;
}> = ({ t, setlistTitle, songs, existingIds, onAdd, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useDialogBehavior(panelRef, onClose);

  const visible = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return songs;
    // Title matches first (exact, then starts-with, then contains), then artist / key matches
    const scored = songs.flatMap((song) => {
      const title = song.title.toLowerCase();
      let rank: number;
      if (title === q) rank = 0;
      else if (title.startsWith(q)) rank = 1;
      else if (title.includes(q)) rank = 2;
      else if ((song.artist && song.artist.toLowerCase().includes(q)) || (song.key && song.key.toLowerCase().includes(q)))
        rank = 3;
      else return [];
      return [{ song, rank }];
    });
    scored.sort((a, b) => a.rank - b.rank);
    return scored.map((entry) => entry.song);
  }, [songs, query]);

  const toggle = (songId: string) =>
    setSelectedIds((prev) => (prev.includes(songId) ? prev.filter((id) => id !== songId) : [...prev, songId]));

  return (
    <div className={overlay} onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-lg max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-scaleIn motion-reduce:animate-none focus:outline-none ${t.dialog}`}
      >
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${t.dialogBar}`}>
          <h2 id={`${uid}-title`} className="font-bold text-base truncate">
            Add Songs to {setlistTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`w-10 h-10 -mr-2 shrink-0 flex items-center justify-center rounded-lg cursor-pointer ${t.iconBtn} ${t.focus}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 shrink-0">
          <input
            data-autofocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อเพลง, ศิลปิน หรือ คีย์..."
            aria-label="ค้นหาเพลงที่จะเพิ่ม"
            autoComplete="off"
            className={`w-full h-11 px-3.5 rounded-lg border text-sm ${t.field} ${t.focus}`}
          />
        </div>

        <ul className={`flex-1 overflow-y-auto px-2 pb-2 divide-y ${t.divide}`}>
          {visible.length === 0 ? (
            <li className={`py-10 text-center text-sm ${t.textMuted}`}>ไม่พบเพลงที่ค้นหา</li>
          ) : (
            visible.map((song) => {
              const checked = selectedIds.includes(song.id);
              const already = existingIds.includes(song.id);
              return (
                <li key={song.id}>
                  <label
                    className={`flex items-center gap-3.5 px-3 min-h-14 py-2 rounded-lg cursor-pointer transition-colors motion-reduce:transition-none ${t.popoverItem}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(song.id)}
                      className={`w-5 h-5 shrink-0 cursor-pointer ${t.accentColor}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold truncate">{song.title}</span>
                    </span>
                    {already && (
                      <span className={`text-xs shrink-0 flex items-center gap-1 ${t.accentText}`}>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        อยู่ในเซ็ตแล้ว
                      </span>
                    )}
                    <span
                      className={`shrink-0 min-w-[34px] h-8 px-2 rounded-[10px] border flex items-center justify-center font-keys font-bold text-sm ${t.keyBadge}`}
                    >
                      {song.key}
                    </span>
                  </label>
                </li>
              );
            })
          )}
        </ul>

        <div className={`px-5 py-3.5 border-t flex items-center justify-between gap-3 shrink-0 ${t.dialogBar}`}>
          <span className={`text-sm ${t.textMuted}`} aria-live="polite">
            เลือกแล้ว <strong className={t.accentText}>{selectedIds.length}</strong> รายการ
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`h-11 px-4 rounded-lg border text-sm font-semibold cursor-pointer ${t.ghostBtn} ${t.focus}`}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => onAdd(selectedIds)}
              disabled={selectedIds.length === 0}
              className={`h-11 px-4 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.accentBtn} ${t.focus}`}
            >
              + เพิ่มเพลงที่เลือก ({selectedIds.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Setlist screen                                                       */
/* ------------------------------------------------------------------ */
export const SetlistManager: React.FC<Props> = ({
  setlists,
  songs,
  activeSetlist,
  onOpenMenu,
  onSelectSetlist,
  onCreateSetlist,
  onUpdateSetlist,
  onDeleteSetlist,
  onStartPerformance,
  onOpenSong,
  settings,
  onUpdateSettings,
  onEditSong
}) => {
  const [selectedSongIdx, setSelectedSongIdx] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showSetSwitcher, setShowSetSwitcher] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  // Portrait / narrow layouts: the set list is a collapsed bar until the player asks for it
  const [listOpen, setListOpen] = useState(false);
  const [pendingDeleteSet, setPendingDeleteSet] = useState<Setlist | null>(null);

  const switcherRef = useRef<HTMLDivElement>(null);
  const switcherTriggerRef = useRef<HTMLButtonElement>(null);
  useDismiss(switcherRef, showSetSwitcher, () => setShowSetSwitcher(false), switcherTriggerRef);

  const t = getThemeStyles(settings.theme);

  // If no active setlist is selected, pick the first one
  useEffect(() => {
    if (!activeSetlist && setlists.length > 0) {
      onSelectSetlist(setlists[0]);
    }
  }, [activeSetlist, setlists, onSelectSetlist]);

  // Reset selected song index (and leave reorder mode) when the setlist changes
  useEffect(() => {
    setSelectedSongIdx(0);
    setIsReordering(false);
  }, [activeSetlist?.id]);

  // Songs of the active set, each remembering its slot in songIds.
  // Ids whose song was deleted from the library are skipped, so a list position is NOT the same as a
  // songIds position; the buttons below always go through `slot`.
  const entries = useMemo(
    () => (activeSetlist ? buildEntries(activeSetlist.songIds, songs) : []),
    [activeSetlist, songs]
  );

  const activeSongs: Song[] = entries.map((e) => e.song);
  const pickerSongs = entries.map(({ song }, i) => ({
    index: i,
    id: song.id,
    title: song.title,
    key: activeSetlist?.songKeys?.[song.id] || song.key
  }));
  const currentSong = activeSongs[selectedSongIdx] || null;
  const totalDurationMinutes = Math.round(
    activeSongs.reduce((acc, s) => acc + (s.duration || 180), 0) / 60
  );

  const handleCreate = (title: string, date: string, description: string) => {
    onCreateSetlist(title, date, description);
    setShowCreateModal(false);
  };

  const handleAddSongs = (songIds: string[]) => {
    if (!activeSetlist || songIds.length === 0) return;
    onUpdateSetlist({
      ...activeSetlist,
      songIds: [...activeSetlist.songIds, ...songIds]
    });
    setShowAddSongModal(false);
  };

  const moveSong = (index: number, direction: 'up' | 'down') => {
    if (!activeSetlist) return;
    const other = direction === 'up' ? index - 1 : index + 1;
    if (other < 0 || other >= entries.length) return;

    onUpdateSetlist({
      ...activeSetlist,
      songIds: swapSlots(activeSetlist.songIds, entries[index].slot, entries[other].slot)
    });
    setSelectedSongIdx(selectionAfterMove(selectedSongIdx, index, other));
  };

  const removeSongFromSetlist = (index: number) => {
    if (!activeSetlist) return;
    onUpdateSetlist({
      ...activeSetlist,
      songIds: removeSlot(activeSetlist.songIds, entries[index].slot)
    });
    setSelectedSongIdx(selectionAfterRemove(selectedSongIdx, index, entries.length - 1));
  };

  const handleSongKeyChange = (songId: string, newKey: string) => {
    if (!activeSetlist) return;
    onUpdateSetlist({
      ...activeSetlist,
      songKeys: {
        ...(activeSetlist.songKeys || {}),
        [songId]: newKey
      }
    });
  };

  const openAddSongs = () => setShowAddSongModal(true);

  // Esc closes the slide-out list (unless a dialog / menu on top of it should get the key first)
  useEffect(() => {
    if (!listOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showCreateModal && !showAddSongModal && !pendingDeleteSet && !showSetSwitcher) {
        setListOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listOpen, showCreateModal, showAddSongModal, pendingDeleteSet, showSetSwitcher]);

  const toolBtn = `h-10 rounded-lg border flex items-center justify-center gap-1.5 cursor-pointer transition-colors motion-reduce:transition-none disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`;
  const rowIconBtn = `w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-25 disabled:pointer-events-none ${t.iconBtn} ${t.focus}`;

  return (
    <div className={`relative flex-1 flex flex-col h-full min-h-0 w-full overflow-hidden ${t.page}`}>
      {/* Tablets (md and up): dim backdrop behind the slide-out setlist */}
      <div
        aria-hidden="true"
        onClick={() => setListOpen(false)}
        className={`hidden md:block absolute inset-0 z-40 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
          listOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* SETLIST PANE
          Tablets (md and up): a drawer that slides out from the left over the lyrics, so the lyrics always get the full width.
          Phones: a one-row bar above the lyrics that expands into the full list. */}
      <div
        role="region"
        aria-label="Setlist"
        className={`w-full border-b flex flex-col shrink-0 overflow-hidden ${
          listOpen ? 'max-h-[62dvh]' : ''
        } md:absolute md:inset-y-0 md:left-0 md:z-50 md:w-[372px] md:max-w-[88%] md:max-h-none md:h-full md:border-b-0 md:border-r md:shadow-2xl md:transition-[transform,visibility] md:duration-200 motion-reduce:md:transition-none ${
          listOpen ? 'md:translate-x-0 md:visible' : 'md:-translate-x-full md:invisible'
        } ${t.subBar}`}
      >
        {/* Compact bar (portrait / narrow only) */}
        <div className={`${listOpen ? 'hidden' : 'flex'} md:hidden items-center gap-2 px-3 py-2.5 shrink-0`}>
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open navigation menu"
            className={`md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-xl cursor-pointer ${t.iconBtn} ${t.focus}`}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setListOpen(true)}
            aria-expanded={false}
            title="เลือกเพลงจากเซ็ตลิสต์"
            className={`min-w-0 flex-1 min-h-11 px-3 rounded-xl border flex items-center gap-3 text-left cursor-pointer ${t.ghostBtn} ${t.focus}`}
          >
            <span
              className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-keys font-bold text-sm shrink-0 ${
                currentSong ? t.numberOn : t.numberOff
              }`}
            >
              {currentSong ? selectedSongIdx + 1 : '–'}
            </span>
            <span className="min-w-0 flex-1 flex flex-col">
              <span className="font-display font-semibold text-[15px] leading-tight truncate">
                {currentSong ? currentSong.title : activeSetlist ? 'เลือกเพลง' : 'ยังไม่มีเซ็ตลิสต์'}
              </span>
              <span className={`text-xs truncate ${t.textMuted}`}>
                {activeSetlist ? `${activeSetlist.title} · ${activeSongs.length} เพลง` : 'แตะเพื่อสร้างเซ็ตลิสต์'}
              </span>
            </span>
            <ChevronDown className="w-4 h-4 opacity-60 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedSongIdx(Math.max(0, selectedSongIdx - 1))}
            disabled={activeSongs.length === 0 || selectedSongIdx === 0}
            aria-label="เพลงก่อนหน้า"
            className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedSongIdx(Math.min(activeSongs.length - 1, selectedSongIdx + 1))}
            disabled={activeSongs.length === 0 || selectedSongIdx >= activeSongs.length - 1}
            aria-label="เพลงถัดไป"
            className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`}
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
          {activeSetlist && (
            <button
              type="button"
              onClick={() => onStartPerformance(activeSetlist, selectedSongIdx)}
              disabled={activeSongs.length === 0}
              aria-label="Fullscreen stage mode"
              title="โหมดเวทีเต็มจอ (Stage Mode)"
              className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`}
            >
              <Maximize2 className="w-5 h-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Header */}
        <div className={`px-5 pt-5 pb-4 shrink-0 ${listOpen ? 'block' : 'hidden'} md:block`}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open navigation menu"
              title="Open Navigation Menu"
              className={`md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-xl cursor-pointer transition-colors motion-reduce:transition-none ${t.iconBtn} ${t.focus}`}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            {/* Set switcher */}
            <div ref={switcherRef} className="relative min-w-0 flex-1">
              <button
                ref={switcherTriggerRef}
                type="button"
                onClick={() => setShowSetSwitcher((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showSetSwitcher}
                title="เลือกหรือสลับเซ็ตลิสต์"
                className={`w-full min-h-11 rounded-xl flex items-center justify-between gap-2 text-left cursor-pointer ${t.focus}`}
              >
                <span className="min-w-0 flex flex-col">
                  <span className="font-display font-semibold text-[22px] sm:text-[24px] leading-tight truncate">
                    {activeSetlist ? activeSetlist.title : 'Select Setlist'}
                  </span>
                  <span className={`text-[13px] ${t.textMuted}`}>
                    {activeSongs.length} เพลง, ~{totalDurationMinutes} นาที
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 opacity-60 shrink-0 transition-transform motion-reduce:transition-none ${
                    showSetSwitcher ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>

              {showSetSwitcher && (
                <div
                  role="menu"
                  aria-label="Your setlists"
                  className={`absolute left-0 top-full mt-1.5 w-72 max-w-[calc(100vw-1.5rem)] rounded-xl border shadow-2xl z-40 overflow-hidden ${t.popover}`}
                >
                  <div className={`px-3.5 py-2.5 text-sm font-semibold border-b ${t.popoverDivider}`}>
                    เซ็ตลิสต์ของคุณ
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1">
                    {setlists.length === 0 && (
                      <p className={`px-3.5 py-3 text-sm ${t.textMuted}`}>ยังไม่มีเซ็ตลิสต์</p>
                    )}
                    {setlists.map((sl) => {
                      const isActive = activeSetlist?.id === sl.id;
                      return (
                        <div key={sl.id} className="flex items-stretch">
                          <button
                            type="button"
                            role="menuitemradio"
                            aria-checked={isActive}
                            onClick={() => {
                              onSelectSetlist(sl);
                              setShowSetSwitcher(false);
                              switcherTriggerRef.current?.focus();
                            }}
                            className={`flex-1 min-w-0 min-h-12 pl-3.5 pr-2 py-2 flex items-center gap-2 text-left cursor-pointer transition-colors motion-reduce:transition-none ${t.popoverItem} ${t.focusInset}`}
                          >
                            <span className="min-w-0 flex-1 flex flex-col">
                              <span className={`text-sm truncate ${isActive ? `font-bold ${t.accentText}` : ''}`}>
                                {sl.title}
                              </span>
                              <span className={`text-xs font-mono ${t.textMuted}`}>{sl.songIds.length} songs</span>
                            </span>
                            {isActive && (
                              <Check className={`w-4 h-4 shrink-0 ${t.accentText}`} aria-hidden="true" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowSetSwitcher(false);
                              setPendingDeleteSet(sl);
                            }}
                            aria-label={`ลบเซ็ตลิสต์ “${sl.title}”`}
                            title="Delete setlist"
                            className={`w-11 shrink-0 flex items-center justify-center cursor-pointer ${t.iconBtnDanger} ${t.focusInset}`}
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className={`p-2 border-t ${t.popoverDivider}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSetSwitcher(false);
                        setShowCreateModal(true);
                      }}
                      className={`w-full h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${t.accentBtn} ${t.focus}`}
                    >
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      สร้างเซ็ตลิสต์ใหม่
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ปุ่มสร้างเซ็ตลิสต์โดดเด่น เห็นได้ชัดเจนทันที */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              aria-label="สร้างเซ็ตลิสต์ใหม่"
              title="สร้างเซ็ตลิสต์ใหม่ (Create Setlist)"
              className={`h-11 px-3 sm:px-3.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-all shadow-xs ${t.accentBtn} ${t.focus}`}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              <span>สร้างเซ็ตลิสต์</span>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={openAddSongs}
              disabled={!activeSetlist}
              aria-label="Add songs to this set"
              title="เพิ่มเพลงเข้าเซ็ตนี้"
              className={`h-11 flex-1 rounded-xl text-[15px] font-display font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors motion-reduce:transition-none disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} border border-current ${t.focus}`}
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              เพิ่มเพลง (+ Add)
            </button>

            {activeSetlist && (
              <button
                type="button"
                onClick={() => onStartPerformance(activeSetlist, selectedSongIdx)}
                disabled={activeSongs.length === 0}
                aria-label="Fullscreen stage mode"
                title="โหมดเวทีเต็มจอ (Stage Mode)"
                className={`h-11 px-4 shrink-0 rounded-xl text-[15px] font-display font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors motion-reduce:transition-none disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`}
              >
                <Maximize2 className="w-4 h-4" aria-hidden="true" />
                Stage mode
              </button>
            )}
          </div>
        </div>

        {/* Reorder toggle: move / remove buttons only appear while this is on, so they cannot be hit by accident */}
        {activeSongs.length > 0 && (
          <div className={`px-3.5 pt-2.5 ${listOpen ? 'flex' : 'hidden'} md:flex items-center justify-between gap-2`}>
            <p className={`text-xs ${t.textMuted}`}>
              {isReordering ? 'ใช้ลูกศรเลื่อนลำดับ หรือเอาเพลงออกจากเซ็ต' : 'แตะเพลงเพื่อดูคอร์ด'}
            </p>
            <button
              type="button"
              onClick={() => setIsReordering((v) => !v)}
              aria-pressed={isReordering}
              className={`h-9 px-3 rounded-lg border text-sm font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors motion-reduce:transition-none ${
                isReordering ? t.segOn : t.ghostBtn
              } ${t.focus}`}
            >
              {isReordering ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  เสร็จ
                </>
              ) : (
                <>
                  <ArrowUpDown className="w-4 h-4" aria-hidden="true" />
                  จัดเรียง
                </>
              )}
            </button>
          </div>
        )}

        {/* Songs list */}
        <div className={`${listOpen ? 'block' : 'hidden'} md:block flex-1 overflow-y-auto p-2.5`}>
          {activeSongs.length === 0 ? (
            <div className={`text-center py-16 px-4 flex flex-col items-center gap-2 ${t.textMuted}`}>
              <Music className="w-10 h-10 mb-1 opacity-50" aria-hidden="true" />
              <p className="text-sm">No songs in this set yet.</p>
              <button
                type="button"
                onClick={openAddSongs}
                disabled={!activeSetlist}
                className={`mt-2 h-11 px-4 rounded-lg border text-sm font-semibold cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`}
              >
                + Add Songs from Library
              </button>
            </div>
          ) : (
            <ol className="space-y-2">
              {entries.map(({ song }, index) => {
                const isSelected = index === selectedSongIdx;
                const setKey = activeSetlist?.songKeys?.[song.id];
                const effectiveKey = setKey || song.key;
                const isTransposed = Boolean(setKey && setKey !== song.key);

                return (
                  <li
                    key={`${song.id}-${index}`}
                    className={`rounded-2xl border transition-colors motion-reduce:transition-none ${
                      isSelected ? t.cardSelected : t.cardIdle
                    }`}
                  >
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSongIdx(index);
                          setListOpen(false);
                        }}
                        aria-current={isSelected ? 'true' : undefined}
                        className={`flex-1 min-w-0 flex items-center gap-3.5 p-3 text-left rounded-2xl cursor-pointer ${t.focus}`}
                      >
                        <span
                          className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-keys font-bold text-sm shrink-0 ${
                            isSelected ? t.numberOn : t.numberOff
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display font-semibold text-[17px] truncate leading-tight">{song.title}</span>
                        </span>
                        <span className="shrink-0 flex flex-col items-end gap-0.5">
                          <span
                            title={
                              isTransposed
                                ? `Setlist Key: ${effectiveKey} (Original: ${song.key})`
                                : `Key: ${song.key}`
                            }
                            className={`min-w-[34px] h-8 px-2 rounded-[10px] border flex items-center justify-center font-keys font-bold text-sm ${
                              isTransposed ? t.accentSoft : t.keyBadge
                            }`}
                          >
                            {effectiveKey}
                          </span>
                          {isTransposed && (
                            <span className={`text-[10px] font-keys leading-none ${t.textMuted}`}>orig {song.key}</span>
                          )}
                        </span>
                      </button>

                      {isReordering && (
                        <div className="flex items-center gap-0.5 pr-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveSong(index, 'up')}
                            disabled={index === 0}
                            aria-label={`เลื่อน “${song.title}” ขึ้น`}
                            title="Move Up"
                            className={rowIconBtn}
                          >
                            <ArrowUp className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveSong(index, 'down')}
                            disabled={index === entries.length - 1}
                            aria-label={`เลื่อน “${song.title}” ลง`}
                            title="Move Down"
                            className={rowIconBtn}
                          >
                            <ArrowDown className="w-4 h-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSongFromSetlist(index)}
                            aria-label={`เอา “${song.title}” ออกจากเซ็ต`}
                            title="Remove from set"
                            className={`w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer ${t.iconBtnDanger} ${t.focus}`}
                          >
                            <X className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Prev / Next */}
        {activeSongs.length > 0 && (
          <div className={`p-2.5 border-t ${listOpen ? 'flex' : 'hidden'} md:flex items-center justify-between gap-2 shrink-0 ${t.bar}`}>
            <button
              type="button"
              onClick={() => setSelectedSongIdx(Math.max(0, selectedSongIdx - 1))}
              disabled={selectedSongIdx === 0}
              title="เพลงก่อนหน้า (กดปุ่มคีย์บอร์ด ←)"
              className={`${toolBtn} flex-1 text-sm font-medium`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>ก่อนหน้า (←)</span>
            </button>
            <span className={`text-xs font-mono px-1 ${t.textMuted}`} aria-live="polite">
              {selectedSongIdx + 1}/{activeSongs.length}
            </span>
            <button
              type="button"
              onClick={() => setSelectedSongIdx(Math.min(activeSongs.length - 1, selectedSongIdx + 1))}
              disabled={selectedSongIdx === activeSongs.length - 1}
              title="เพลงถัดไป (กดปุ่มคีย์บอร์ด →)"
              className={`${toolBtn} flex-1 text-sm font-medium`}
            >
              <span>ถัดไป (→)</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Close the list / drawer */}
        <button
          type="button"
          onClick={() => setListOpen(false)}
          aria-expanded={listOpen}
          className={`${listOpen ? 'flex' : 'hidden'} md:flex h-11 border-t items-center justify-center gap-1.5 text-sm font-semibold cursor-pointer shrink-0 ${t.bar} ${t.focus}`}
        >
          <ChevronDown className="w-4 h-4 rotate-180 md:hidden" aria-hidden="true" />
          <ChevronLeft className="w-4 h-4 hidden md:block" aria-hidden="true" />
          ซ่อนรายการเพลง
        </button>
      </div>

      {/* RIGHT PANE (min-w-0 / min-h-0 so the lyrics can never push the pane wider than the screen) */}
      <div
        className={`flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden relative ${t.page}`}
      >
        {currentSong ? (
          <SongViewer
            key={activeSetlist?.id ?? 'none'}
            isEmbedded={true}
            onOpenSetlistMenu={() => setListOpen(true)}
            song={currentSong}
            settings={settings}
            onUpdateSettings={onUpdateSettings}
            onEditSong={onEditSong}
            initialKey={activeSetlist?.songKeys?.[currentSong.id]}
            onKeyChange={(newKey) => {
              if (activeSetlist && currentSong) {
                handleSongKeyChange(currentSong.id, newKey);
              }
            }}
            onNextSong={() => {
              if (selectedSongIdx < activeSongs.length - 1) {
                setSelectedSongIdx(selectedSongIdx + 1);
              }
            }}
            onPrevSong={() => {
              if (selectedSongIdx > 0) {
                setSelectedSongIdx(selectedSongIdx - 1);
              }
            }}
            setlistContext={{
              currentIdx: selectedSongIdx,
              totalSongs: activeSongs.length,
              setlistTitle: activeSetlist?.title || 'Setlist',
              setlistId: activeSetlist?.id,
              targetKey: activeSetlist?.songKeys?.[currentSong.id],
              onKeyChange: (songId, newKey) => {
                handleSongKeyChange(songId, newKey);
              },
              songs: pickerSongs,
              onSelectSong: (idx) => setSelectedSongIdx(idx)
            }}
          />
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center p-8 text-center relative ${t.textMuted}`}>
            {/* Tablets: the setlist drawer is the only place to switch / create / delete sets, so it must stay reachable */}
            <button
              type="button"
              onClick={() => setListOpen(true)}
              aria-label="เปิดเมนูเซ็ตลิสต์"
              title="เมนูเซ็ตลิสต์"
              className={`hidden md:flex absolute top-4 left-4 w-11 h-11 items-center justify-center rounded-xl border cursor-pointer ${t.ghostBtn} ${t.focus}`}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <Music className="w-14 h-14 mb-3 opacity-40" aria-hidden="true" />
            <h3 className={`text-base font-bold ${t.textStrong}`}>
              {!activeSetlist
                ? 'ยังไม่มีเซ็ตลิสต์'
                : activeSongs.length === 0
                  ? 'No songs in this setlist'
                  : 'Select a song from the setlist'}
            </h3>
            <p className="text-sm max-w-sm mt-1">
              {!activeSetlist
                ? 'สร้างเซ็ตลิสต์ใหม่เพื่อจัดลำดับเพลงสำหรับการร้อง'
                : activeSongs.length === 0
                  ? 'กด “+ Add Songs Now” เพื่อเพิ่มเพลงเข้าเซ็ตนี้'
                  : 'Pick any song from the setlist to view its chords, lyrics, and transpose settings here.'}
            </p>

            {!activeSetlist && (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className={`mt-4 h-11 px-5 rounded-lg text-sm font-bold flex items-center gap-1.5 cursor-pointer ${t.accentBtn} ${t.focus}`}
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                สร้างเซ็ตลิสต์
              </button>
            )}

            {activeSetlist && activeSongs.length === 0 && (
              <button
                type="button"
                onClick={openAddSongs}
                className={`mt-4 h-11 px-5 rounded-lg text-sm font-bold cursor-pointer ${t.accentBtn} ${t.focus}`}
              >
                + Add Songs Now
              </button>
            )}

            {activeSetlist && (
              <button
                type="button"
                onClick={() => setListOpen(true)}
                className={`hidden md:flex mt-3 h-11 px-5 rounded-lg border text-sm font-semibold items-center gap-2 cursor-pointer ${t.ghostBtn} ${t.focus}`}
              >
                <Menu className="w-4 h-4" aria-hidden="true" />
                เปิดรายการเพลง
              </button>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateSetlistDialog t={t} onCreate={handleCreate} onClose={() => setShowCreateModal(false)} />
      )}

      {showAddSongModal && activeSetlist && (
        <AddSongsDialog
          t={t}
          setlistTitle={activeSetlist.title}
          songs={songs}
          existingIds={activeSetlist.songIds}
          onAdd={handleAddSongs}
          onClose={() => setShowAddSongModal(false)}
        />
      )}

      {pendingDeleteSet && (
        <ConfirmDialog
          tone="danger"
          theme={settings.theme}
          title={`ลบเซ็ตลิสต์ “${pendingDeleteSet.title}” ?`}
          message="เซ็ตลิสต์นี้จะถูกลบ เพลงในคลังจะไม่ถูกลบ"
          confirmLabel="ลบเซ็ตลิสต์"
          onCancel={() => setPendingDeleteSet(null)}
          onConfirm={() => {
            onDeleteSetlist(pendingDeleteSet.id);
            setPendingDeleteSet(null);
          }}
        />
      )}
    </div>
  );
};
