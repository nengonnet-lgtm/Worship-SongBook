import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, AppSettings } from '../types/song';
import { parseChordPro } from '../utils/chordProParser';
import { transposeKey, getSemitonesBetweenKeys } from '../utils/chordUtils';
import { formatChordPro } from '../utils/chordProFormatter';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
import { QuickActionsSheet } from './QuickActionsSheet';
import { ChordLine } from './ChordLine';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Edit2,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Plus,
  Minus,
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

  const handleUpdateTranspose = (newSemitones: number) => {
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

  const [showExportMenu, setShowExportMenu] = useState(false);

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

  const isLight = settings.theme === 'light';
  const isDarkSlate = settings.theme === 'dark';
  const isStageBlack = settings.theme === 'stage-black';

  const containerBg = isStageBlack
    ? 'bg-black text-neutral-100'
    : isDarkSlate
    ? 'bg-[#0b1322] text-slate-100'
    : 'bg-white text-slate-900';

  const headerBg = isStageBlack
    ? 'bg-neutral-950/90 border-neutral-800'
    : isDarkSlate
    ? 'bg-[#111c30]/90 border-slate-700/80'
    : 'bg-white/95 border-slate-200 text-slate-900 shadow-xs';

  const chordsColor = settings.chordsColor || (isLight ? '#1d4ed8' : '#38bdf8');

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
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${isLight ? 'bg-white hover:bg-blue-50 text-blue-900 border-slate-200' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'}`}
              title="Close Song"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-bold text-sm sm:text-base md:text-lg truncate tracking-tight ${isLight ? 'text-slate-950' : ''}`}>
                {song.title}
              </h1>
              {setlistContext && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 border ${isLight ? 'bg-sky-50 text-blue-800 border-sky-300' : 'bg-amber-400/20 text-amber-300 border-amber-400/30'}`}>
                  {setlistContext.currentIdx + 1}/{setlistContext.totalSongs}
                </span>
              )}
            </div>
            <div className={`flex items-center gap-2 text-xs truncate ${isLight ? 'text-slate-500' : 'opacity-75'}`}>
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
          <div className={`flex items-center rounded-lg border p-0.5 shadow-xs ${isLight ? 'border-blue-200 bg-blue-50/70' : 'border-neutral-700/80 bg-neutral-900/60'}`}>
            <button
              onClick={() => handleUpdateTranspose(transposeSemitones - 1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${isLight ? 'hover:bg-blue-100 text-blue-800' : 'hover:bg-neutral-700 text-neutral-300 hover:text-white'}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleUpdateTranspose(0)}
              className={`px-2 py-1 text-xs font-bold font-mono rounded transition-colors cursor-pointer ${isLight ? 'text-blue-700' : 'text-amber-400'}`}
            >
              <span>{currentKey}</span>
            </button>
            <button
              onClick={() => handleUpdateTranspose(transposeSemitones + 1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${isLight ? 'hover:bg-blue-100 text-blue-800' : 'hover:bg-neutral-700 text-neutral-300 hover:text-white'}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleToggleAutoScroll}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs border ${isScrolling ? 'bg-amber-400 text-neutral-950 border-amber-300' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'}`}
          >
            {isScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isScrolling ? 'Pause' : 'Scroll'}</span>
          </button>

          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showQuickSettings
                ? 'bg-amber-400 text-neutral-950 border-amber-300'
                : isLight
                ? 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 shadow-xs'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
            }`}
            title="แถบควบคุมด่วน (Quick Actions)"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {onEditSong && (
            <button
              onClick={() => onEditSong(song)}
              className="p-1.5 rounded-lg border bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700 cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg border bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* TOP CHORD BADGES BAR */}
      {settings.showChords !== false && parsed.allChords.length > 0 && (
        <div className={`px-4 sm:px-6 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-xs shrink-0 ${isLight ? 'bg-sky-50/60 border-slate-200' : 'bg-neutral-900/60 border-neutral-800'}`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1 text-neutral-400">
            <Music className="w-3 h-3 text-amber-400" />
            Chords:
          </span>
          {parsed.allChords.map((chord) => (
            <button
              key={chord}
              onClick={() => setActiveChordDiagram(activeChordDiagram === chord ? null : chord)}
              className={`px-2 py-0.5 rounded-md font-mono font-bold border transition-colors cursor-pointer ${activeChordDiagram === chord ? 'bg-amber-400 text-neutral-950 border-amber-300' : 'bg-neutral-800 text-neutral-200 border-neutral-700'}`}
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
                <span className={`text-xs font-bold font-mono uppercase tracking-wider block ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>
                  {section.title}
                </span>
              )}

              {section.lines.map((line, lIdx) => {
                if (line.type === 'empty') return <div key={lIdx} className="h-3" />;
                if (line.type === 'comment') {
                  return (
                    <div key={lIdx} className={`text-xs italic pl-2.5 py-1 border-l-2 ${isLight ? 'text-slate-500 border-slate-300' : 'text-neutral-400 border-neutral-700'}`}>
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
                      lyricClassName={isLight ? 'text-slate-800' : 'text-neutral-200'}
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
              className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center shadow-lg cursor-pointer"
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