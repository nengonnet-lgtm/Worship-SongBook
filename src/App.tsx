import React, { useState, useEffect } from 'react';
import { Song, Setlist, AppSettings } from './types/song';
import { SAMPLE_SONGS, INITIAL_SETLISTS } from './data/sampleSongs';
import { SidebarDrawer } from './components/SidebarDrawer';
import { SongList } from './components/SongList';
import { SongViewer } from './components/SongViewer';
import { SongEditorModal } from './components/SongEditorModal';
import { SetlistManager } from './components/SetlistManager';
import { ChordLibraryModal } from './components/ChordLibraryModal';
import { MetronomeBar } from './components/MetronomeBar';
import { X } from 'lucide-react';

const STORAGE_KEYS = {
  SONGS: 'songbook_pro_songs',
  SETLISTS: 'songbook_pro_setlists',
  SETTINGS: 'songbook_pro_settings'
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'stage-black',
  fontSize: 16,
  columns: 1,
  chordsColor: '#38bdf8', // Sky 400
  instrument: 'guitar',
  showChords: true,
  chordNotation: 'standard',
  autoScrollSpeed: 3,
  autoScrollCountdown: 2,
  showChordDiagrams: true
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Songs state
  const [songs, setSongs] = useState<Song[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SONGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasOldSampleOnly =
          Array.isArray(parsed) &&
          parsed.length <= 2 &&
          parsed.some((s: Song) => s.id === 'song-1' || s.id === 'song-2') &&
          !parsed.some((s: Song) => s.id === 'song-1792403012459');

        if (!hasOldSampleOnly && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load songs from localStorage', e);
    }
    return SAMPLE_SONGS;
  });

  // Setlists state
  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETLISTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load setlists from localStorage', e);
    }
    return INITIAL_SETLISTS;
  });

  // Settings state
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Failed to load settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'library' | 'setlists'>('library');
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  const [activeSetlistContext, setActiveSetlistContext] = useState<{
    setlist: Setlist;
    currentIdx: number;
  } | null>(null);

  const [activeSetlistId, setActiveSetlistId] = useState<string | null>(
    INITIAL_SETLISTS[0]?.id || null
  );

  const [editingSong, setEditingSong] = useState<Song | null | 'new'>(null);
  const [showChordLibrary, setShowChordLibrary] = useState(false);
  const [showFloatingMetronome, setShowFloatingMetronome] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(songs));
    } catch (e) {
      console.warn(e);
    }
  }, [songs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETLISTS, JSON.stringify(setlists));
    } catch (e) {
      console.warn(e);
    }
  }, [setlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn(e);
    }
  }, [settings]);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  // Song handlers
  const handleSaveSong = (songToSave: Song) => {
    setSongs((prev) => {
      const exists = prev.some((s) => s.id === songToSave.id);
      if (exists) {
        return prev.map((s) => (s.id === songToSave.id ? songToSave : s));
      }
      return [songToSave, ...prev];
    });

    if (selectedSong && selectedSong.id === songToSave.id) {
      setSelectedSong(songToSave);
    }

    setEditingSong(null);
  };

  const handleDeleteSong = (id: string) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
    setSetlists((prev) =>
      prev.map((sl) => ({
        ...sl,
        songIds: sl.songIds.filter((sid) => sid !== id)
      }))
    );
    if (selectedSong?.id === id) {
      setSelectedSong(null);
      setActiveSetlistContext(null);
    }
  };

  // Setlist handlers
  const handleCreateSetlist = (title: string, date: string, description: string) => {
    const newSetlist: Setlist = {
      id: `setlist-${Date.now()}`,
      title,
      date,
      description,
      songIds: [],
      createdAt: Date.now()
    };
    setSetlists((prev) => [newSetlist, ...prev]);
    setActiveSetlistId(newSetlist.id);
  };

  const handleUpdateSetlist = (updated: Setlist) => {
    setSetlists((prev) => prev.map((sl) => (sl.id === updated.id ? updated : sl)));
  };

  // Direct Delete Handler for Setlist
  const handleDeleteSetlist = (id: string) => {
    const remainingSets = setlists.filter((sl) => sl.id !== id);
    setSetlists(remainingSets);

    if (activeSetlistId === id) {
      setActiveSetlistId(remainingSets.length > 0 ? remainingSets[0].id : null);
    }
  };

  const handleAddSongToSetlist = (setlistId: string, songId: string) => {
    setSetlists((prev) =>
      prev.map((sl) => {
        if (sl.id === setlistId) {
          return {
            ...sl,
            songIds: [...sl.songIds, songId]
          };
        }
        return sl;
      })
    );
  };

  const handleStartPerformance = (setlist: Setlist, startIdx: number = 0) => {
    if (setlist.songIds.length === 0) return;
    const initialSongId = setlist.songIds[startIdx];
    const initialSong = songs.find((s) => s.id === initialSongId);
    if (initialSong) {
      setActiveSetlistContext({
        setlist,
        currentIdx: startIdx
      });
      setSelectedSong(initialSong);
    }
  };

  const handleNextSetlistSong = () => {
    if (!activeSetlistContext) return;
    const latestSetlist =
      setlists.find((sl) => sl.id === activeSetlistContext.setlist.id) ||
      activeSetlistContext.setlist;
    const nextIdx = activeSetlistContext.currentIdx + 1;
    if (nextIdx < latestSetlist.songIds.length) {
      const nextSongId = latestSetlist.songIds[nextIdx];
      const nextSong = songs.find((s) => s.id === nextSongId);
      if (nextSong) {
        setActiveSetlistContext({
          setlist: latestSetlist,
          currentIdx: nextIdx
        });
        setSelectedSong(nextSong);
      }
    }
  };

  const handlePrevSetlistSong = () => {
    if (!activeSetlistContext) return;
    const latestSetlist =
      setlists.find((sl) => sl.id === activeSetlistContext.setlist.id) ||
      activeSetlistContext.setlist;
    const prevIdx = activeSetlistContext.currentIdx - 1;
    if (prevIdx >= 0) {
      const prevSongId = latestSetlist.songIds[prevIdx];
      const prevSong = songs.find((s) => s.id === prevSongId);
      if (prevSong) {
        setActiveSetlistContext({
          setlist: latestSetlist,
          currentIdx: prevIdx
        });
        setSelectedSong(prevSong);
      }
    }
  };

  const handleImportSong = async (file: File) => {
    try {
      const rawContent = await file.text();
      const content = rawContent.trim();

      // Helper to sanitize and normalize song object
      const normalizeSong = (raw: any, fallbackTitle: string): Song => {
        const id = raw.id || `song-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        return {
          id,
          title: (raw.title && String(raw.title).trim()) || fallbackTitle,
          artist: (raw.artist && String(raw.artist).trim()) || '',
          key: (raw.key && String(raw.key).trim()) || 'C',
          originalKey: (raw.originalKey && String(raw.originalKey).trim()) || raw.key || 'C',
          tempo: Number(raw.tempo) || 120,
          timeSignature: raw.timeSignature || '4/4',
          capo: Number(raw.capo) || 0,
          duration: Number(raw.duration) || 180,
          tags: Array.isArray(raw.tags) ? raw.tags : ['Imported'],
          notes: raw.notes || '',
          chordProContent: raw.chordProContent || raw.content || '',
          lastModified: raw.lastModified || Date.now()
        };
      };

      // 1. ตรวจสอบว่าเป็น JSON หรือไม่ (ทั้งไฟล์ .json หรือไฟล์ข้อความที่มี JSON)
      let parsedJson: any = null;
      if (
        content.startsWith('{') ||
        content.startsWith('[') ||
        file.name.endsWith('.json') ||
        file.type === 'application/json'
      ) {
        try {
          parsedJson = JSON.parse(content);
        } catch {
          parsedJson = null;
        }
      }

      if (parsedJson) {
        // กรณี A: ข้อมูลสำรองของระบบ { songs: [...], setlists: [...] }
        if (parsedJson.songs && Array.isArray(parsedJson.songs)) {
          const importedSongs: Song[] = parsedJson.songs.map((s: any, idx: number) =>
            normalizeSong(s, `Imported Song ${idx + 1}`)
          );

          setSongs((prev) => {
            const map = new Map(prev.map((s) => [s.id, s]));
            importedSongs.forEach((song) => map.set(song.id, song));
            return Array.from(map.values());
          });

          if (importedSongs.length > 0) {
            setSelectedSong(importedSongs[0]);
          }

          if (parsedJson.setlists && Array.isArray(parsedJson.setlists)) {
            setSetlists((prev) => {
              const map = new Map(prev.map((sl) => [sl.id, sl]));
              parsedJson.setlists.forEach((sl: Setlist) => map.set(sl.id, sl));
              return Array.from(map.values());
            });
          }
          return;
        }

        // กรณี B: เป็น Array ของเพลง [ {...}, {...} ]
        if (Array.isArray(parsedJson)) {
          const importedSongs: Song[] = parsedJson
            .filter((item) => item && typeof item === 'object')
            .map((s: any, idx: number) => normalizeSong(s, `Imported Song ${idx + 1}`));

          if (importedSongs.length > 0) {
            setSongs((prev) => {
              const map = new Map(prev.map((s) => [s.id, s]));
              importedSongs.forEach((song) => map.set(song.id, song));
              return Array.from(map.values());
            });
            setSelectedSong(importedSongs[0]);
            return;
          }
        }

        // กรณี C: เป็น Object เพลงเดี่ยว { title: "...", chordProContent: "..." }
        if (parsedJson.title || parsedJson.chordProContent || parsedJson.content) {
          const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          const singleSong = normalizeSong(parsedJson, cleanName || 'Imported Song');
          setSongs((prev) => [singleSong, ...prev.filter((s) => s.id !== singleSong.id)]);
          setSelectedSong(singleSong);
          return;
        }
      }

      // 2. หากเป็นไฟล์เพลง ChordPro หรือ Text
      const cleanFilename = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').trim();

      // ค้นหาจาก ChordPro directive เช่น {title: ...} หรือ {t: ...}
      const titleMatch = content.match(/\{(?:title|t):\s*([^}]+)\}/i);
      const artistMatch = content.match(/\{(?:artist|a|subtitle|st):\s*([^}]+)\}/i);
      const keyMatch = content.match(/\{(?:key|k):\s*([^}]+)\}/i);
      const tempoMatch = content.match(/\{(?:tempo|bpm):\s*([^}]+)\}/i);
      const timeMatch = content.match(/\{(?:time|timeSignature):\s*([^}]+)\}/i);

      // ค้นหาจากข้อความธรรมดา เช่น "Title: ...", "ชื่อเพลง: ...", "เพลง: ..."
      const textTitleMatch = content.match(/^(?:title|ชื่อเพลง|เพลง)\s*[:=]\s*(.+)$/im);
      const textArtistMatch = content.match(/^(?:artist|ศิลปิน|นักร้อง)\s*[:=]\s*(.+)$/im);
      const textKeyMatch = content.match(/^(?:key|คีย์)\s*[:=]\s*([A-Ga-g][#b]?(?:m|maj|min)?)/im);
      const textTempoMatch = content.match(/^(?:tempo|bpm|ความเร็ว)\s*[:=]\s*(\d+)/im);

      let detectedTitle = '';
      if (titleMatch && titleMatch[1].trim()) {
        detectedTitle = titleMatch[1].trim();
      } else if (textTitleMatch && textTitleMatch[1].trim()) {
        detectedTitle = textTitleMatch[1].trim();
      } else {
        // ตรวจสอบบรรทัดแรกๆ ที่เป็นข้อความปกติ
        const lines = content.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          if (
            trimmed &&
            !trimmed.startsWith('{') &&
            !trimmed.startsWith('[') &&
            !/^(Intro|Outro|Solo|Verse|Chorus|Bridge|Hook)\b/i.test(trimmed) &&
            !trimmed.includes('[') &&
            trimmed.length < 80
          ) {
            detectedTitle = trimmed;
            break;
          }
        }
      }

      if (!detectedTitle) {
        detectedTitle = cleanFilename || 'Untitled Song';
      }

      const detectedArtist =
        (artistMatch && artistMatch[1].trim()) ||
        (textArtistMatch && textArtistMatch[1].trim()) ||
        '';

      const detectedKey =
        (keyMatch && keyMatch[1].trim()) ||
        (textKeyMatch && textKeyMatch[1].trim()) ||
        'C';

      const detectedTempo =
        (tempoMatch && parseInt(tempoMatch[1], 10)) ||
        (textTempoMatch && parseInt(textTempoMatch[1], 10)) ||
        120;

      const detectedTimeSig = (timeMatch && timeMatch[1].trim()) || '4/4';

      const newSong: Song = {
        id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: detectedTitle,
        artist: detectedArtist,
        key: detectedKey,
        originalKey: detectedKey,
        tempo: detectedTempo,
        timeSignature: detectedTimeSig,
        capo: 0,
        duration: 180,
        tags: ['Imported'],
        chordProContent: content,
        lastModified: Date.now()
      };

      setSongs((prev) => [newSong, ...prev]);
      setSelectedSong(newSong);
    } catch (err) {
      console.error('Failed to import file', err);
    }
  };

  const handleExportLibrary = () => {
    // ส่งออกเป็นรูปแบบ Array Song[] เพียวๆ เหมือนใน sampleSongs.ts โดยไม่แทรกแท็ก {title: ...} ใน chordProContent
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(songs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `songbook_pro_songs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeSetlist = setlists.find((sl) => sl.id === activeSetlistId) || null;

  const appBg =
    settings.theme === 'stage-black'
      ? 'bg-black text-neutral-100'
      : settings.theme === 'light'
      ? 'bg-white text-slate-900'
      : 'bg-[#0b1322] text-slate-100';

  return (
    <div className={`flex flex-col h-screen w-screen overflow-hidden select-none ${appBg}`}>
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab !== 'tags') {
            setActiveTab(tab);
          }
        }}
        songCount={songs.length}
        setlistCount={setlists.length}
        onOpenChords={() => setShowChordLibrary(true)}
        onOpenMetronome={() => setShowFloatingMetronome(true)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <main className="flex-1 flex overflow-hidden">
        {selectedSong ? (
          <SongViewer
            key={`${selectedSong.id}-${activeSetlistContext?.setlist?.id || 'standalone'}`}
            song={selectedSong}
            settings={settings}
            onUpdateSettings={updateSettings}
            onEditSong={(song) => setEditingSong(song)}
            onClose={() => {
              setSelectedSong(null);
              setActiveSetlistContext(null);
            }}
            initialKey={
              activeSetlistContext
                ? activeSetlistContext.setlist.songKeys?.[selectedSong.id]
                : undefined
            }
            onKeyChange={(newKey) => {
              if (activeSetlistContext) {
                const currentSl = activeSetlistContext.setlist;
                const updatedSetlist: Setlist = {
                  ...currentSl,
                  songKeys: {
                    ...(currentSl.songKeys || {}),
                    [selectedSong.id]: newKey
                  }
                };
                handleUpdateSetlist(updatedSetlist);
                setActiveSetlistContext({
                  ...activeSetlistContext,
                  setlist: updatedSetlist
                });
              }
            }}
            onNextSong={handleNextSetlistSong}
            onPrevSong={handlePrevSetlistSong}
            setlistContext={
              activeSetlistContext
                ? {
                    currentIdx: activeSetlistContext.currentIdx,
                    totalSongs: activeSetlistContext.setlist.songIds.length,
                    setlistTitle: activeSetlistContext.setlist.title,
                    setlistId: activeSetlistContext.setlist.id,
                    targetKey: activeSetlistContext.setlist.songKeys?.[selectedSong.id],
                    onKeyChange: (songId, newKey) => {
                      if (activeSetlistContext) {
                        const currentSl = activeSetlistContext.setlist;
                        const updatedSetlist: Setlist = {
                          ...currentSl,
                          songKeys: {
                            ...(currentSl.songKeys || {}),
                            [songId]: newKey
                          }
                        };
                        handleUpdateSetlist(updatedSetlist);
                        setActiveSetlistContext({
                          ...activeSetlistContext,
                          setlist: updatedSetlist
                        });
                      }
                    }
                  }
                : undefined
            }
          />
        ) : activeTab === 'library' ? (
          <SongList
            songs={songs}
            setlists={setlists}
            settings={settings}
            onOpenMenu={() => setIsSidebarOpen(true)}
            onSelectSong={(song) => {
              setSelectedSong(song);
              setActiveSetlistContext(null);
            }}
            onEditSong={(song) => setEditingSong(song)}
            onDeleteSong={handleDeleteSong}
            onCreateSong={() => setEditingSong('new')}
            onImportSong={handleImportSong}
            onExportLibrary={handleExportLibrary}
            onAddSongToSetlist={handleAddSongToSetlist}
          />
        ) : (
          <SetlistManager
            setlists={setlists}
            songs={songs}
            activeSetlist={activeSetlist}
            onOpenMenu={() => setIsSidebarOpen(true)}
            onSelectSetlist={(sl) => setActiveSetlistId(sl?.id || null)}
            onCreateSetlist={handleCreateSetlist}
            onUpdateSetlist={handleUpdateSetlist}
            onDeleteSetlist={handleDeleteSetlist}
            onStartPerformance={handleStartPerformance}
            onOpenSong={(song) => {
              if (activeSetlist) {
                const songIdx = activeSetlist.songIds.indexOf(song.id);
                setActiveSetlistContext({
                  setlist: activeSetlist,
                  currentIdx: songIdx >= 0 ? songIdx : 0
                });
              } else {
                setActiveSetlistContext(null);
              }
              setSelectedSong(song);
            }}
            settings={settings}
            onUpdateSettings={updateSettings}
            onEditSong={(song) => setEditingSong(song)}
          />
        )}
      </main>

      {showFloatingMetronome && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] shadow-2xl">
          <div className="relative">
            <button
              onClick={() => setShowFloatingMetronome(false)}
              className="absolute top-2 right-2 p-1 rounded-full text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 z-10 cursor-pointer"
              title="Close Metronome"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <MetronomeBar />
          </div>
        </div>
      )}

      {showChordLibrary && (
        <ChordLibraryModal onClose={() => setShowChordLibrary(false)} />
      )}

      {editingSong && (
        <SongEditorModal
          song={editingSong === 'new' ? null : editingSong}
          settings={settings}
          onSave={handleSaveSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </div>
  );
}