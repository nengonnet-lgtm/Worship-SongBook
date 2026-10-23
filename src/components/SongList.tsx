import React, { useState, useMemo } from 'react';
import { Song, Setlist } from '../types/song';
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
  SlidersHorizontal
} from 'lucide-react';

import { AppSettings } from '../types/song';

interface Props {
  songs: Song[];
  setlists: Setlist[];
  settings?: AppSettings;
  onOpenMenu: () => void;
  onSelectSong: (song: Song) => void;
  onEditSong: (song: Song) => void;
  onDeleteSong: (id: string) => void;
  onCreateSong: () => void;
  onImportSong: (file: File) => void;
  onExportLibrary: () => void;
  onAddSongToSetlist: (setlistId: string, songId: string) => void;
}

export const SongList: React.FC<Props> = ({
  songs,
  setlists,
  settings,
  onOpenMenu,
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
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'title' | 'artist' | 'tempo' | 'recent'>('title');
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [openSetlistDropdownId, setOpenSetlistDropdownId] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    songs.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [songs]);

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    return songs
      .filter((song) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.chordProContent.toLowerCase().includes(query);

        const matchesKey = selectedKey === 'all' || song.key === selectedKey;
        const matchesTag = selectedTag === 'all' || song.tags?.includes(selectedTag);

        return matchesSearch && matchesKey && matchesTag;
      })
      .sort((a, b) => {
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'artist') return a.artist.localeCompare(b.artist);
        if (sortBy === 'tempo') return (b.tempo || 0) - (a.tempo || 0);
        if (sortBy === 'recent') return b.lastModified - a.lastModified;
        return 0;
      });
  }, [songs, searchQuery, selectedKey, selectedTag, sortBy]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        onImportSong(files[i]);
      }
      setShowFabMenu(false);
      e.target.value = '';
    }
  };

  const isDarkSlate = settings?.theme === 'dark';
  const isLight = settings?.theme === 'light';
  const isStageBlack = settings?.theme === 'stage-black';

  const containerBg = isStageBlack
    ? 'bg-black text-neutral-100'
    : isLight
    ? 'bg-white text-slate-900'
    : 'bg-[#0b1322] text-slate-100';

  const commandBarBg = isStageBlack
    ? 'bg-black border-neutral-900 text-neutral-100'
    : isLight
    ? 'bg-white border-blue-100 text-slate-900 shadow-xs'
    : 'bg-[#182338] border-slate-700/80 text-slate-100';

  const searchInputStyle = isLight
    ? 'bg-sky-50/70 border-blue-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600'
    : isDarkSlate
    ? 'bg-slate-900/90 border-slate-700 text-slate-100 placeholder-slate-400 focus:border-sky-400'
    : 'bg-neutral-800/80 border-neutral-700/80 text-neutral-100 placeholder-neutral-500 focus:border-amber-400';

  const newSongBtnStyle = isLight
    ? 'bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs'
    : isDarkSlate
    ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black'
    : 'bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold';

  const filterBarBg = isLight
    ? 'border-blue-100 bg-sky-50/60'
    : isDarkSlate
    ? 'border-slate-800 bg-[#0f172a]'
    : 'border-neutral-800 bg-neutral-900/40';

  const selectStyle = isLight
    ? 'bg-white border-blue-200 text-slate-800 focus:border-blue-600'
    : isDarkSlate
    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-sky-400'
    : 'bg-neutral-800 border-neutral-700 text-neutral-200 focus:border-amber-400';

  const divideStyle = isLight
    ? 'divide-blue-100'
    : isDarkSlate
    ? 'divide-slate-800'
    : 'divide-neutral-800/80';

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${containerBg}`}>
      {/* SongBook Pro Command Bar */}
      <div className={`px-4 py-3 border-b flex items-center justify-between gap-3 shrink-0 ${commandBarBg}`}>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMenu}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'hover:bg-blue-50 text-blue-900 border border-blue-200/60' : isDarkSlate ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title="Open Menu (Worship SongBook)"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-base sm:text-lg font-bold tracking-tight leading-none ${isLight ? 'text-slate-900' : ''}`}>
              Songs
            </h1>
            <span className={`text-[11px] font-mono ${isLight ? 'text-blue-700 font-medium' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'}`}>
              {filteredSongs.length} of {songs.length} songs
            </span>
          </div>
        </div>

        {/* Quick Search in Command Bar */}
        <div className="flex-1 max-w-md mx-2 relative">
          <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isLight ? 'text-blue-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search titles, artists, lyrics..."
            className={`w-full pl-9 pr-8 py-1.5 rounded-xl border text-xs sm:text-sm focus:outline-none transition-colors ${searchInputStyle}`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-2.5 top-2.5 opacity-60 hover:opacity-100 cursor-pointer ${isLight ? 'text-slate-600' : ''}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Button: New Song */}
        <button
          onClick={onCreateSong}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm ${newSongBtnStyle}`}
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Song</span>
        </button>
      </div>

      {/* Filter Chips Bar (Key, Tags, Sort) */}
      <div className={`px-4 py-2 border-b flex items-center gap-2 overflow-x-auto text-xs shrink-0 ${filterBarBg}`}>
        <span className={`text-[11px] font-semibold uppercase tracking-wider shrink-0 ${
          isLight ? 'text-blue-900 font-bold' : isDarkSlate ? 'text-slate-400' : 'text-neutral-500'
        }`}>
          Filter:
        </span>

        {/* Key Picker Filter */}
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none cursor-pointer shrink-0 ${selectStyle}`}
        >
          <option value="all">All Keys</option>
          {KEYS.map((k) => (
            <option key={k} value={k}>
              Key: {k}
            </option>
          ))}
        </select>

        {/* Tag Filter */}
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none cursor-pointer shrink-0 ${selectStyle}`}
        >
          <option value="all">All Tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Sort Filter */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className={`px-2.5 py-1 rounded-lg border text-xs focus:outline-none cursor-pointer shrink-0 ${selectStyle}`}
        >
          <option value="title">Title (A-Z)</option>
          <option value="artist">Artist (A-Z)</option>
          <option value="tempo">Tempo (BPM)</option>
          <option value="recent">Recently Added</option>
        </select>

        {/* Import/Export buttons */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <label className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer border ${
            isLight
              ? 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200 shadow-xs'
              : isDarkSlate
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border-neutral-700'
          }`}>
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
            <input
              type="file"
              accept=".json,.cho,.chordpro,.pro,.txt,.chopro"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onExportLibrary}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs cursor-pointer border ${
              isLight
                ? 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200 shadow-xs'
                : isDarkSlate
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-300 border-neutral-700'
            }`}
            title="Backup to JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Backup</span>
          </button>
        </div>
      </div>

      {/* Main Song List Table / Rows */}
      <div className={`flex-1 overflow-y-auto divide-y ${divideStyle}`}>
        {filteredSongs.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2">
            <Music className={`w-12 h-12 ${isLight ? 'text-blue-300' : isDarkSlate ? 'text-slate-600' : 'text-neutral-700'}`} />
            <p className={`text-sm ${isLight ? 'text-slate-600' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'}`}>No songs found in this filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedKey('all');
                setSelectedTag('all');
              }}
              className={`text-xs underline cursor-pointer ${isLight ? 'text-blue-600' : isDarkSlate ? 'text-sky-400' : 'text-amber-400'}`}
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredSongs.map((song) => (
            <div
              key={song.id}
              onClick={() => onSelectSong(song)}
              className={`group flex items-center justify-between px-4 sm:px-6 py-3.5 transition-colors cursor-pointer select-none ${
                isLight
                  ? 'hover:bg-blue-50/60'
                  : isDarkSlate
                  ? 'hover:bg-[#182338]/80'
                  : 'hover:bg-neutral-900/80'
              }`}
            >
              {/* Left: Title & Artist */}
              <div className="flex flex-col min-w-0 pr-4">
                <span className={`font-bold text-sm sm:text-base transition-colors truncate ${
                  isLight
                    ? 'text-slate-900 group-hover:text-blue-700'
                    : isDarkSlate
                    ? 'text-slate-100 group-hover:text-sky-400'
                    : 'text-neutral-100 group-hover:text-amber-400'
                }`}>
                  {song.title}
                </span>
                <div className={`flex items-center gap-2 text-xs mt-0.5 truncate ${
                  isLight ? 'text-slate-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'
                }`}>
                  <span>{song.artist || 'Unknown Artist'}</span>
                  {song.tempo && (
                    <>
                      <span>·</span>
                      <span className="font-mono text-[11px] opacity-75">{song.tempo} BPM</span>
                    </>
                  )}
                  {song.capo > 0 && (
                    <>
                      <span>·</span>
                      <span className={`text-[11px] ${isLight ? 'text-blue-600 font-semibold' : isDarkSlate ? 'text-sky-400' : 'text-amber-300/80'}`}>Capo {song.capo}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Key Box & Actions (Authentic SongBook Pro key box) */}
              <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                {/* Key Badge */}
                <div className={`w-11 h-9 rounded-lg border flex flex-col items-center justify-center font-mono font-bold text-sm shadow-xs transition-colors ${
                  isLight
                    ? 'bg-sky-50 text-blue-700 border-blue-200 group-hover:border-blue-400 group-hover:bg-blue-100/60'
                    : isDarkSlate
                    ? 'bg-slate-900 text-sky-400 border-slate-700 group-hover:border-sky-400'
                    : 'bg-neutral-900 text-amber-400 border-neutral-700/80 group-hover:border-amber-400/50'
                }`}>
                  <span>{song.key}</span>
                </div>

                {/* Setlist Add dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenSetlistDropdownId(
                        openSetlistDropdownId === song.id ? null : song.id
                      )
                    }
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isLight
                        ? 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                    title="Add to a Setlist"
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>

                  {openSetlistDropdownId === song.id && (
                    <div className={`absolute right-0 top-full mt-1 w-48 rounded-xl shadow-2xl py-1 z-30 border ${
                      isLight
                        ? 'bg-white border-blue-200 text-slate-800 shadow-blue-900/10'
                        : 'bg-neutral-900 border-neutral-700'
                    }`}>
                      <div className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold border-b ${
                        isLight
                          ? 'text-blue-700 border-blue-100 bg-sky-50/60'
                          : 'text-neutral-400 border-neutral-800'
                      }`}>
                        Add to Setlist
                      </div>
                      {setlists.length === 0 ? (
                        <div className={`px-3 py-2 text-xs ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                          No setlists created yet
                        </div>
                      ) : (
                        setlists.map((sl) => (
                          <button
                            key={sl.id}
                            onClick={() => {
                              onAddSongToSetlist(sl.id, song.id);
                              setOpenSetlistDropdownId(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors truncate cursor-pointer ${
                              isLight
                                ? 'text-slate-700 hover:bg-blue-50 hover:text-blue-800'
                                : 'text-neutral-200 hover:bg-neutral-800'
                            }`}
                          >
                            + {sl.title}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => onEditSong(song)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-400 hover:text-blue-700 hover:bg-blue-50'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                  title="Edit song"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => onDeleteSong(song.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                      : 'text-neutral-500 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                  title="Delete song"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
