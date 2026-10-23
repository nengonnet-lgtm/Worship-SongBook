import React, { useState, useEffect } from 'react';
import { Setlist, Song, AppSettings } from '../types/song';
import { SongViewer } from './SongViewer';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Music,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Menu,
  Maximize2
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
  // ฟังก์ชันจัดรูปแบบวันที่ปัจจุบันเป็น DD-MM-YYYY (เช่น 19-10-2026)
  const getFormattedTodayDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [selectedSongIdx, setSelectedSongIdx] = useState<number>(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddSongModal, setShowAddSongModal] = useState(false);
  const [showSetSwitcher, setShowSetSwitcher] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongIdsForAdd, setSelectedSongIdsForAdd] = useState<string[]>([]);

  // Form states for new set
  const [newTitle, setNewTitle] = useState(getFormattedTodayDate());
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDesc, setNewDesc] = useState('');

  // If no active setlist is selected, pick the first one
  useEffect(() => {
    if (!activeSetlist && setlists.length > 0) {
      onSelectSetlist(setlists[0]);
    }
  }, [activeSetlist, setlists, onSelectSetlist]);

  // Reset selected song index when setlist changes
  useEffect(() => {
    setSelectedSongIdx(0);
  }, [activeSetlist?.id]);

  // Handle setlist creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateSetlist(newTitle.trim(), newDate, newDesc.trim());

    setNewTitle(getFormattedTodayDate());
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewDesc('');
    setShowCreateModal(false);
  };

  // เลือก/ยกเลิกเลือกเพลงแบบ Multi-select
  const toggleSongSelection = (songId: string) => {
    setSelectedSongIdsForAdd((prev) =>
      prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId]
    );
  };

  // เพิ่มรายการเพลงที่เลือกไว้ทั้งหมดลง Setlist
  const handleAddSelectedSongs = () => {
    if (!activeSetlist || selectedSongIdsForAdd.length === 0) return;

    onUpdateSetlist({
      ...activeSetlist,
      songIds: [...activeSetlist.songIds, ...selectedSongIdsForAdd]
    });

    setSelectedSongIdsForAdd([]);
    setShowAddSongModal(false);
  };

  // เปิด Modal เพิ่มเพลงพร้อมล้างค่าค้าง
  const handleOpenAddSongModal = () => {
    setSearchQuery('');
    setSelectedSongIdsForAdd([]);
    setShowAddSongModal(true);
  };

  // Reorder songs in active setlist
  const moveSong = (index: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSetlist) return;
    const newSongIds = [...activeSetlist.songIds];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSongIds.length) return;

    const temp = newSongIds[index];
    newSongIds[index] = newSongIds[targetIdx];
    newSongIds[targetIdx] = temp;

    onUpdateSetlist({
      ...activeSetlist,
      songIds: newSongIds
    });

    if (selectedSongIdx === index) {
      setSelectedSongIdx(targetIdx);
    } else if (selectedSongIdx === targetIdx) {
      setSelectedSongIdx(index);
    }
  };

  const removeSongFromSetlist = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeSetlist) return;
    const newSongIds = activeSetlist.songIds.filter((_, i) => i !== index);
    onUpdateSetlist({
      ...activeSetlist,
      songIds: newSongIds
    });
    if (selectedSongIdx >= newSongIds.length) {
      setSelectedSongIdx(Math.max(0, newSongIds.length - 1));
    }
  };

  const handleSongKeyChange = (songId: string, newKey: string) => {
    if (!activeSetlist) return;
    const updatedSetlist: Setlist = {
      ...activeSetlist,
      songKeys: {
        ...(activeSetlist.songKeys || {}),
        [songId]: newKey
      }
    };
    onUpdateSetlist(updatedSetlist);
  };

  // Filter songs by search query
  const filteredSongs = songs.filter((song) => {
    const q = searchQuery.toLowerCase();
    return (
      song.title.toLowerCase().includes(q) ||
      (song.artist && song.artist.toLowerCase().includes(q)) ||
      (song.key && song.key.toLowerCase().includes(q))
    );
  });

  // Map active setlist song objects
  const activeSongs: Song[] = activeSetlist
    ? activeSetlist.songIds
        .map((id) => songs.find((s) => s.id === id))
        .filter((s): s is Song => Boolean(s))
    : [];

  const currentSong = activeSongs[selectedSongIdx] || null;

  const totalDurationMinutes = Math.round(
    activeSongs.reduce((acc, s) => acc + (s.duration || 180), 0) / 60
  );

  const isDarkSlate = settings.theme === 'dark';
  const isLight = settings.theme === 'light';
  const isStageBlack = settings.theme === 'stage-black';

  const containerBg = isStageBlack
    ? 'bg-black text-neutral-100'
    : isLight
    ? 'bg-white text-slate-900'
    : 'bg-[#0b1322] text-slate-100';

  const leftPaneBg = isStageBlack
    ? 'bg-black md:border-neutral-900'
    : isLight
    ? 'bg-white md:border-blue-100 text-slate-900'
    : 'bg-[#0f172a] md:border-slate-800 text-slate-100';

  const leftHeaderBg = isStageBlack
    ? 'bg-black border-neutral-900'
    : isLight
    ? 'bg-sky-50/70 border-blue-100'
    : 'bg-[#182338] border-slate-700/80';

  return (
    <div className={`flex-1 flex flex-col md:flex-row h-full w-full overflow-hidden ${containerBg}`}>
      {/* LEFT PANE */}
      <div className={`w-full md:w-80 lg:w-96 md:border-r flex flex-col shrink-0 h-full overflow-hidden ${leftPaneBg}`}>
        {/* Top Command Header */}
        <div className={`p-3.5 border-b flex items-center justify-between gap-2 shrink-0 ${leftHeaderBg}`}>
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onOpenMenu}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                isLight
                  ? 'hover:bg-blue-50 text-blue-900 border border-blue-200/60'
                  : isDarkSlate
                  ? 'hover:bg-slate-700 text-slate-300 hover:text-white'
                  : 'hover:bg-neutral-800 text-neutral-300 hover:text-white'
              }`}
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Set Switcher Dropdown */}
            <div className="relative min-w-0">
              <button
                onClick={() => setShowSetSwitcher(!showSetSwitcher)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-left transition-colors cursor-pointer max-w-full border ${
                  isLight
                    ? 'bg-white hover:bg-blue-50 text-slate-900 border-blue-200 shadow-xs'
                    : isDarkSlate
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-100 border-neutral-700'
                }`}
                title="Switch Set"
              >
                <div className="flex flex-col truncate">
                  <span className="font-bold text-xs sm:text-sm truncate">
                    {activeSetlist ? activeSetlist.title : 'Select Setlist'}
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-blue-700 font-medium' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'}`}>
                    {activeSongs.length} songs · ~{totalDurationMinutes}m
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0 ml-1" />
              </button>

              {/* Set Switcher Popup */}
              {showSetSwitcher && (
                <div className={`absolute left-0 top-full mt-1 w-72 rounded-xl shadow-2xl py-1.5 z-40 border ${
                  isLight
                    ? 'bg-white border-blue-200 text-slate-800 shadow-blue-900/10'
                    : 'bg-neutral-900 border-neutral-700'
                }`}>
                  <div className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold border-b flex justify-between items-center ${
                    isLight ? 'text-blue-700 border-blue-100 bg-sky-50/60' : 'text-neutral-400 border-neutral-800'
                  }`}>
                    <span>Your Setlists</span>
                    <button
                      onClick={() => {
                        setShowSetSwitcher(false);
                        setShowCreateModal(true);
                      }}
                      className={`cursor-pointer ${isLight ? 'text-blue-600 hover:underline font-bold' : 'text-amber-400 hover:underline'}`}
                    >
                      + New
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto py-1">
                    {setlists.map((sl) => (
                      <div
                        key={sl.id}
                        className={`w-full px-3 py-2 text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          activeSetlist?.id === sl.id
                            ? isLight
                              ? 'bg-blue-50 text-blue-900 font-bold border-l-2 border-blue-600'
                              : 'bg-amber-400/10 text-amber-300 font-bold'
                            : isLight
                            ? 'text-slate-700 hover:bg-sky-50'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                        onClick={() => {
                          onSelectSetlist(sl);
                          setShowSetSwitcher(false);
                        }}
                      >
                        <div className="flex flex-col truncate pr-2">
                          <span className="truncate">{sl.title}</span>
                          <span className={`text-[10px] font-mono ${isLight ? 'text-blue-600/70' : 'text-neutral-500'}`}>
                            {sl.songIds.length} songs
                          </span>
                        </div>

                        {/* Delete Setlist Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSetlist(sl.id);
                          }}
                          className={`p-1.5 rounded transition-colors cursor-pointer ${
                            isLight
                              ? 'hover:text-rose-600 hover:bg-rose-50 text-slate-400'
                              : 'hover:text-red-400 hover:bg-neutral-800 text-neutral-400'
                          }`}
                          title="Delete setlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className={`pt-1 border-t px-2 ${isLight ? 'border-blue-100' : 'border-neutral-800'}`}>
                    <button
                      onClick={() => {
                        setShowSetSwitcher(false);
                        setShowCreateModal(true);
                      }}
                      className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                        isLight
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-neutral-800 hover:bg-neutral-750 text-amber-400'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Set</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleOpenAddSongModal}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                isLight
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : isDarkSlate
                  ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-black'
                  : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
              }`}
              title="Add songs to this set"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            {activeSetlist && (
              <>
                <button
                  onClick={() => onStartPerformance(activeSetlist, selectedSongIdx)}
                  disabled={activeSongs.length === 0}
                  className={`p-1.5 rounded-lg disabled:opacity-40 transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                      : isDarkSlate
                      ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-amber-400 border-neutral-700'
                  }`}
                  title="Fullscreen Stage Mode"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (window.confirm?.(`Are you sure you want to delete setlist "${activeSetlist.title}"?`) !== false) {
                      onDeleteSetlist(activeSetlist.id);
                    }
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border-blue-200 shadow-xs'
                      : isDarkSlate
                      ? 'bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-slate-700'
                      : 'bg-neutral-800 hover:bg-red-950/40 text-neutral-400 hover:text-red-400 border-neutral-700'
                  }`}
                  title="Delete this setlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {activeSongs.length === 0 ? (
            <div className={`text-center py-16 px-4 flex flex-col items-center gap-2 ${
              isLight ? 'text-slate-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-500'
            }`}>
              <Music className={`w-10 h-10 mb-1 ${isLight ? 'text-blue-200' : isDarkSlate ? 'text-slate-600' : 'text-neutral-700'}`} />
              <p className="text-xs">No songs in this set yet.</p>
              <button
                onClick={handleOpenAddSongModal}
                className={`mt-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                  isLight
                    ? 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                    : isDarkSlate
                    ? 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
                    : 'bg-neutral-800 hover:bg-neutral-750 text-amber-400 border-neutral-700'
                }`}
              >
                + Add Songs from Library
              </button>
            </div>
          ) : (
            activeSongs.map((song, index) => {
              const isSelected = index === selectedSongIdx;
              return (
                <div
                  key={`${song.id}-${index}`}
                  onClick={() => setSelectedSongIdx(index)}
                  className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? isLight
                        ? 'bg-sky-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                        : isDarkSlate
                        ? 'bg-[#1e293b] border-sky-400 shadow-lg shadow-sky-500/5 ring-1 ring-sky-400/40 text-slate-100'
                        : 'bg-neutral-900 border-amber-400 shadow-md shadow-amber-400/5 ring-1 ring-amber-400/30'
                      : isLight
                      ? 'bg-white border-blue-100 hover:bg-sky-50/40 hover:border-blue-200'
                      : isDarkSlate
                      ? 'bg-[#182338]/60 border-slate-700/70 hover:bg-[#182338] hover:border-slate-600 text-slate-200'
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900/80 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span
                      className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        isSelected
                          ? isLight
                            ? 'bg-blue-600 text-white font-extrabold shadow-xs'
                            : isDarkSlate
                            ? 'bg-sky-400 text-slate-950 font-black'
                            : 'bg-amber-400 text-neutral-950 font-extrabold'
                          : isLight
                          ? 'bg-sky-50 text-blue-800 border border-blue-200'
                          : isDarkSlate
                          ? 'bg-slate-800 text-slate-400 border border-slate-700'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}
                    >
                      {index + 1}
                    </span>

                    <div className="flex flex-col min-w-0 truncate">
                      <span
                        className={`font-semibold text-xs sm:text-sm truncate leading-tight ${
                          isSelected
                            ? isLight
                              ? 'text-blue-950 font-bold'
                              : isDarkSlate
                              ? 'text-sky-300 font-bold'
                              : 'text-amber-300 font-bold'
                            : isLight
                            ? 'text-slate-900'
                            : isDarkSlate
                            ? 'text-slate-200'
                            : 'text-neutral-100'
                        }`}
                      >
                        {song.title}
                      </span>
                      <div className={`flex items-center gap-1.5 text-[11px] mt-0.5 truncate ${
                        isLight ? 'text-slate-500' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'
                      }`}>
                        <span className="truncate">{song.artist || 'Unknown'}</span>
                        {song.tempo && (
                          <>
                            <span>·</span>
                            <span className="font-mono">{song.tempo} BPM</span>
                          </>
                        )}
                        {song.capo > 0 && (
                          <>
                            <span>·</span>
                            <span className={isLight ? 'text-blue-600 font-semibold' : isDarkSlate ? 'text-sky-400' : 'text-amber-400/80'}>
                              Capo {song.capo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {(() => {
                      const songEffectiveKey = activeSetlist?.songKeys?.[song.id] || song.key;
                      const isTransposedInSetlist = Boolean(
                        activeSetlist?.songKeys?.[song.id] && activeSetlist.songKeys[song.id] !== song.key
                      );
                      return (
                        <div className="flex flex-col items-end">
                          <span
                            className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${
                              isTransposedInSetlist
                                ? 'bg-amber-400 text-neutral-950 border-amber-300 font-extrabold shadow-xs'
                                : isLight
                                ? 'bg-sky-50 text-blue-700 border-blue-200'
                                : isDarkSlate
                                ? 'bg-slate-900 text-sky-400 border-slate-700'
                                : 'bg-neutral-900 text-amber-400 border-neutral-750'
                            }`}
                            title={isTransposedInSetlist ? `Setlist Key: ${songEffectiveKey} (Original: ${song.key})` : `Key: ${song.key}`}
                          >
                            {songEffectiveKey}
                          </span>
                          {isTransposedInSetlist && (
                            <span className="text-[9px] font-mono opacity-60 leading-tight">
                              orig {song.key}
                            </span>
                          )}
                        </div>
                      );
                    })()}

                    <div className="flex items-center">
                      <button
                        onClick={(e) => moveSong(index, 'up', e)}
                        disabled={index === 0}
                        className={`p-1 rounded disabled:opacity-20 cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-blue-700 hover:bg-blue-50' : isDarkSlate ? 'text-slate-400 hover:text-white' : 'text-neutral-500 hover:text-white'
                        }`}
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => moveSong(index, 'down', e)}
                        disabled={index === activeSongs.length - 1}
                        className={`p-1 rounded disabled:opacity-20 cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-blue-700 hover:bg-blue-50' : isDarkSlate ? 'text-slate-400 hover:text-white' : 'text-neutral-500 hover:text-white'
                        }`}
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => removeSongFromSetlist(index, e)}
                        className={`p-1 rounded cursor-pointer ${
                          isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : isDarkSlate ? 'text-slate-400 hover:text-red-400' : 'text-neutral-500 hover:text-red-400'
                        }`}
                        title="Remove from set"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Navigation */}
        {activeSongs.length > 0 && (
          <div className={`p-3 border-t flex items-center justify-between gap-2 shrink-0 ${
            isLight
              ? 'bg-sky-50/70 border-blue-100'
              : isDarkSlate
              ? 'bg-[#182338] border-slate-700/80'
              : 'bg-neutral-900/60 border-neutral-800'
          }`}>
            <button
              onClick={() => setSelectedSongIdx(Math.max(0, selectedSongIdx - 1))}
              disabled={selectedSongIdx === 0}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none text-xs font-medium transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200 shadow-xs'
                  : isDarkSlate
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev Song</span>
            </button>

            <span className={`text-[11px] font-mono px-1 ${
              isLight ? 'text-blue-700 font-semibold' : isDarkSlate ? 'text-slate-400' : 'text-neutral-400'
            }`}>
              {selectedSongIdx + 1}/{activeSongs.length}
            </span>

            <button
              onClick={() => setSelectedSongIdx(Math.min(activeSongs.length - 1, selectedSongIdx + 1))}
              disabled={selectedSongIdx === activeSongs.length - 1}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none text-xs font-medium transition-colors cursor-pointer border ${
                isLight
                  ? 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200 shadow-xs'
                  : isDarkSlate
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
            >
              <span>Next Song</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* RIGHT PANE */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${
        isLight ? 'bg-white' : isDarkSlate ? 'bg-[#0b1322]' : 'bg-neutral-950'
      }`}>
        {currentSong ? (
          <SongViewer
            key={`${currentSong.id}-${activeSetlist?.id}`}
            isEmbedded={true}
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
              }
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-500">
            <Music className="w-14 h-14 text-neutral-700 mb-3" />
            <h3 className="text-base font-bold text-neutral-300">
              {activeSongs.length === 0
                ? 'No songs in this setlist'
                : 'Select a song from the left list'}
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              {activeSongs.length === 0
                ? 'Click "+ Add" on the left panel to populate this setlist.'
                : 'Click any song in the left list to view its chords, lyrics, and transpose settings here.'}
            </p>
            {activeSongs.length === 0 && (
              <button
                onClick={handleOpenAddSongModal}
                className="mt-4 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
              >
                + Add Songs Now
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create Setlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="font-bold text-base">Create New Setlist</span>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Setlist Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. 19-10-2026"
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Performance Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Description / Venue</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="e.g. Main Auditorium, 10:00 AM"
                className="w-full px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition-colors cursor-pointer"
              >
                Create Setlist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Add Songs to Setlist (Multi-select) */}
      {showAddSongModal && activeSetlist && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-2xl text-neutral-100 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
              <span className="font-bold text-base">Add Songs to {activeSetlist.title}</span>
              <button
                onClick={() => setShowAddSongModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ช่องค้นหา */}
            <div className="py-3 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อเพลง, ศิลปิน หรือ คีย์..."
                className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-100 text-sm focus:outline-none focus:border-amber-400 placeholder:text-neutral-500"
                autoFocus
              />
            </div>

            {/* รายการเพลงพร้อม Checkbox */}
            <div className="flex-1 overflow-y-auto py-1 space-y-2 pr-1">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs">
                  ไม่พบเพลงที่ตรงกับการค้นหา
                </div>
              ) : (
                filteredSongs.map((song) => {
                  const isChecked = selectedSongIdsForAdd.includes(song.id);
                  const isAlreadyInSet = activeSetlist.songIds.includes(song.id);

                  return (
                    <div
                      key={song.id}
                      onClick={() => toggleSongSelection(song.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer select-none ${
                        isChecked
                          ? 'bg-amber-400/10 border-amber-400/60'
                          : 'bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // ทำงานผ่าน onClick ของ div แม่
                          className="w-4 h-4 accent-amber-400 rounded cursor-pointer shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-neutral-100 truncate">
                            {song.title}
                          </h4>
                          <p className="text-xs text-neutral-400 truncate">
                            {song.artist || 'Unknown'} · Key: {song.key}
                            {isAlreadyInSet && (
                              <span className="ml-2 text-[10px] text-amber-400/80 font-mono">
                                (อยู่ในเซ็ตแล้ว)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer ปุ่มยืนยันเพิ่มเพลงที่เลือก */}
            <div className="pt-3 border-t border-neutral-800 shrink-0 flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                เลือกแล้ว <strong className="text-amber-400">{selectedSongIdsForAdd.length}</strong> รายการ
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSongModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-neutral-200 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleAddSelectedSongs}
                  disabled={selectedSongIdsForAdd.length === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none text-neutral-950 transition-colors cursor-pointer"
                >
                  + เพิ่มเพลงที่เลือก ({selectedSongIdsForAdd.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};