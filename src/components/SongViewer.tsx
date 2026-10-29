import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, AppSettings } from '../types/song';
import { parseChordPro } from '../utils/chordProParser';
import { transposeKey, getSemitonesBetweenKeys } from '../utils/chordUtils';
import { formatChordPro } from '../utils/chordProFormatter';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
import { QuickActionsSheet } from './QuickActionsSheet';
import { ChordLine } from './ChordLine';
import { getThemeStyles } from '../utils/themeStyles';
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
  FileCode
} from 'lucide-react';

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
  };
  initialKey?: string;
  onKeyChange?: (newKey: string, semitones: number) => void;
  isEmbedded?: boolean;
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
  isEmbedded = false
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
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [capo, setCapo] = useState<number>(song.capo || 0);

  useEffect(() => {
    setTransposeSemitones(computeInitialSemitones());
    setCapo(song.capo || 0);
    setIsScrolling(false);
    setCountdown(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [song.id, effectiveTargetKey, song.key, song.capo]);

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
    if (isScrolling) {
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
            setIsScrolling(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
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
      if (showQuickSettings || activeChordDiagram || showExportMenu) {
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
  }, [onNextSong, onPrevSong, showQuickSettings, activeChordDiagram, showExportMenu, isScrolling]);

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return;
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
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

  return (
    <div
      ref={viewerContainerRef}
      className={`flex flex-col h-full w-full overflow-hidden select-none relative ${containerBg}`}
    >
      {/* HEADER BAR */}
      <header className={`px-3 sm:px-5 py-2.5 border-b backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20 ${headerBg}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          {!isEmbedded && onClose && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${t.ghostBtn}`}
              title="Close Song"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {setlistContext && (onPrevSong || onNextSong) && (
            <div className="flex items-center gap-1 shrink-0">
              {onPrevSong && (
                <button
                  type="button"
                  onClick={onPrevSong}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${t.ghostBtn}`}
                  title="เพลงก่อนหน้า (กดปุ่มคีย์บอร์ด ← หรือ ArrowLeft)"
                  aria-label="เพลงก่อนหน้า"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              {onNextSong && (
                <button
                  type="button"
                  onClick={onNextSong}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${t.ghostBtn}`}
                  title="เพลงถัดไป (กดปุ่มคีย์บอร์ด → หรือ ArrowRight)"
                  aria-label="เพลงถัดไป"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-display font-semibold text-base md:text-xl truncate tracking-tight">
                {song.title}
              </h1>
              {setlistContext && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-keys font-bold shrink-0 border ${t.accentSoft}`}>
                  {setlistContext.currentIdx + 1}/{setlistContext.totalSongs}
                </span>
              )}
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
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
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg border cursor-pointer ${t.ghostBtn}`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* TOP CHORD BADGES BAR */}
      {settings.showChords !== false && parsed.allChords.length > 0 && (
        <div className={`px-4 sm:px-6 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 ${t.subBar}`}>
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
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6"
        style={{
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: 1.5,
          fontFamily: "'Courier New', Courier, 'JetBrains Mono', monospace",
          letterSpacing: '0px',
          tabSize: 4
        }}
      >
        <div className={`max-w-5xl mx-auto ${settings.columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6' : 'space-y-6'}`}>
          {parsed.sections.map((section, sIdx) => (
            <div key={sIdx} className="break-inside-avoid space-y-3 mb-6">
              {section.title && (
                <span className={`inline-block px-3.5 py-1 rounded-full text-sm font-display font-medium ${t.numberOff}`}>
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

      {/* Quick Settings Action Sheet (แผงตั้งค่าการแสดงผล) */}
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

      {/* Chord Diagram Popup */}
      {activeChordDiagram && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
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