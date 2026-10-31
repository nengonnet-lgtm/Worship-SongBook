import React, { useState, useEffect } from 'react';
import { Song, Setlist, AppSettings } from './types/song';
import { SAMPLE_SONGS, INITIAL_SETLISTS } from './data/sampleSongs';
import { SidebarDrawer } from './components/SidebarDrawer';
import { NavRail } from './components/NavRail';
import { SongList } from './components/SongList';
import { SongViewer } from './components/SongViewer';
import { SongEditorModal } from './components/SongEditorModal';
import { SetlistManager } from './components/SetlistManager';
import { ChordLibraryModal } from './components/ChordLibraryModal';
import { SettingsModal } from './components/SettingsModal';
import { MetronomeBar } from './components/MetronomeBar';
import { ConfirmDialog } from './components/ConfirmDialog';
import { OfflineIndicator } from './components/OfflineIndicator';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { X } from 'lucide-react';
import { getThemeStyles, SIGNAL_ON_DARK } from './utils/themeStyles';

const STORAGE_KEYS = {
  SONGS: 'songbook_pro_songs',
  SETLISTS: 'songbook_pro_setlists',
  SETTINGS: 'songbook_pro_settings'
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'stage-black',
  fontSize: 16,
  columns: 1,
  chordsColor: SIGNAL_ON_DARK, // bright yellow-orange signal (#F59E0B)
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
      if (saved) {
        const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
        // Migrate old vermilion red-orange values to bright yellow-orange / warm amber
        if (parsed.chordsColor === '#FF5B3A' || parsed.chordsColor === '#C42E14' || parsed.chordsColor === '#E8421F') {
          parsed.chordsColor = parsed.theme === 'light' ? '#D97706' : '#F59E0B';
        }
        return parsed;
      }
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [sampleUpdate, setSampleUpdate] = useState<{ changed: number; added: number } | null>(null);
  const [updateNotice, setUpdateNotice] = useState<string | null>(null);

  // Global shortcuts when in Library or Setlist view (no song viewer open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Help modal shortcut (?) works in all screens
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowShortcutsModal((v) => !v);
        return;
      }

      // Close shortcuts modal on Escape
      if (showShortcutsModal) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setShowShortcutsModal(false);
        }
        return;
      }

      // If an overlay modal is active, do not trigger other shortcuts
      if (editingSong || showChordLibrary || showSettingsModal || sampleUpdate || isSidebarOpen) {
        return;
      }

      // Only handle these when song viewer is closed
      if (selectedSong) return;

      // Tab switching: 1 = Songs, 2 = Setlists
      if (e.key === '1') {
        e.preventDefault();
        setActiveTab('library');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        setActiveTab('setlists');
        return;
      }

      // New song: n or N
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingSong('new');
        return;
      }

      // Metronome toggle: m or M
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setShowFloatingMetronome((v) => !v);
        return;
      }

      // Chord dictionary: k or K
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setShowChordLibrary((v) => !v);
        return;
      }

      // Cycle theme: t or T
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const themes: ('stage-black' | 'dark' | 'light')[] = ['stage-black', 'dark', 'light'];
        const curIdx = themes.indexOf(settings.theme as any);
        const nextTheme = themes[(curIdx + 1) % themes.length];
        setSettings((prev) => ({ ...prev, theme: nextTheme }));
        setUpdateNotice(`ธีม: ${nextTheme === 'stage-black' ? 'Ink (เวที)' : nextTheme === 'dark' ? 'Midnight' : 'Paper'}`);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedSong,
    showShortcutsModal,
    editingSong,
    showChordLibrary,
    showSettingsModal,
    sampleUpdate,
    isSidebarOpen,
    settings.theme
  ]);

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

  // Toast auto-hide
  useEffect(() => {
    if (!updateNotice) return;
    const id = setTimeout(() => setUpdateNotice(null), 4000);
    return () => clearTimeout(id);
  }, [updateNotice]);

  // ---- Update library from the bundled sampleSongs ----
  // Songs with the same id are replaced by the sampleSongs version, songs only in sampleSongs are added,
  // songs the user created themselves (ids not in sampleSongs) are kept. Setlists are not touched.
  const requestSampleUpdate = () => {
    const byId = new Map(songs.map((s) => [s.id, s]));
    let changed = 0;
    let added = 0;
    SAMPLE_SONGS.forEach((sample) => {
      const current = byId.get(sample.id);
      if (!current) added++;
      else if (JSON.stringify(current) !== JSON.stringify(sample)) changed++;
    });
    if (changed + added === 0) {
      setUpdateNotice('เพลงในเครื่องตรงกับ sampleSongs อยู่แล้ว');
      return;
    }
    setSampleUpdate({ changed, added });
  };

  const applySampleUpdate = () => {
    const sampleById = new Map(SAMPLE_SONGS.map((s) => [s.id, s]));
    const existingIds = new Set(songs.map((s) => s.id));
    const merged: Song[] = [
      ...songs.map((s) => sampleById.get(s.id) ?? s),
      ...SAMPLE_SONGS.filter((s) => !existingIds.has(s.id))
    ];
    setSongs(merged);
    try {
      localStorage.setItem(STORAGE_KEYS.SONGS, JSON.stringify(merged));
    } catch (e) {
      console.warn('Failed to save songs to localStorage', e);
    }
    setSelectedSong((prev) => (prev ? merged.find((s) => s.id === prev.id) ?? prev : prev));
    const { changed, added } = sampleUpdate ?? { changed: 0, added: 0 };
    setSampleUpdate(null);
    setUpdateNotice(`อัปเดตแล้ว: แทนที่ ${changed} เพลง, เพิ่มใหม่ ${added} เพลง`);
  };

  // Stage mode: jump straight to any song of the running setlist (index = position in setlist.songIds)
  const handleJumpSetlistSong = (idx: number) => {
    if (!activeSetlistContext) return;
    const latest =
      setlists.find((sl) => sl.id === activeSetlistContext.setlist.id) || activeSetlistContext.setlist;
    const target = songs.find((s) => s.id === latest.songIds[idx]);
    if (!target) return;
    setActiveSetlistContext({ setlist: latest, currentIdx: idx });
    setSelectedSong(target);
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

  const handleExportLibrary = (format: 'json-songs' | 'ts' | 'json-full' = 'json-songs') => {
    const today = new Date().toISOString().split('T')[0];

    if (format === 'ts') {
      // ส่งออกเป็นไฟล์ sampleSongs.ts ที่เป็นโค้ด TypeScript ถูกต้องตามหลักไวยากรณ์ 100%
      const tsContent = `import { Song, Setlist } from '../types/song';\n\nexport const SAMPLE_SONGS: Song[] = ${JSON.stringify(
        songs,
        null,
        2
      )};\n\nexport const INITIAL_SETLISTS: Setlist[] = ${JSON.stringify(
        setlists,
        null,
        2
      )};\n`;

      const blob = new Blob([tsContent], { type: 'text/typescript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'sampleSongs.ts';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    if (format === 'json-full') {
      // ส่งออกทั้งเพลงและ Setlist ทั้งหมดเพื่อ Backup กู้คืนได้สมบูรณ์
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        songs,
        setlists
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `songbook_full_backup_${today}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    // Default: 'json-songs' - ส่งออกเป็น Array Song[] เพียวๆ เหมือนใน sampleSongs.ts
    const blob = new Blob([JSON.stringify(songs, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `worship_songs_${today}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const activeSetlist = setlists.find((sl) => sl.id === activeSetlistId) || null;

  // Song list for the stage-mode picker (songs deleted from the library are skipped)
  const pickerSetlist = activeSetlistContext
    ? setlists.find((sl) => sl.id === activeSetlistContext.setlist.id) || activeSetlistContext.setlist
    : null;
  const setlistPickerSongs = pickerSetlist
    ? pickerSetlist.songIds.flatMap((id, slot) => {
        const s = songs.find((x) => x.id === id);
        return s
          ? [{ index: slot, id: s.id, title: s.title, key: pickerSetlist.songKeys?.[s.id] || s.key }]
          : [];
      })
    : undefined;

  const appTheme = getThemeStyles(settings.theme);
  const appBg = appTheme.page;

  return (
    <div className={`flex flex-col h-dvh w-full overflow-hidden select-none ${appBg}`}>
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
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenShortcuts={() => setShowShortcutsModal(true)}
        onUpdateSongs={requestSampleUpdate}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <div className="flex-1 flex min-h-0 overflow-hidden">
      {!selectedSong && (
        <NavRail
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenChords={() => setShowChordLibrary(true)}
          onOpenMetronome={() => setShowFloatingMetronome(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onOpenShortcuts={() => setShowShortcutsModal(true)}
          onUpdateSongs={requestSampleUpdate}
          isMetronomeOpen={showFloatingMetronome}
          theme={settings.theme}
        />
      )}
      <main className="flex-1 flex overflow-hidden min-w-0">
        {selectedSong ? (
          <SongViewer
            key={activeSetlistContext?.setlist?.id || 'standalone'}
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
            onNextSong={activeSetlistContext ? handleNextSetlistSong : undefined}
            onPrevSong={activeSetlistContext ? handlePrevSetlistSong : undefined}
            setlistContext={
              activeSetlistContext
                ? {
                    currentIdx: activeSetlistContext.currentIdx,
                    totalSongs: activeSetlistContext.setlist.songIds.length,
                    setlistTitle: activeSetlistContext.setlist.title,
                    setlistId: activeSetlistContext.setlist.id,
                    targetKey: activeSetlistContext.setlist.songKeys?.[selectedSong.id],
                    songs: setlistPickerSongs,
                    onSelectSong: handleJumpSetlistSong,
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
            onOpenSettings={() => setShowSettingsModal(true)}
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
      </div>

      {showFloatingMetronome && (
        <div className="fixed top-16 right-3 sm:right-6 z-50 w-64 sm:w-72 max-w-[calc(100vw-1.5rem)] shadow-2xl">
          <div className="relative">
            <button
              onClick={() => setShowFloatingMetronome(false)}
              className={`absolute top-2 right-2 p-1 rounded-full z-10 cursor-pointer ${appTheme.iconBtn}`}
              title="Close Metronome"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <MetronomeBar theme={settings.theme} />
          </div>
        </div>
      )}

      {showChordLibrary && (
        <ChordLibraryModal onClose={() => setShowChordLibrary(false)} theme={settings.theme} />
      )}

      {editingSong && (
        <SongEditorModal
          song={editingSong === 'new' ? null : editingSong}
          settings={settings}
          onSave={handleSaveSong}
          onClose={() => setEditingSong(null)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          settings={settings}
          onUpdateSettings={updateSettings}
        />
      )}

      {showShortcutsModal && (
        <KeyboardShortcutsModal
          isOpen={showShortcutsModal}
          onClose={() => setShowShortcutsModal(false)}
          theme={settings.theme}
        />
      )}

      {sampleUpdate && (
        <ConfirmDialog
          tone="danger"
          theme={settings.theme}
          title="อัปเดตเพลงจาก sampleSongs ?"
          message={`แทนที่ ${sampleUpdate.changed} เพลง และเพิ่มใหม่ ${sampleUpdate.added} เพลง การแก้ไขที่ทำไว้ในเพลงที่ถูกแทนที่จะหายไป ส่วนเพลงที่คุณเพิ่มเองและเซ็ตลิสต์จะไม่ถูกแตะต้อง`}
          confirmLabel="อัปเดตเพลง"
          onCancel={() => setSampleUpdate(null)}
          onConfirm={applySampleUpdate}
        />
      )}

      {updateNotice && (
        <div
          role="status"
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] max-w-[calc(100vw-2rem)] px-4 py-2.5 rounded-xl border shadow-2xl text-sm font-semibold ${appTheme.popover}`}
        >
          {updateNotice}
        </div>
      )}

      <OfflineIndicator />
    </div>
  );
}