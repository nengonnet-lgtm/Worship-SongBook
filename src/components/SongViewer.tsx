import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, useId } from 'react';
import { Song, AppSettings } from '../types/song';
import { parseChordPro } from '../utils/chordProParser';
import { transposeKey, getSemitonesBetweenKeys } from '../utils/chordUtils';
import { formatChordPro } from '../utils/chordProFormatter';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
import { QuickActionsSheet } from './QuickActionsSheet';
import { ChordLine } from './ChordLine';
import { getThemeStyles } from '../utils/themeStyles';
import type { ThemeStyles } from '../utils/themeStyles';
import { useDialogBehavior } from '../utils/useDialog';
import { QuickTransposeButton, normalizeSemitones } from './QuickTransposeButton';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Sliders,
  Music,
  Download,
  FileText,
  FileCode,
  ChevronDown,
  ListMusic,
  Menu
} from 'lucide-react';

/** One row of the "pick a song from the setlist" sheet. `index` is whatever the host's onSelectSong expects. */
export interface SetlistPickerItem {
  index: number;
  id: string;
  title: string;
  key?: string;
}

interface Props {
  song: Song;
  settings: AppSettings;
  onUpdateSettings?: (settings: Partial<AppSettings>) => void;
  onEditSong?: (song: Song) => void;
  onClose?: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  setlistContext?: {
    currentIdx: number;
    totalSongs: number;
    setlistTitle: string;
    setlistId?: string;
    targetKey?: string;
    onKeyChange?: (songId: string, newKey: string, semitones: number) => void;
    /** Songs of the set, in order. With onSelectSong this enables the song picker in the header. */
    songs?: SetlistPickerItem[];
    onSelectSong?: (index: number) => void;
  };
  initialKey?: string;
  onKeyChange?: (newKey: string, semitones: number) => void;
  isEmbedded?: boolean;
  /** Embedded in the setlist screen on tablets: opens the slide-out setlist (button in the header + swipe from the left edge) */
  onOpenSetlistMenu?: () => void;
}

export const SongViewer: React.FC<Props> = ({
  song,
  settings,
  onUpdateSettings,
  onClose,
  onEditSong,
  onNextSong,
  onPrevSong,
  setlistContext,
  initialKey,
  onKeyChange,
  isEmbedded = false,
  onOpenSetlistMenu
}) => {
  const effectiveTargetKey = initialKey || setlistContext?.targetKey;

  const computeInitialSemitones = () => {
    if (effectiveTargetKey && song.key) {
      return getSemitonesBetweenKeys(song.key, effectiveTargetKey);
    }
    return 0;
  };

  const [transposeSemitones, setTransposeSemitones] = useState<number>(computeInitialSemitones);
  const [activeChordDiagram, setActiveChordDiagram] = useState<string | null>(null);

  const [isScrolling, setIsScrolling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollAnimRef = useRef<number | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerContainerRef = useRef<HTMLDivElement>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swipeStartRef = useRef<{ x: number; y: number; t: number; edge: boolean } | null>(null);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [pdfHint, setPdfHint] = useState<string | null>(null);
  const [capo, setCapo] = useState<number>(song.capo || 0);

  useLayoutEffect(() => {
    setTransposeSemitones(computeInitialSemitones());
    setCapo(song.capo || 0);
    setIsScrolling(false);
    setCountdown(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [song.id, effectiveTargetKey, song.key, song.capo]);

  // The viewer stays mounted across songs (so browser fullscreen survives a song change):
  // close popups and cancel a pending auto-scroll countdown when the song changes or the viewer goes away.
  useLayoutEffect(() => {
    setActiveChordDiagram(null);
    setShowQuickSettings(false);
    setShowSongPicker(false);
    setShowExportMenu(false);
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, [song.id]);

  useEffect(
    () => () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    },
    []
  );

  const handleUpdateTranspose = (requestedSemitones: number) => {
    // Same notes at n and n ± 12, so keep the offset in -5..+6 (stepping past +6 wraps to -5)
    const newSemitones = normalizeSemitones(requestedSemitones);
    setTransposeSemitones(newSemitones);
    const baseKey = song.key || 'C';
    const newKey = transposeKey(baseKey, newSemitones);
    if (onKeyChange) {
      onKeyChange(newKey, newSemitones);
    }
    if (setlistContext?.onKeyChange) {
      setlistContext.onKeyChange(song.id, newKey, newSemitones);
    }
  };

  const currentKey = useMemo(() => {
    const baseKey = song.key || 'C';
    if (transposeSemitones === 0) {
      return transposeKey(baseKey, 0);
    }
    return transposeKey(baseKey, transposeSemitones);
  }, [song.key, transposeSemitones]);

  const parsed = useMemo(() => {
    return parseChordPro(
      song.chordProContent,
      transposeSemitones,
      currentKey,
      settings.chordNotation,
      song.key
    );
  }, [song.chordProContent, transposeSemitones, currentKey, settings.chordNotation, song.key]);

  useEffect(() => {
    if (!isScrolling) {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
      return;
    }

    let lastTimestamp: number | null = null;
    const speed = settings.autoScrollSpeed || 3;
    const pixelsPerSecond = 15 + speed * 15;

    const step = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const elapsed = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (scrollContainerRef.current) {
        const el = scrollContainerRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;

        if (maxScroll > 0) {
          if (el.scrollTop >= maxScroll - 2) {
            setIsScrolling(false);
            return;
          }
          el.scrollBy({ top: pixelsPerSecond * elapsed, behavior: 'instant' });
        }
      }

      scrollAnimRef.current = requestAnimationFrame(step);
    };

    scrollAnimRef.current = requestAnimationFrame(step);

    return () => {
      if (scrollAnimRef.current) {
        cancelAnimationFrame(scrollAnimRef.current);
        scrollAnimRef.current = null;
      }
    };
  }, [isScrolling, settings.autoScrollSpeed]);

  const handleToggleAutoScroll = () => {
    if (isScrolling || countdown !== null) {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setIsScrolling(false);
      setCountdown(null);
      return;
    }

    const waitSeconds = settings.autoScrollCountdown || 0;
    if (waitSeconds > 0) {
      setCountdown(waitSeconds);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            if (countdownTimerRef.current === interval) countdownTimerRef.current = null;
            setIsScrolling(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      countdownTimerRef.current = interval;
    } else {
      setIsScrolling(true);
    }
  };

  // Keyboard navigation for scrolling lyrics, switching songs, and auto-scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept when user is typing in form elements
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

      // 2. Do not intercept if modals or popups are open
      if (showQuickSettings || activeChordDiagram || showExportMenu || showSongPicker) {
        return;
      }

      // 3. Arrow Down: scroll lyrics down smoothly
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollContainerRef.current?.scrollBy({ top: 110, behavior: 'smooth' });
        return;
      }

      // 4. Arrow Up: scroll lyrics up smoothly
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollContainerRef.current?.scrollBy({ top: -110, behavior: 'smooth' });
        return;
      }

      // 5. PageDown: scroll down by 80% viewport height
      if (e.key === 'PageDown') {
        e.preventDefault();
        const pageH = scrollContainerRef.current?.clientHeight || 400;
        scrollContainerRef.current?.scrollBy({ top: pageH * 0.8, behavior: 'smooth' });
        return;
      }

      // 6. PageUp: scroll up by 80% viewport height
      if (e.key === 'PageUp') {
        e.preventDefault();
        const pageH = scrollContainerRef.current?.clientHeight || 400;
        scrollContainerRef.current?.scrollBy({ top: -pageH * 0.8, behavior: 'smooth' });
        return;
      }

      // 7. Arrow Right: switch to next song (only in setlist mode)
      if (e.key === 'ArrowRight') {
        if (setlistContext && onNextSong) {
          e.preventDefault();
          onNextSong();
        }
        return;
      }

      // 8. Arrow Left: switch to previous song (only in setlist mode)
      if (e.key === 'ArrowLeft') {
        if (setlistContext && onPrevSong) {
          e.preventDefault();
          onPrevSong();
        }
        return;
      }

      // 9. Spacebar: Play / Pause Auto-scroll
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleToggleAutoScroll();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNextSong, onPrevSong, showQuickSettings, activeChordDiagram, showExportMenu, showSongPicker, isScrolling, countdown]);

  useEffect(() => {
    const sync = () => {
      const d = document as Document & { webkitFullscreenElement?: Element | null };
      const current = d.fullscreenElement || d.webkitFullscreenElement || null;
      setIsFullscreen(current === viewerContainerRef.current);
    };
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    return () => {
      document.removeEventListener('fullscreenchange', sync);
      document.removeEventListener('webkitfullscreenchange', sync);
    };
  }, []);

  const toggleFullscreen = () => {
    const el = viewerContainerRef.current as
      | (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void })
      | null;
    if (!el) return;
    const d = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };
    if (!(d.fullscreenElement || d.webkitFullscreenElement)) {
      Promise.resolve((el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)).catch(() => {});
    } else {
      Promise.resolve((d.exitFullscreen || d.webkitExitFullscreen)?.call(d)).catch(() => {});
    }
  };

  // Hide the "how to save the PDF" hint after a few seconds
  useEffect(() => {
    if (!pdfHint) return;
    const id = setTimeout(() => setPdfHint(null), 8000);
    return () => clearTimeout(id);
  }, [pdfHint]);

  /**
   * Download as PDF = the browser's print-to-PDF using the print stylesheet (index.css, A4 portrait).
   * The page title becomes the suggested file name in the "Save as PDF" dialog, and is restored afterwards.
   */
  const handleDownloadPdf = () => {
    const previousTitle = document.title;
    const fileName = `${song.title}${song.key ? ` (${currentKey})` : ''}`.replace(/[\\/:*?"<>|]+/g, ' ').trim();
    document.title = fileName || previousTitle;

    let restored = false;
    const restore = () => {
      if (restored) return;
      restored = true;
      document.title = previousTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    setTimeout(restore, 60000); // iOS may not fire afterprint

    const ua = navigator.userAgent;
    const isApple = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (isApple) {
      setPdfHint('ในหน้าต่างพิมพ์: บีบนิ้วขยายตัวอย่างหน้า แล้วกดปุ่มแชร์ → บันทึกลงในไฟล์ (Save to Files) จะได้ไฟล์ PDF');
    }
    window.print();
  };

  // Swipe on the lyrics: up/down scrolls natively, a clear left/right swipe changes song in a setlist
  const canSwipe = Boolean((setlistContext && (onNextSong || onPrevSong)) || onOpenSetlistMenu);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!canSwipe || e.touches.length !== 1) {
      swipeStartRef.current = null;
      return;
    }
    const p = e.touches[0];
    const left = e.currentTarget.getBoundingClientRect().left;
    swipeStartRef.current = { x: p.clientX, y: p.clientY, t: Date.now(), edge: p.clientX - left < 28 };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || e.changedTouches.length !== 1) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Date.now() - start.t > 800) return;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    // Swipe right starting at the left edge of the lyrics: slide the setlist out
    if (dx > 0 && start.edge && onOpenSetlistMenu && !isFullscreen) {
      onOpenSetlistMenu();
      return;
    }
    if (dx < 0) onNextSong?.();
    else onPrevSong?.();
  };

  const handleExportSong = (format: 'chordpro' | 'json' | 'ts' = 'chordpro') => {
    setShowExportMenu(false);
    const safeTitle = song.title.replace(/[\\/:*?"<>|]/g, '_') || 'song';

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(song, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeTitle}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    if (format === 'ts') {
      const tsCode = `import { Song } from '../types/song';\n\nexport const song: Song = ${JSON.stringify(song, null, 2)};\n`;
      const blob = new Blob([tsCode], { type: 'text/typescript;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${safeTitle}.ts`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return;
    }

    let header = '';
    const content = song.chordProContent || '';
    if (!/\{(?:title|t):\s*[^}]+\}/i.test(content)) header += `{title: ${song.title}}\n`;
    if (song.artist && !/\{(?:artist|a):\s*[^}]+\}/i.test(content)) header += `{artist: ${song.artist}}\n`;
    if (song.key && !/\{(?:key|k):\s*[^}]+\}/i.test(content)) header += `{key: ${song.key}}\n`;
    if (song.tempo && !/\{(?:tempo|bpm):\s*[^}]+\}/i.test(content)) header += `{tempo: ${song.tempo}}\n`;
    if (song.timeSignature && !/\{(?:time|timeSignature):\s*[^}]+\}/i.test(content)) header += `{time: ${song.timeSignature}}\n`;

    const fullExport = header ? `${header}\n${content}` : content;
    const formattedExport = formatChordPro(fullExport, {
      cleanSpacing: true,
      standardizeSections: true,
      normalizeChordBrackets: true,
      standardizeChordCasing: true
    });
    const blob = new Blob([formattedExport], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.chordpro`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const t = getThemeStyles(settings.theme);
  const isLight = t.isLight;
  const containerBg = t.page;
  const headerBg = `${t.bar} backdrop-blur-md`;
  const chordsColor = settings.chordsColor || t.signalHex;
  const canPickSong = Boolean(setlistContext?.songs?.length && setlistContext.onSelectSong);

  // Fullscreen / stage mode: song arrows go to the right (thumb side) and get bigger touch targets
  const navOnRight = isFullscreen || !isEmbedded;
  const atFirst = (setlistContext?.currentIdx ?? 0) <= 0;
  const atLast = setlistContext ? setlistContext.currentIdx >= setlistContext.totalSongs - 1 : true;
  const arrowBtn = `${
    navOnRight ? 'w-10 h-10' : 'p-1.5'
  } flex items-center justify-center rounded-lg border transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${t.ghostBtn} ${t.focus}`;
  const arrowIcon = navOnRight ? 'w-5 h-5' : 'w-4 h-4';
  const navArrows =
    setlistContext && (onPrevSong || onNextSong) ? (
      <div className="flex items-center gap-1 shrink-0">
        {onPrevSong && (
          <button
            type="button"
            onClick={onPrevSong}
            disabled={atFirst}
            className={arrowBtn}
            title="เพลงก่อนหน้า (กดปุ่มคีย์บอร์ด ← หรือปัดขวา)"
            aria-label="เพลงก่อนหน้า"
          >
            <ChevronLeft className={arrowIcon} />
          </button>
        )}
        {onNextSong && (
          <button
            type="button"
            onClick={onNextSong}
            disabled={atLast}
            className={arrowBtn}
            title="เพลงถัดไป (กดปุ่มคีย์บอร์ด → หรือปัดซ้าย)"
            aria-label="เพลงถัดไป"
          >
            <ChevronRight className={arrowIcon} />
          </button>
        )}
      </div>
    ) : null;

  return (
    <div
      ref={viewerContainerRef}
      className={`print-area flex flex-col h-full w-full overflow-hidden select-none relative ${containerBg}`}
    >
      {/* HEADER BAR */}
      <header className={`no-print px-3 sm:px-5 py-2.5 border-b backdrop-blur-md flex flex-wrap items-center justify-between gap-x-3 gap-y-2 shrink-0 z-20 ${headerBg}`}>
        <div className="flex items-center gap-2.5 min-w-0 flex-1 basis-[240px]">
          {isEmbedded && onOpenSetlistMenu && !isFullscreen && (
            <button
              type="button"
              onClick={onOpenSetlistMenu}
              aria-label="เปิดรายการเพลงในเซ็ตลิสต์"
              title="รายการเพลงในเซ็ตลิสต์"
              className={`hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-lg border cursor-pointer ${t.ghostBtn} ${t.focus}`}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          )}

          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${t.ghostBtn}`}
              title="Close Song"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {!navOnRight && navArrows}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-semibold text-base md:text-xl truncate tracking-tight">
                {song.title}
              </h1>
              {setlistContext &&
                (canPickSong ? (
                  <button
                    type="button"
                    onClick={() => setShowSongPicker(true)}
                    aria-haspopup="dialog"
                    aria-label={`เลือกเพลงจากเซ็ตลิสต์ (เพลงที่ ${setlistContext.currentIdx + 1} จาก ${setlistContext.totalSongs})`}
                    title="เลือกเพลงจากเซ็ตลิสต์"
                    className={`h-9 pl-2.5 pr-2 rounded-full text-xs font-keys font-bold shrink-0 border flex items-center gap-1.5 cursor-pointer ${t.accentSoft} ${t.focus}`}
                  >
                    <ListMusic className="w-3.5 h-3.5" aria-hidden="true" />
                    {setlistContext.currentIdx + 1}/{setlistContext.totalSongs}
                    <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-keys font-bold shrink-0 border ${t.accentSoft}`}>
                    {setlistContext.currentIdx + 1}/{setlistContext.totalSongs}
                  </span>
                ))}
            </div>
            <div className={`flex items-center gap-2 text-xs truncate ${t.textMuted}`}>
              <span>{song.artist || 'Unknown Artist'}</span>
              {song.tempo && (
                <>
                  <span>·</span>
                  <span className="font-mono">{song.tempo} BPM</span>
                </>
              )}
              {song.key && (
                <>
                  <span>·</span>
                  <span className="font-mono">Key: {currentKey}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
          <QuickTransposeButton
            currentKey={currentKey}
            originalKey={song.key}
            semitones={transposeSemitones}
            isLight={isLight}
            onChange={handleUpdateTranspose}
          />

          <button
            onClick={handleToggleAutoScroll}
            title={isScrolling ? 'หยุดเลื่อน (กด Spacebar บนคีย์บอร์ด)' : 'เลื่อนอัตโนมัติ (กด Spacebar บนคีย์บอร์ด)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs border ${isScrolling ? `${t.accentBtn} border-transparent` : t.ghostBtn}`}
          >
            {isScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">
              {isScrolling ? 'Pause' : countdown !== null ? `${countdown}s` : 'Scroll'}
            </span>
          </button>

          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showQuickSettings ? `${t.accentBtn} border-transparent` : t.ghostBtn
            }`}
            title="แถบควบคุมด่วน (Quick Actions)"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {onEditSong && (
            <button
              onClick={() => onEditSong(song)}
              className={`p-1.5 rounded-lg border cursor-pointer ${t.ghostBtn}`}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPdf}
            title="ดาวน์โหลดเป็น PDF (A4)"
            aria-label="ดาวน์โหลดเป็น PDF"
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${t.ghostBtn}`}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span className="hidden lg:inline">PDF</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border cursor-pointer ${t.ghostBtn}`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {navOnRight && navArrows}
        </div>
      </header>

      {/* TOP CHORD BADGES BAR */}
      {settings.showChords !== false && parsed.allChords.length > 0 && (
        <div className={`no-print px-4 sm:px-6 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 ${t.subBar}`}>
          <span className={`text-xs font-display font-medium shrink-0 mr-1 flex items-center gap-1 ${t.textMuted}`}>
            <Music className={`w-3 h-3 ${t.accentText}`} />
            Chords:
          </span>
          {parsed.allChords.map((chord) => (
            <button
              key={chord}
              onClick={() => setActiveChordDiagram(activeChordDiagram === chord ? null : chord)}
              className={`px-2.5 py-1 rounded-lg font-keys font-bold border transition-colors cursor-pointer ${activeChordDiagram === chord ? `${t.accentBtn} border-transparent` : t.ghostBtn}`}
            >
              {chord}
            </button>
          ))}
        </div>
      )}

      {/* MAIN DISPLAY AREA (คอร์ดผูกกับตัวอักษรเนื้อร้อง ตำแหน่งตรงกับ Song Editor ทุกอุปกรณ์) */}
      <div
        ref={scrollContainerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => (swipeStartRef.current = null)}
        className="print-scroll flex-1 min-w-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 md:px-8 lg:px-12 py-6"
        style={{
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: 1.5,
          fontFamily: "'Courier New', Courier, 'JetBrains Mono', monospace",
          letterSpacing: '0px',
          tabSize: 4,
          touchAction: 'pan-y',
          overscrollBehavior: 'contain'
        }}
      >
        {/* Printed page only: song title block (the header bar is hidden when printing) */}
        <div className="print-only hidden print-song-head">
          <h1>{song.title}</h1>
        </div>

        <div
          data-print-cols={settings.columns === 2 ? 2 : 1}
          className={`print-grid max-w-5xl mx-auto ${settings.columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6' : 'space-y-6'}`}
        >
          {parsed.sections.map((section, sIdx) => (
            <div key={sIdx} className="print-section break-inside-avoid space-y-3 mb-6">
              {section.title && (
                <span className={`print-section-title inline-block px-3.5 py-1 rounded-full text-sm font-display font-medium ${t.numberOff}`}>
                  {section.title}
                </span>
              )}

              {section.lines.map((line, lIdx) => {
                if (line.type === 'empty') return <div key={lIdx} className="h-3" />;
                if (line.type === 'comment') {
                  return (
                    <div key={lIdx} className={`text-sm italic py-1 ${t.textMuted}`}>
                      {line.comment}
                    </div>
                  );
                }

                // แสดงคอร์ดผูกกับตำแหน่งเนื้อร้องโดยตรง (ไม่ขึ้นกับความกว้างฟอนต์ ตรงกันทุกอุปกรณ์)
                const items = line.items ?? [];
                if (items.every((it) => !it.chord && !(it.lyric || '').trim())) {
                  return <div key={lIdx} className="h-3" />;
                }

                return (
                  <div key={lIdx} className="mb-3">
                    <ChordLine
                      items={items}
                      showChords={settings.showChords !== false}
                      chordColor={chordsColor}
                      lyricClassName={t.textStrong}
                      onChordClick={(chord) => setActiveChordDiagram(chord)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Song picker (stage mode / fullscreen: jump to any song in the set) */}
      {showSongPicker && canPickSong && setlistContext?.songs && (
        <SongPickerSheet
          t={t}
          setlistTitle={setlistContext.setlistTitle}
          songs={setlistContext.songs}
          currentIndex={setlistContext.currentIdx}
          onSelect={(idx) => {
            setShowSongPicker(false);
            setlistContext?.onSelectSong?.(idx);
          }}
          onClose={() => setShowSongPicker(false)}
        />
      )}

      {/* Quick Settings Action Sheet (แผงตั้งค่าการแสดงผล) */}
      {pdfHint && (
        <div
          role="status"
          className={`no-print absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(32rem,90%)] px-4 py-3 rounded-xl border shadow-2xl text-sm font-medium text-center ${t.popover}`}
        >
          {pdfHint}
        </div>
      )}

      <div className="no-print">
      <QuickActionsSheet
        isOpen={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
        song={song}
        transposeSemitones={transposeSemitones}
        onTransposeChange={handleUpdateTranspose}
        capo={capo}
        onCapoChange={setCapo}
        scrollSpeed={settings.autoScrollSpeed || 3}
        onScrollSpeedChange={(spd) => onUpdateSettings?.({ autoScrollSpeed: spd })}
        settings={settings}
        onUpdateSettings={onUpdateSettings || (() => {})}
        onEditSong={() => {
          setShowQuickSettings(false);
          onEditSong?.(song);
        }}
        onPrintSong={() => {
          setShowQuickSettings(false);
          window.print();
        }}
      />
      </div>

      {/* Chord Diagram Popup */}
      {activeChordDiagram && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setActiveChordDiagram(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="relative">
            <button
              onClick={() => setActiveChordDiagram(null)}
              className={`absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full border flex items-center justify-center shadow-lg cursor-pointer ${t.ghostBtn}`}
            >
              <X className="w-4 h-4" />
            </button>
            <ChordDiagramVisualizer
              chord={activeChordDiagram}
              instrument={settings.instrument || 'guitar'}
              onClose={() => setActiveChordDiagram(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SongViewer;
/* ------------------------------------------------------------------ */
/* Bottom sheet: pick a song from the setlist                           */
/* Rendered inside the viewer (absolute, not fixed) so it also works in  */
/* the browser's fullscreen mode and inside the embedded setlist pane.   */
/* ------------------------------------------------------------------ */
const SongPickerSheet: React.FC<{
  t: ThemeStyles;
  setlistTitle: string;
  songs: SetlistPickerItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}> = ({ t, setlistTitle, songs, currentIndex, onSelect, onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLButtonElement>(null);
  const uid = useId();
  useDialogBehavior(panelRef, onClose);

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'center' });
  }, []);

  return (
    <div className="no-print absolute inset-0 z-40 flex items-end md:items-center md:justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        className={`relative w-full md:max-w-md max-h-[78%] flex flex-col rounded-t-2xl md:rounded-2xl border shadow-2xl animate-scaleIn motion-reduce:animate-none focus:outline-none ${t.dialog}`}
      >
        <div className={`px-5 py-3.5 border-b flex items-center justify-between gap-3 shrink-0 ${t.dialogBar}`}>
          <div className="min-w-0">
            <h2 id={`${uid}-title`} className="font-display font-semibold text-base leading-tight">
              เลือกเพลงในเซ็ตลิสต์
            </h2>
            <p className={`text-sm truncate ${t.textMuted}`}>
              {setlistTitle} · {songs.length} เพลง
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className={`w-11 h-11 -mr-2 shrink-0 rounded-lg flex items-center justify-center cursor-pointer ${t.iconBtn} ${t.focus}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <ol className="overflow-y-auto p-2.5 space-y-2 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {songs.map((item, i) => {
            const isCurrent = item.index === currentIndex;
            return (
              <li key={`${item.id}-${item.index}`}>
                <button
                  ref={isCurrent ? currentRef : undefined}
                  type="button"
                  data-autofocus={isCurrent ? true : undefined}
                  onClick={() => onSelect(item.index)}
                  aria-current={isCurrent ? 'true' : undefined}
                  className={`w-full min-h-14 p-3 rounded-2xl border flex items-center gap-3.5 text-left cursor-pointer transition-colors motion-reduce:transition-none ${
                    isCurrent ? t.cardSelected : t.cardIdle
                  } ${t.focus}`}
                >
                  <span
                    className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-keys font-bold text-sm shrink-0 ${
                      isCurrent ? t.numberOn : t.numberOff
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 font-display font-semibold text-[17px] leading-tight truncate">
                    {item.title}
                  </span>
                  {item.key && (
                    <span
                      className={`min-w-[34px] h-8 px-2 rounded-[10px] border shrink-0 flex items-center justify-center font-keys font-bold text-sm ${t.keyBadge}`}
                    >
                      {item.key}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};
