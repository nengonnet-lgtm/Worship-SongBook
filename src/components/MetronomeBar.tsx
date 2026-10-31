import React, { useState, useEffect, useRef } from 'react';
import { MetronomeEngine, TapTempoCalculator } from '../utils/metronome';
import { Play, Square, Minus, Plus, Activity } from 'lucide-react';
import { getThemeStyles } from '../utils/themeStyles';

interface Props {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
  compact?: boolean;
  theme?: string;
}

export const MetronomeBar: React.FC<Props> = ({
  initialBpm = 120,
  onBpmChange,
  compact = false,
  theme
}) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tapActive, setTapActive] = useState(false);
  const t = getThemeStyles(theme);

  const engineRef = useRef<MetronomeEngine | null>(null);
  const tapCalculatorRef = useRef<TapTempoCalculator>(new TapTempoCalculator());

  useEffect(() => {
    const engine = new MetronomeEngine();
    engine.setTempo(bpm);
    engine.setTimeSignature(beatsPerBar);
    engine.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });
    engineRef.current = engine;

    return () => {
      engine.stop();
    };
  }, []);

  useEffect(() => {
    if (initialBpm && initialBpm !== bpm) {
      setBpm(initialBpm);
      if (engineRef.current) {
        engineRef.current.setTempo(initialBpm);
      }
    }
  }, [initialBpm]);

  const handleBpmUpdate = (newBpm: number) => {
    const clamped = Math.max(30, Math.min(260, newBpm));
    setBpm(clamped);
    if (engineRef.current) {
      engineRef.current.setTempo(clamped);
    }
    if (onBpmChange) {
      onBpmChange(clamped);
    }
  };

  const handleToggle = () => {
    if (!engineRef.current) return;
    const running = engineRef.current.toggle();
    setIsPlaying(running);
    if (!running) {
      setCurrentBeat(-1);
    }
  };

  const handleTap = () => {
    setTapActive(true);
    setTimeout(() => setTapActive(false), 120);
    const calculated = tapCalculatorRef.current.tap();
    if (calculated) {
      handleBpmUpdate(calculated);
    }
  };

  const handleTimeSig = (beats: number) => {
    setBeatsPerBar(beats);
    if (engineRef.current) {
      engineRef.current.setTimeSignature(beats);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-1.5 rounded-lg border ${t.card} ${t.textStrong}`}>
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
            isPlaying ? `${t.accentBtn}` : `${t.ghostBtn}`
          }`}
          title={isPlaying ? 'Stop metronome' : 'Start metronome'}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex items-center gap-1.5">
          <span className={`font-mono font-bold text-sm tabular-nums ${t.textStrong}`}>
            {bpm}
          </span>
          <span className={`text-[10px] font-medium ${t.textMuted}`}>BPM</span>
        </div>

        {/* Visual beat indicator */}
        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: beatsPerBar }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-75 ${
                currentBeat === i
                  ? i === 0
                    ? 'bg-amber-400 scale-125 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                    : 'bg-current scale-110'
                  : t.track
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleTap}
          className={`px-2 py-1 text-xs rounded font-medium border transition-colors cursor-pointer ${
            tapActive ? t.segOn : t.ghostBtn
          }`}
        >
          TAP
        </button>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2.5 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md select-none ${t.dialog}`}>
      {/* Header: Title & Time Signature */}
      <div className="flex items-center justify-between pr-6">
        <div className="flex items-center gap-1.5">
          <Activity className={`w-3.5 h-3.5 ${t.accentText}`} />
          <span className={`text-xs font-bold tracking-tight ${t.textStrong}`}>Metronome</span>
        </div>

        {/* Time Signature selector */}
        <div className={`flex items-center gap-0.5 p-0.5 rounded-md border ${t.card}`}>
          {[
            { label: '4/4', beats: 4 },
            { label: '3/4', beats: 3 },
            { label: '2/4', beats: 2 },
            { label: '6/8', beats: 6 }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => handleTimeSig(item.beats)}
              className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                beatsPerBar === item.beats
                  ? t.segOn
                  : `${t.textMuted} hover:${t.textStrong}`
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* BPM display & Quick adjust buttons */}
      <div className="flex items-center justify-center gap-1.5 py-0.5">
        <button
          onClick={() => handleBpmUpdate(bpm - 5)}
          className={`px-2 py-1 text-[11px] font-mono font-bold rounded border transition-colors cursor-pointer active:scale-95 ${t.ghostBtn}`}
          title="Minus 5 BPM"
        >
          -5
        </button>
        <button
          onClick={() => handleBpmUpdate(bpm - 1)}
          className={`p-1 rounded border transition-colors cursor-pointer active:scale-95 ${t.ghostBtn}`}
          title="Minus 1 BPM"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center min-w-16 px-1.5">
          <span className={`text-2xl font-black font-mono tabular-nums tracking-tight leading-none ${t.textStrong}`}>
            {bpm}
          </span>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-0.5 ${t.textMuted}`}>BPM</span>
        </div>

        <button
          onClick={() => handleBpmUpdate(bpm + 1)}
          className={`p-1 rounded border transition-colors cursor-pointer active:scale-95 ${t.ghostBtn}`}
          title="Plus 1 BPM"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleBpmUpdate(bpm + 5)}
          className={`px-2 py-1 text-[11px] font-mono font-bold rounded border transition-colors cursor-pointer active:scale-95 ${t.ghostBtn}`}
          title="Plus 5 BPM"
        >
          +5
        </button>
      </div>

      {/* Compact Slider */}
      <input
        type="range"
        min={40}
        max={240}
        value={bpm}
        onChange={(e) => handleBpmUpdate(parseInt(e.target.value, 10))}
        className={`w-full rounded h-1.5 cursor-pointer ${t.accentColor}`}
      />

      {/* Play/Stop & Tap Tempo buttons */}
      <div className="grid grid-cols-2 gap-2 w-full pt-0.5">
        <button
          onClick={handleTap}
          type="button"
          className={`flex items-center justify-center py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer active:scale-95 select-none ${
            tapActive
              ? t.segOn
              : t.ghostBtn
          }`}
        >
          <span>TAP</span>
        </button>

        <button
          onClick={handleToggle}
          type="button"
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 select-none shadow-sm ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : t.accentBtn
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>STOP</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>START</span>
            </>
          )}
        </button>
      </div>

      {/* Visual beat flashing dots */}
      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {Array.from({ length: beatsPerBar }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center justify-center rounded-full transition-all duration-75 ${
              beatsPerBar <= 4 ? 'w-5 h-5' : 'w-4 h-4'
            } ${
              currentBeat === i
                ? i === 0
                  ? 'bg-amber-400 scale-125 shadow-[0_0_10px_rgba(251,191,36,0.9)] text-neutral-950 font-bold'
                  : `${t.accentBtn} scale-110 shadow-xs font-bold`
                : `${t.track} ${t.textMuted}`
            }`}
          >
            <span className="text-[9px] font-mono font-bold">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
