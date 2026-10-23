import React, { useState, useEffect, useRef } from 'react';
import { MetronomeEngine, TapTempoCalculator } from '../utils/metronome';
import { Play, Square, Minus, Plus, Activity, Volume2 } from 'lucide-react';

interface Props {
  initialBpm?: number;
  onBpmChange?: (bpm: number) => void;
  compact?: boolean;
}

export const MetronomeBar: React.FC<Props> = ({
  initialBpm = 120,
  onBpmChange,
  compact = false
}) => {
  const [bpm, setBpm] = useState(initialBpm);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatsPerBar, setBeatsPerBar] = useState(4);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [tapActive, setTapActive] = useState(false);

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
      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200">
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors cursor-pointer ${
            isPlaying ? 'bg-amber-500 text-neutral-950 font-bold' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
          }`}
          title={isPlaying ? 'Stop metronome' : 'Start metronome'}
        >
          {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-sm text-neutral-100 tabular-nums">
            {bpm}
          </span>
          <span className="text-[10px] text-neutral-400 font-medium">BPM</span>
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
                    : 'bg-neutral-300 scale-110'
                  : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleTap}
          className={`px-2 py-1 text-xs rounded font-medium border border-neutral-700 transition-colors cursor-pointer ${
            tapActive ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
          }`}
        >
          TAP
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-neutral-900/95 border border-neutral-800 text-neutral-200 shadow-xl backdrop-blur-md select-none">
      {/* Header: Title & Time Signature */}
      <div className="flex items-center justify-between pr-6">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold tracking-tight text-neutral-200">Metronome</span>
        </div>

        {/* Time Signature selector */}
        <div className="flex items-center gap-0.5 bg-neutral-950 p-0.5 rounded-md border border-neutral-800">
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
                  ? 'bg-neutral-800 text-amber-400 font-bold shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
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
          className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer active:scale-95"
          title="Minus 5 BPM"
        >
          -5
        </button>
        <button
          onClick={() => handleBpmUpdate(bpm - 1)}
          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer active:scale-95"
          title="Minus 1 BPM"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <div className="flex flex-col items-center min-w-16 px-1.5">
          <span className="text-2xl font-black font-mono text-neutral-100 tabular-nums tracking-tight leading-none">
            {bpm}
          </span>
          <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-semibold mt-0.5">BPM</span>
        </div>

        <button
          onClick={() => handleBpmUpdate(bpm + 1)}
          className="p-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer active:scale-95"
          title="Plus 1 BPM"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleBpmUpdate(bpm + 5)}
          className="px-2 py-1 text-[11px] font-mono font-bold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer active:scale-95"
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
        className="w-full accent-amber-400 bg-neutral-800 rounded h-1.5 cursor-pointer"
      />

      {/* Play/Stop & Tap Tempo buttons */}
      <div className="grid grid-cols-2 gap-2 w-full pt-0.5">
        <button
          onClick={handleTap}
          type="button"
          className={`flex items-center justify-center py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer active:scale-95 select-none ${
            tapActive
              ? 'bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-[0.98]'
              : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:bg-neutral-750 hover:border-neutral-600'
          }`}
        >
          <span>TAP</span>
        </button>

        <button
          onClick={handleToggle}
          type="button"
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-lg transition-all cursor-pointer active:scale-95 select-none shadow-sm ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
              : 'bg-sky-500 hover:bg-sky-400 text-neutral-950 shadow-[0_0_10px_rgba(14,165,233,0.3)]'
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
              <span>CLICK</span>
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
                  : 'bg-sky-400 scale-110 shadow-[0_0_6px_rgba(56,189,248,0.7)] text-neutral-950 font-bold'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700/80'
            }`}
          >
            <span className="text-[9px] font-mono font-bold">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
