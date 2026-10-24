import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Song, AppSettings } from '../types/song';
import { parseChordPro } from '../utils/chordProParser';
import { transposeKey, getSemitonesBetweenKeys } from '../utils/chordUtils';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
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
  Eye,
  EyeOff,
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

  useEffect(() => {
    setTransposeSemitones(computeInitialSemitones());
    setIsScrolling(false);
    setCountdown(null);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [song.id, effectiveTargetKey, song.key]);

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

  // Auto-scroll Logic (ปรับแก้ให้รองรับ iPad, iOS Touch & หน้าจอ 120Hz)
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
          // สั่ง scrollBy บังคับ Touch Render Engine ของแท็บเล็ตขยับ
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (setlistContext && onNextSong) {
          onNextSong();
        } else {
          handleToggleAutoScroll();
        }
      } else if (e.code === 'ArrowRight' || e.code === 'PageDown') {
        if (setlistContext && onNextSong) {
          e.preventDefault();
          onNextSong();
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop += 200;
        }
      } else if (e.code === 'ArrowLeft' || e.code === 'PageUp') {
        if (setlistContext && onPrevSong) {
          e.preventDefault();
          onPrevSong();
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop -= 200;
        }
      } else if (e.code === 'ArrowDown') {
        if (scrollContainerRef.current) {
          e.preventDefault();
          scrollContainerRef.current.scrollTop += 60;
        }
      } else if (e.code === 'ArrowUp') {
        if (scrollContainerRef.current) {
          e.preventDefault();
          scrollContainerRef.current.scrollTop -= 60;
        }
      } else if (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleToggleAutoScroll();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          toggleFullscreen();
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setlistContext, onNextSong, onPrevSong, isFullscreen, onClose, isScrolling]);

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

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

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

    // Default: ChordPro
    let header = '';
    const content = song.chordProContent || '';
    if (!/\{(?:title|t):\s*[^}]+\}/i.test(content)) header += `{title: ${song.title}}\n`;
    if (song.artist && !/\{(?:artist|a):\s*[^}]+\}/i.test(content)) header += `{artist: ${song.artist}}\n`;
    if (song.key && !/\{(?:key|k):\s*[^}]+\}/i.test(content)) header += `{key: ${song.key}}\n`;
    if (song.tempo && !/\{(?:tempo|bpm):\s*[^}]+\}/i.test(content)) header += `{tempo: ${song.tempo}}\n`;
    if (song.timeSignature && !/\{(?:time|timeSignature):\s*[^}]+\}/i.test(content)) header += `{time: ${song.timeSignature}}\n`;

    const fullExport = header ? `${header}\n${content}` : content;
    const blob = new Blob([fullExport], { type: 'text/plain;charset=utf-8' });
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
      style={{
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
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
              <span className={isLight ? 'text-slate-600 font-medium' : ''}>{song.artist || 'Unknown Artist'}</span>
              {song.tempo && (
                <>
                  <span>·</span>
                  <span className="font-mono">{song.tempo} BPM</span>
                </>
              )}
              {song.timeSignature && (
                <>
                  <span>·</span>
                  <span className="font-mono">{song.timeSignature}</span>
                </>
              )}
              {song.capo > 0 && (
                <>
                  <span>·</span>
                  <span className={`font-semibold font-mono ${isLight ? 'text-blue-700' : 'text-amber-400'}`}>
                    Capo {song.capo}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Key Transpose */}
          <div className={`flex items-center rounded-lg border p-0.5 shadow-xs ${isLight ? 'border-blue-200 bg-blue-50/70' : 'border-neutral-700/80 bg-neutral-900/60'}`}>
            <button
              onClick={() => handleUpdateTranspose(transposeSemitones - 1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${isLight ? 'hover:bg-blue-100 text-blue-800' : 'hover:bg-neutral-700 text-neutral-300 hover:text-white'}`}
              title="Transpose down"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => handleUpdateTranspose(0)}
              className={`px-2 py-1 text-xs font-bold font-mono rounded transition-colors cursor-pointer flex items-center gap-1 ${isLight ? 'text-blue-700 hover:bg-blue-100/80' : 'text-amber-400 hover:bg-neutral-800'}`}
              title={`Key: ${currentKey} - Reset to original key (${song.key})`}
            >
              <span>{currentKey}</span>
              {transposeSemitones !== 0 && (
                <span className={`text-[10px] font-bold ${isLight ? 'text-blue-600' : 'opacity-80'}`}>
                  ({transposeSemitones > 0 ? `+${transposeSemitones}` : transposeSemitones})
                </span>
              )}
            </button>

            <button
              onClick={() => handleUpdateTranspose(transposeSemitones + 1)}
              className={`px-2 py-1 text-xs font-bold rounded transition-colors cursor-pointer ${isLight ? 'hover:bg-blue-100 text-blue-800' : 'hover:bg-neutral-700 text-neutral-300 hover:text-white'}`}
              title="Transpose up"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Auto Scroll */}
          <button
            onClick={handleToggleAutoScroll}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs border ${isScrolling ? (isLight ? 'bg-blue-600 text-white border-blue-700' : 'bg-amber-400 text-neutral-950 border-amber-300') : (isLight ? 'bg-white hover:bg-blue-50 text-blue-900 border-blue-200' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700')}`}
          >
            {isScrolling ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span className="hidden sm:inline">{isScrolling ? 'Pause' : 'Scroll'}</span>
          </button>

          {/* Quick Settings */}
          <button
            onClick={() => setShowQuickSettings(!showQuickSettings)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${showQuickSettings ? (isLight ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-neutral-700 text-amber-400 border-neutral-600') : (isLight ? 'bg-white hover:bg-blue-50 text-blue-900 border-slate-200' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700')}`}
            title="Options"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Edit Song */}
          {onEditSong && (
            <button
              onClick={() => onEditSong(song)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${isLight ? 'bg-white hover:bg-blue-50 text-blue-900 border-slate-200' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'}`}
              title="Edit Song"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                showExportMenu
                  ? isLight
                    ? 'bg-blue-100 text-blue-900 border-blue-400'
                    : 'bg-neutral-700 text-white border-amber-400'
                  : isLight
                  ? 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
              }`}
              title="Export Song (.chordpro, .json, .ts)"
            >
              <Download className="w-4 h-4 text-amber-400" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div
                  className={`absolute right-0 top-full mt-1.5 w-56 rounded-xl shadow-2xl py-1.5 z-50 border text-xs ${
                    isLight
                      ? 'bg-white border-blue-200 text-slate-800 shadow-blue-900/15'
                      : 'bg-neutral-900 border-neutral-700 text-neutral-100 shadow-black/80'
                  }`}
                >
                  <div className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                    isLight
                      ? 'text-blue-700 border-blue-100 bg-sky-50/60'
                      : 'text-neutral-400 border-neutral-800 bg-neutral-950/40'
                  }`}>
                    Export Single Song
                  </div>

                  <button
                    onClick={() => handleExportSong('chordpro')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer ${
                      isLight ? 'hover:bg-blue-50 text-slate-800' : 'hover:bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    <Music className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold">ChordPro (.chordpro)</div>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        มาตรฐานเนื้อร้องและคอร์ด
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportSong('json')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer border-t ${
                      isLight ? 'border-blue-50 hover:bg-blue-50 text-slate-800' : 'border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold">JSON (.json)</div>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        Object ข้อมูลเพลง
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExportSong('ts')}
                    className={`w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer border-t ${
                      isLight ? 'border-blue-50 hover:bg-blue-50 text-slate-800' : 'border-neutral-800 hover:bg-neutral-800 text-neutral-200'
                    }`}
                  >
                    <FileCode className="w-4 h-4 text-sky-400 shrink-0" />
                    <div>
                      <div className="font-semibold">TypeScript (.ts)</div>
                      <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-neutral-400'}`}>
                        โค้ด Song Object สำเร็จรูป
                      </p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${isLight ? 'bg-white hover:bg-blue-50 text-blue-800 border-blue-200' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'}`}
            title="Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Setlist Navigation */}
          {setlistContext && (
            <div className={`flex items-center gap-1 border-l pl-2 ${isLight ? 'border-blue-200' : 'border-neutral-700'}`}>
              <button
                onClick={onPrevSong}
                disabled={setlistContext.currentIdx === 0}
                className="p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none border bg-neutral-800 text-neutral-200 border-neutral-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={onNextSong}
                disabled={setlistContext.currentIdx === setlistContext.totalSongs - 1}
                className={`p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none font-bold shadow-xs cursor-pointer ${isLight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* QUICK SETTINGS POPUP MENU */}
      {showQuickSettings && (
        <div className={`absolute top-14 right-4 z-30 w-72 rounded-xl p-3.5 shadow-2xl border backdrop-blur-xl ${isLight ? 'bg-white/98 border-blue-200 text-slate-900 shadow-blue-900/10' : 'bg-neutral-900/95 border-neutral-700 text-neutral-100 shadow-black/80'}`}>
          <div className={`flex items-center justify-between pb-2 mb-2 border-b text-xs font-bold uppercase ${isLight ? 'border-blue-100 text-blue-900' : 'border-neutral-700/50 text-neutral-400'}`}>
            <span>Viewer Options</span>
            <button onClick={() => setShowQuickSettings(false)} className="bg-transparent border-0 cursor-pointer text-neutral-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span>Font Size</span>
              <div className="flex items-center gap-1 rounded-lg p-0.5 border border-neutral-700 bg-neutral-800/80">
                <button onClick={() => onUpdateSettings?.({ fontSize: Math.max(12, (settings.fontSize || 16) - 1) })} className="px-2 py-0.5 bg-transparent border-0 text-white cursor-pointer">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono px-1.5 font-bold">{settings.fontSize || 16}px</span>
                <button onClick={() => onUpdateSettings?.({ fontSize: Math.min(32, (settings.fontSize || 16) + 1) })} className="px-2 py-0.5 bg-transparent border-0 text-white cursor-pointer">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Scroll Speed</span>
              <div className="flex items-center gap-1 rounded-lg p-0.5 border border-neutral-700 bg-neutral-800/80">
                <button onClick={() => onUpdateSettings?.({ autoScrollSpeed: Math.max(1, (settings.autoScrollSpeed || 3) - 1) })} className="px-2 py-0.5 bg-transparent border-0 text-white cursor-pointer">
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono px-1.5 font-bold">{settings.autoScrollSpeed || 3}</span>
                <button onClick={() => onUpdateSettings?.({ autoScrollSpeed: Math.min(10, (settings.autoScrollSpeed || 3) + 1) })} className="px-2 py-0.5 bg-transparent border-0 text-white cursor-pointer">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Columns</span>
              <div className="flex rounded-lg overflow-hidden border border-neutral-700">
                <button onClick={() => onUpdateSettings?.({ columns: 1 })} className={`px-2.5 py-1 border-0 cursor-pointer ${settings.columns === 1 ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300'}`}>1</button>
                <button onClick={() => onUpdateSettings?.({ columns: 2 })} className={`px-2.5 py-1 border-0 cursor-pointer ${settings.columns === 2 ? 'bg-amber-400 text-neutral-950 font-bold' : 'bg-neutral-800 text-neutral-300'}`}>2</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>Show Chords</span>
              <button onClick={() => onUpdateSettings?.({ showChords: !settings.showChords })} className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-neutral-700 bg-neutral-800 text-inherit cursor-pointer">
                {settings.showChords !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{settings.showChords !== false ? 'Visible' : 'Hidden'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-400 text-neutral-950 px-6 py-2.5 rounded-2xl font-black text-lg shadow-2xl flex items-center gap-2 animate-bounce">
          <span>Scrolling in {countdown}...</span>
        </div>
      )}

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

      {/* CHORD DIAGRAM MODAL OVERLAY */}
      {activeChordDiagram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative">
            <button onClick={() => setActiveChordDiagram(null)} className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-white rounded-full bg-neutral-800 z-10 cursor-pointer border-0">
              <X className="w-4 h-4" />
            </button>
            <ChordDiagramVisualizer chord={activeChordDiagram} instrument={settings.instrument || 'guitar'} onClose={() => setActiveChordDiagram(null)} />
          </div>
        </div>
      )}

      {/* MAIN CHORDS & LYRICS DISPLAY AREA */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 scroll-smooth"
        style={{
          fontSize: `${settings.fontSize || 16}px`,
          lineHeight: 1.7,
          fontFamily: "'Anek Thai', 'Sarabun', 'JetBrains Mono', monospace",
          fontVariantLigatures: 'none',
          WebkitOverflowScrolling: 'touch', // ปรับสิทธิ์การเลื่อนบน iOS
          touchAction: 'pan-y'
        }}
      >
        <div className={`max-w-5xl mx-auto ${settings.columns === 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6' : 'space-y-6'}`}>
          {parsed.sections.map((section, sIdx) => (
            <div key={sIdx} className="break-inside-avoid mb-6">
              {section.title && (
                <div className="mb-2.5">
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider font-mono border ${isLight ? 'bg-blue-50 text-blue-900 border-blue-200' : 'bg-amber-400/15 text-amber-300 border-amber-400/25'}`}>
                    {section.title}
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {section.lines.map((line, lIdx) => {
                  if (line.type === 'empty') return <div key={lIdx} className="h-4" />;
                  if (line.type === 'comment') {
                    return (
                      <div key={lIdx} className={`text-xs italic pl-2.5 py-1 border-l-2 ${isLight ? 'text-sky-950 border-sky-500 bg-sky-50/70' : 'text-neutral-400 border-neutral-600'}`}>
                        {line.comment}
                      </div>
                    );
                  }

                  // 1. ท่อนดนตรีบรรเลงหรือบรรทัดที่มีแต่คอร์ดล้วน
                  if (line.isChordOnly) {
                    return (
                      <div key={lIdx} className="flex flex-wrap items-center gap-x-2 gap-y-2 py-1.5 font-mono select-none">
                        {line.items?.map((item, iIdx) => {
                          const trimmed = item.lyric?.trim() || '';
                          const isSectionLabel = /^(Intro|IN|Solo|Outro|Hook|Ending|Interlude|Bridge)\s*[:|-]?$/i.test(trimmed);
                          return (
                            <React.Fragment key={iIdx}>
                              {!item.chord && trimmed && (
                                <span className={isSectionLabel ? 'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'font-bold text-sm px-1 text-neutral-400'}>
                                  {trimmed}
                                </span>
                              )}
                              {item.chord && settings.showChords !== false && (
                                <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => item.chord && setActiveChordDiagram(activeChordDiagram === item.chord ? null : item.chord)}
                                    style={{ color: chordsColor }}
                                    className="font-bold font-mono text-sm sm:text-base px-2.5 py-1 rounded-md transition-all cursor-pointer bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700/80"
                                  >
                                    {item.chord}
                                  </button>
                                  {trimmed && <span className="text-neutral-400 font-bold text-sm px-0.5">{trimmed}</span>}
                                </span>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    );
                  }

                  // 2. บรรทัดเนื้อร้องพร้อมคอร์ด (แยก 2 บรรทัด + คำนวณ Visual Character สำหรับสระไทย)
                  const THAI_NON_SPACING_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;
                  const getVisualLen = (str: string) => str.replace(THAI_NON_SPACING_REGEX, '').length;

                  let chordElements: React.ReactNode[] = [];
                  let lyricLineStr = '';
                  let currentVisualPos = 0;

                  line.items && line.items.forEach((item, itemIdx) => {
                    const currentChord = item.chord || '';
                    const currentLyric = item.lyric || '';

                    const visualChordLen = getVisualLen(currentChord);
                    const visualLyricLen = getVisualLen(currentLyric);

                    if (currentChord && settings.showChords !== false) {
                      chordElements.push(
                        <span
                          key={itemIdx}
                          className="absolute"
                          style={{ left: `${currentVisualPos}ch` }}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveChordDiagram(activeChordDiagram === currentChord ? null : currentChord)}
                            style={{ color: chordsColor }}
                            className="font-bold font-mono hover:underline cursor-pointer bg-transparent p-0 m-0 border-0 text-[0.88em] leading-none whitespace-nowrap"
                            title={`View diagram for ${currentChord}`}
                          >
                            {currentChord}
                          </button>
                        </span>
                      );
                    }

                    lyricLineStr += currentLyric;

                    if (currentChord && settings.showChords !== false && visualChordLen > visualLyricLen) {
                      const extraSpaces = visualChordLen - visualLyricLen;
                      lyricLineStr += ' '.repeat(extraSpaces);
                      currentVisualPos += visualChordLen;
                    } else {
                      currentVisualPos += visualLyricLen;
                    }
                  });

                  return (
                    <div key={lIdx} className="font-mono text-left select-none mb-3">
                      {/* บรรทัดคอร์ดด้านบน */}
                      {settings.showChords !== false && chordElements.length > 0 && (
                        <div className="relative h-[1.25em] whitespace-pre font-bold block">
                          {chordElements}
                        </div>
                      )}

                      {/* บรรทัดเนื้อเพลงด้านล่าง */}
                      <div className={`whitespace-pre block leading-normal ${isLight ? 'text-slate-900' : 'text-neutral-100'}`}>
                        {lyricLineStr}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER SHORTCUT BAR */}
      <footer className={`px-4 py-2 border-t flex items-center justify-between text-xs shrink-0 select-none ${isLight ? 'bg-white/95 border-blue-100 text-slate-600' : 'bg-neutral-950/90 border-neutral-800 text-neutral-400'}`}>
        <div className="flex items-center gap-2 font-mono">
          <span>Shortcuts:</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] border bg-neutral-800 text-neutral-200 border-neutral-700">Space</kbd>
          <span className="hidden sm:inline">{setlistContext ? 'Next Song' : 'Scroll'}</span>
          <kbd className="px-1.5 py-0.5 rounded text-[10px] border bg-neutral-800 text-neutral-200 border-neutral-700">Arrows</kbd>
          <span className="hidden sm:inline">Navigate</span>
        </div>

        <div className="flex items-center gap-3">
          {song.notes && <span className="text-[11px] truncate max-w-xs italic text-amber-400/90">Note: {song.notes}</span>}
          <span className="text-[11px] font-mono opacity-60">{isScrolling ? '● Autoscrolling' : 'Worship SongBook'}</span>
        </div>
      </footer>
    </div>
  );
};

export default SongViewer;