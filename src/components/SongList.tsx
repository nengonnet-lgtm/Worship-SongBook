import React, { useMemo, useRef, useState } from 'react';
import { Song, Setlist, AppSettings } from '../types/song';
import { KEYS } from '../utils/chordUtils';
import {
  Search,
  Plus,
  Music,
  Upload,
  Download,
  Trash2,
  Edit2,
  ListPlus,
  FileText,
  X,
  Menu,
  FileCode,
  ChevronDown,
  Check,
  Settings,
  RotateCcw,
  MoreHorizontal
} from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { RadioGroup, tabIndexFor } from './RadioGroup';
import { getThemeStyles } from '../utils/themeStyles';
import type { ThemeStyles } from '../utils/themeStyles';
import { useDismiss } from '../utils/useDialog';

interface Props {
  songs: Song[];
  setlists: Setlist[];
  settings?: AppSettings;
  onOpenMenu: () => void;
  onOpenSettings?: () => void;
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onCreateSong: () => void;
  onImportSong: (file: File) => void;
  onExportLibrary: (format?: 'json-songs' | 'ts' | 'json-full') => void;
  onAddSongToSetlist: (setlistId: string, songId: string) => void;
}

type SortBy = 'title' | 'artist' | 'tempo' | 'recent';

// Thai-aware ordering (leading vowels such as เ แ โ ไ do not decide the position)
const collator = new Intl.Collator(['th', 'en']);

const IMPORT_ACCEPT = '.json,.cho,.chordpro,.pro,.txt,.chopro';

/* ------------------------------------------------------------------ */
/* Add-to-setlist menu (one per row, closes on outside tap / Escape)    */
/* ------------------------------------------------------------------ */
const AddToSetlistMenu: React.FC<{
  song: Song;
  setlists: Setlist[];
  t: ThemeStyles;
  onAdd: (setlistId: string, songId: string) => void;
}> = ({ song, setlists, t, onAdd }) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useDismiss(wrapRef, open, () => setOpen(false), triggerRef);

  const toggle = () => {
    if (!open && wrapRef.current) {
      // Open upwards when there is not enough room below (last rows of the list)
      const rect = wrapRef.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < 300 && rect.top > below ? 'up' : 'down');
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`เพิ่ม “${song.title}” เข้าเซ็ตลิสต์`}
        title="Add to setlist (เพิ่มเข้าเซ็ตลิสต์)"
        className={`w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-colors motion-reduce:transition-none ${
          open ? t.accentSoft + ' border' : t.iconBtn
        } ${t.focus}`}
      >
        <ListPlus className="w-5 h-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="เพิ่มเข้าเซ็ตลิสต์"
          className={`absolute right-0 z-30 w-64 max-w-[calc(100vw-1.5rem)] rounded-xl border shadow-2xl overflow-hidden ${
            placement === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${t.popover}`}
        >
          <div className={`px-3.5 py-2.5 text-sm font-semibold border-b ${t.popoverDivider}`}>
            เพิ่มเข้าเซ็ตลิสต์
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {setlists.length === 0 ? (
              <p className={`px-3.5 py-3 text-sm ${t.textMuted}`}>
                No setlists created yet (ยังไม่มีเซ็ตลิสต์)
              </p>
            ) : (
              setlists.map((sl) => {
                const already = sl.songIds.includes(song.id);
                return (
                  <button
                    key={sl.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onAdd(sl.id, song.id);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`w-full min-h-11 px-3.5 py-2 flex items-center justify-between gap-3 text-left text-sm cursor-pointer transition-colors motion-reduce:transition-none ${t.popoverItem} ${t.focusInset}`}
                  >
                    <span className="truncate">{sl.title}</span>
                    {already && (
                      <span className={`flex items-center gap-1 text-xs shrink-0 ${t.accentText}`}>
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        อยู่ในเซ็ตแล้ว
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* "More" menu of a row: holds the delete action so it is never one tap from edit */
/* ------------------------------------------------------------------ */
const RowMoreMenu: React.FC<{
  song: Song;
  t: ThemeStyles;
  onDelete: (song: Song) => void;
}> = ({ song, t, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'down' | 'up'>('down');
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useDismiss(wrapRef, open, () => setOpen(false), triggerRef);

  const toggle = () => {
    if (!open && wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      setPlacement(below < 120 && rect.top > below ? 'up' : 'down');
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`ตัวเลือกเพิ่มเติมของ “${song.title}”`}
        title="More"
        className={`w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-colors motion-reduce:transition-none ${t.iconBtn} ${t.focus}`}
      >
        <MoreHorizontal className="w-5 h-5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="More"
          className={`absolute right-0 z-30 w-48 rounded-xl border shadow-2xl overflow-hidden ${
            placement === 'up' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${t.popover}`}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete(song);
            }}
            className={`w-full h-12 px-4 flex items-center gap-3 text-left text-sm font-medium cursor-pointer transition-colors motion-reduce:transition-none ${
              t.isLight
                ? 'text-[#B3203E] hover:bg-[#B3203E]/10'
                : 'text-[#FF6B81] hover:bg-[#D6294A]/15'
            } ${t.focusInset}`}
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            ลบเพลง
          </button>
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* One song row                                                         */
/* ------------------------------------------------------------------ */
const SongRow: React.FC<{
  song: Song;
  setlists: Setlist[];
  t: ThemeStyles;
  onSelect: (song: Song) => void;
  onEdit: (song: Song) => void;
  onRequestDelete: (song: Song) => void;
  onAddToSetlist: (setlistId: string, songId: string) => void;
}> = ({ song, setlists, t, onSelect, onEdit, onRequestDelete, onAddToSetlist }) => (
  <div className={`group flex items-center gap-1 px-3 py-2.5 rounded-2xl transition-colors motion-reduce:transition-none ${t.rowHover}`}>
    {/* Everything on the left opens the song; a real button so Tab / Enter / Space work */}
    <button
      type="button"
      onClick={() => onSelect(song)}
      className={`flex-1 min-w-0 flex items-center gap-3 sm:gap-3.5 text-left rounded-xl cursor-pointer ${t.focus}`}
    >
      <span
        className={`min-w-[34px] h-8 px-2 shrink-0 rounded-[10px] border flex items-center justify-center font-keys font-bold text-sm ${t.keyBadge}`}
      >
        <span className="sr-only">Key </span>
        {song.key}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display font-semibold text-lg leading-snug truncate">{song.title}</span>
      </span>
    </button>

    <div className="flex items-center shrink-0">
      <AddToSetlistMenu song={song} setlists={setlists} t={t} onAdd={onAddToSetlist} />
      <button
        type="button"
        onClick={() => onEdit(song)}
        aria-label={`แก้ไข “${song.title}”`}
        title="Edit song (แก้ไข)"
        className={`w-11 h-11 flex items-center justify-center rounded-xl cursor-pointer transition-colors motion-reduce:transition-none ${t.iconBtn} ${t.focus}`}
      >
        <Edit2 className="w-5 h-5" aria-hidden="true" />
      </button>
      <RowMoreMenu song={song} t={t} onDelete={onRequestDelete} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/* Song list screen                                                     */
/* ------------------------------------------------------------------ */
export const SongList: React.FC<Props> = ({
  songs,
  setlists,
  settings,
  onOpenMenu,
  onOpenSettings,
  onSelectSong,
  onEditSong,
  onDeleteSong,
  onCreateSong,
  onImportSong,
  onExportLibrary,
  onAddSongToSetlist
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortBy>('title');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Song | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportWrapRef = useRef<HTMLDivElement>(null);
  const exportTriggerRef = useRef<HTMLButtonElement>(null);
  useDismiss(exportWrapRef, showExportMenu, () => setShowExportMenu(false), exportTriggerRef);

  const t = getThemeStyles(settings?.theme);

  // Lyrics with the [chord] markers removed, so a word that a chord splits in the middle can still be found
  const lyricIndex = useMemo(() => {
    const index = new Map<string, string>();
    songs.forEach((song) => {
      index.set(song.id, (song.chordProContent || '').replace(/\[[^\]]*\]/g, '').toLowerCase());
    });
    return index;
  }, [songs]);

  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    /** How well a song matches the search: lower = shown earlier. */
    const rankOf = (song: Song): number => {
      if (!query) return 0;
      const title = song.title.toLowerCase();
      if (title === query) return 0; // title is exactly the search
      if (title.startsWith(query)) return 1; // title starts with the search
      if (title.includes(query)) return 2; // search appears in the title
      if (
        (song.artist || '').toLowerCase().includes(query) ||
        (song.tags && song.tags.some((tag) => tag.toLowerCase().includes(query))) ||
        (song.key || '').toLowerCase() === query
      ) {
        return 3; // artist / tag / key
      }
      return 4; // only in the lyrics or notes
    };

    const bySortOption = (a: Song, b: Song) => {
      if (sortBy === 'title') return collator.compare(a.title, b.title);
      if (sortBy === 'artist') return collator.compare(a.artist || '', b.artist || '');
      if (sortBy === 'tempo') return (b.tempo || 0) - (a.tempo || 0);
      if (sortBy === 'recent') return b.lastModified - a.lastModified;
      return 0;
    };

    return songs
      .filter((song) => {
        const matchesSearch =
          !query ||
          song.title.toLowerCase().includes(query) ||
          (song.artist || '').toLowerCase().includes(query) ||
          (song.chordProContent || '').toLowerCase().includes(query) ||
          (lyricIndex.get(song.id) || '').includes(query) ||
          (song.tags && song.tags.some((tag) => tag.toLowerCase().includes(query))) ||
          (song.notes && song.notes.toLowerCase().includes(query)) ||
          (song.key || '').toLowerCase() === query;

        const matchesKey = selectedKey === 'all' || song.key === selectedKey;
        return matchesSearch && matchesKey;
      })
      .map((song) => ({ song, rank: rankOf(song) }))
      // While searching, better matches come first; the chosen sort order applies within each group
      .sort((a, b) => a.rank - b.rank || bySortOption(a.song, b.song))
      .map((entry) => entry.song);
  }, [songs, searchQuery, selectedKey, sortBy, lyricIndex]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onImportSong(files[i]);
      }
      e.target.value = '';
    }
  };

  const openImport = () => fileInputRef.current?.click();
  const hasFilters = Boolean(searchQuery) || selectedKey !== 'all';
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedKey('all');
  };

  const barBtn = `h-11 px-4 rounded-xl border text-[15px] font-display font-medium flex items-center gap-2 cursor-pointer transition-colors motion-reduce:transition-none ${t.ghostBtn} ${t.focus}`;
  const countLabel =
    filteredSongs.length === songs.length
      ? `${songs.length} เพลงในคลัง`
      : `${filteredSongs.length} จาก ${songs.length} เพลง`;

  const exportOptions = [
    {
      format: 'json-songs' as const,
      title: 'JSON (.json)',
      badge: 'แนะนำ',
      desc: 'Array เพลงเพียว ๆ สำหรับ Backup หรือ Import เข้าเครื่องอื่น',
      Icon: FileText,
      tint: 'bg-emerald-500/10 text-emerald-500'
    },
    {
      format: 'ts' as const,
      title: 'TypeScript (sampleSongs.ts)',
      badge: '',
      desc: 'โค้ด TypeScript พร้อม import/export นำไปวางในโปรเจกต์ได้ทันที',
      Icon: FileCode,
      tint: 'bg-sky-500/10 text-sky-500'
    },
    {
      format: 'json-full' as const,
      title: 'Full Backup (.json)',
      badge: '',
      desc: 'สำรองทั้งเพลงทั้งหมดและรายการ Setlists ทั้งหมด',
      Icon: Download,
      tint: 'bg-amber-500/10 text-amber-500'
    }
  ];

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${t.page}`}>
      {/* Hidden file input shared by the Import button and the empty state */}
      <input
        ref={fileInputRef}
        type="file"
        accept={IMPORT_ACCEPT}
        multiple
        onChange={handleFileUpload}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="px-4 sm:px-8 pt-6 pb-4 flex items-end justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            title="Open Menu (Worship SongBook)"
            className={`md:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-xl cursor-pointer transition-colors motion-reduce:transition-none ${t.iconBtn} ${t.focus}`}
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="min-w-0">
            <h1 className="font-display font-semibold text-3xl leading-none">Songs</h1>
            <p className={`mt-1.5 text-base ${t.textMuted}`} aria-live="polite">
              {countLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={openImport}
            aria-label="Import songs"
            title="Import songs (JSON, ChordPro, Text)"
            className={barBtn}
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span className="hidden md:inline">Import</span>
          </button>

          {/* Export menu */}
          <div ref={exportWrapRef} className="relative">
            <button
              ref={exportTriggerRef}
              type="button"
              onClick={() => setShowExportMenu((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={showExportMenu}
              aria-label="Export songs"
              title="Export songs (JSON / TypeScript .ts)"
              className={barBtn}
            >
              <Download className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-70 transition-transform motion-reduce:transition-none ${
                  showExportMenu ? 'rotate-180' : ''
                }`}
                aria-hidden="true"
              />
            </button>

            {showExportMenu && (
              <div
                role="menu"
                aria-label="Export format"
                className={`absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl border shadow-2xl z-50 overflow-hidden ${t.popover}`}
              >
                <div className={`px-4 py-3 text-sm font-semibold border-b ${t.popoverDivider}`}>
                  Export format (เลือกรูปแบบส่งออก)
                </div>
                {exportOptions.map((opt, i) => (
                  <button
                    key={opt.format}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setShowExportMenu(false);
                      onExportLibrary(opt.format);
                    }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 cursor-pointer transition-colors motion-reduce:transition-none ${
                      i > 0 ? `border-t ${t.popoverDivider}` : ''
                    } ${t.popoverItem} ${t.focusInset}`}
                  >
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${opt.tint}`}>
                      <opt.Icon className="w-4 h-4" aria-hidden="true" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        {opt.title}
                        {opt.badge && (
                          <span className="text-xs px-1.5 rounded bg-emerald-500/15 text-emerald-500 font-normal">
                            {opt.badge}
                          </span>
                        )}
                      </span>
                      <span className={`block mt-0.5 text-xs leading-snug ${t.textMuted}`}>{opt.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {onOpenSettings && (
            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Settings"
              title="Settings (การตั้งค่า)"
              className={`${barBtn} md:hidden`}
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={onCreateSong}
            aria-label="New song"
            className={`h-11 px-4 sm:px-5 rounded-xl text-[15px] font-display font-medium flex items-center gap-1.5 cursor-pointer transition-colors motion-reduce:transition-none ${t.accentBtn} ${t.focus}`}
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">New song</span>
          </button>
        </div>
      </div>

      {/* Search, sort and key filter */}
      <div className="px-4 sm:px-8 pb-4 space-y-3 shrink-0">
        <div className="flex items-stretch gap-2.5">
          <div className="relative flex-1 min-w-0">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none ${
                searchQuery ? t.accentText : t.textMuted
              }`}
              aria-hidden="true"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && searchQuery) {
                  e.stopPropagation();
                  setSearchQuery('');
                }
              }}
              placeholder="ค้นหาชื่อเพลง ศิลปิน หรือเนื้อร้อง"
              aria-label="Search songs by title, artist or lyrics"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
              className={`w-full h-12 pl-11 ${searchQuery ? 'pr-12' : 'pr-4'} rounded-xl border text-base transition-colors motion-reduce:transition-none ${t.field} ${t.focus}`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                title="Clear search (ล้างคำค้น, Esc)"
                className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer ${t.iconBtn} ${t.focus}`}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            aria-label="Sort songs"
            title="Sort songs"
            className={`h-12 px-3 rounded-xl border text-[15px] font-display font-medium cursor-pointer ${t.field} ${t.focus}`}
          >
            <option value="title">Title A-Z</option>
            <option value="artist">Artist A-Z</option>
            <option value="tempo">Tempo (BPM)</option>
            <option value="recent">Recently added</option>
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              title="Reset all filters and search"
              aria-label="Reset filters"
              className={`${barBtn} h-12 shrink-0`}
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Key filter: chips scroll sideways, arrow keys move between them */}
        <RadioGroup label="Filter by key" className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {['all', ...KEYS].map((k, i) => {
            const selected = selectedKey === k;
            return (
              <button
                key={k}
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={tabIndexFor(selected, i, true)}
                onClick={() => setSelectedKey(k)}
                className={`h-11 px-4 shrink-0 rounded-xl border text-sm font-medium cursor-pointer transition-colors motion-reduce:transition-none ${
                  k === 'all' ? 'font-display text-[15px]' : 'font-keys'
                } ${selected ? t.chipOn : t.chip} ${t.focus}`}
              >
                {k === 'all' ? 'All keys' : k}
              </button>
            );
          })}
        </RadioGroup>
      </div>

      {/* Song rows */}
      <div className={`flex-1 overflow-y-auto px-3 sm:px-5 pb-8 divide-y ${t.divide}`}>
        {filteredSongs.length === 0 ? (
          songs.length === 0 ? (
            <div className="py-20 px-4 text-center flex flex-col items-center justify-center gap-3">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${t.keyBadge}`}>
                <Music className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold">ยังไม่มีเพลงในคลัง</h2>
              <p className={`text-sm max-w-xs ${t.textMuted}`}>
                เริ่มจากสร้างเพลงใหม่ หรือนำเข้าไฟล์ JSON / ChordPro / Text
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onCreateSong}
                  className={`h-11 px-5 rounded-xl text-[15px] font-display font-medium flex items-center gap-2 cursor-pointer ${t.accentBtn} ${t.focus}`}
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  New Song
                </button>
                <button type="button" onClick={openImport} className={`${barBtn} h-11 px-5`}>
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  Import
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 px-4 text-center flex flex-col items-center justify-center gap-3">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${t.keyBadge}`}>
                <Search className="w-7 h-7" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold">No songs found (ไม่พบเพลงที่ค้นหา)</h2>
              <button
                type="button"
                onClick={clearFilters}
                className={`mt-1 h-11 px-5 rounded-lg border text-sm font-semibold cursor-pointer ${t.ghostBtn} ${t.focus}`}
              >
                Clear filters &amp; search (ล้างตัวกรองทั้งหมด)
              </button>
            </div>
          )
        ) : (
          filteredSongs.map((song) => (
            <SongRow
              key={song.id}
              song={song}
              setlists={setlists}
              t={t}
              onSelect={onSelectSong}
              onEdit={onEditSong}
              onRequestDelete={setPendingDelete}
              onAddToSetlist={onAddSongToSetlist}
            />
          ))
        )}
      </div>

      {pendingDelete && (
        <ConfirmDialog
          tone="danger"
          theme={settings?.theme}
          title={`ลบเพลง “${pendingDelete.title}” ?`}
          message="เพลงนี้จะถูกลบออกจากคลังเพลง"
          confirmLabel="ลบเพลง"
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            onDeleteSong(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
};
