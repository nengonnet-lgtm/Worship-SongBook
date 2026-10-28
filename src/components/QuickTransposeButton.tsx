import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Minus, Plus } from 'lucide-react';
import { NOTE_TO_INDEX, transposeKey } from '../utils/chordUtils';

/**
 * Keeps a semitone offset in the range -5..+6 (the same range getSemitonesBetweenKeys uses).
 * Transposing by n and n ± 12 gives the same notes, so stepping past +6 wraps to -5 and the
 * counter never drifts to values like +14.
 */
export const normalizeSemitones = (n: number): number => {
  const m = ((n % 12) + 12) % 12;
  return m > 6 ? m - 12 : m;
};

export interface KeyChoice {
  /** Key name as the app spells it, e.g. "Eb" */
  key: string;
  /** Offset from the original key, -5..+6 */
  semitones: number;
}

const rootIndex = (key: string): number => {
  const m = key.match(/^([A-Ga-g][#b]?)/);
  return m ? NOTE_TO_INDEX[m[1].toUpperCase()] ?? 0 : 0;
};

/**
 * The 12 keys a song can be moved to, in chromatic order (C … B).
 * Names come from transposeKey, so they match the key shown in the header.
 */
export const buildKeyChoices = (baseKey: string): KeyChoice[] => {
  const list: KeyChoice[] = [];
  for (let n = -5; n <= 6; n++) {
    list.push({ key: transposeKey(baseKey, n), semitones: n });
  }
  return list.sort((a, b) => rootIndex(a.key) - rootIndex(b.key));
};

interface QuickTransposeButtonProps {
  /** Key after transposing, e.g. "Eb" */
  currentKey: string;
  /** The song's original key (the picker treats a missing key as C, like the rest of the viewer) */
  originalKey?: string;
  /** Current offset from the original key, in semitones */
  semitones: number;
  isLight?: boolean;
  /** Called with the new semitone offset (already within -5..+6) */
  onChange: (semitones: number) => void;
}

const formatOffset = (n: number) => (n > 0 ? `+${n}` : `\u2212${Math.abs(n)}`);

/**
 * Header control that shows the current key:
 *   [ − ]  [ key +2 ▾ ]  [ + ]
 *   - minus / plus lower / raise the key by one semitone
 *   - the centre button opens a grid of all 12 keys; picking one transposes the chords straight to it
 *     (the "orig" cell takes you back to the original key)
 */
export const QuickTransposeButton: React.FC<QuickTransposeButtonProps> = ({
  currentKey,
  originalKey,
  semitones,
  isLight = false,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const baseKey = originalKey || 'C';
  const choices = useMemo(() => buildKeyChoices(baseKey), [baseKey]);
  const isTransposed = semitones !== 0;

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // Keep the popover inside the screen (the button sits near the right edge on phones/tablets)
  useLayoutEffect(() => {
    if (!open) {
      setShiftX(0);
      return;
    }
    const el = popoverRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    let shift = 0;
    if (rect.right > window.innerWidth - margin) shift = window.innerWidth - margin - rect.right;
    if (rect.left + shift < margin) shift = margin - rect.left;
    setShiftX(shift);
  }, [open]);

  const pick = (n: number) => {
    setOpen(false);
    if (n !== semitones) onChange(n);
  };

  const stepButton = `flex items-center justify-center w-9 h-8 rounded-md transition-colors cursor-pointer active:scale-95 ${
    isLight
      ? 'text-blue-800 hover:bg-blue-100'
      : 'text-neutral-300 hover:bg-neutral-700 hover:text-white'
  }`;

  const centreTone = isTransposed
    ? isLight
      ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      : 'bg-amber-400/15 text-amber-300 hover:bg-amber-400/25'
    : isLight
    ? 'text-blue-700 hover:bg-blue-100'
    : 'text-amber-400 hover:bg-neutral-700';

  const cellClass = (isCurrent: boolean, isOriginal: boolean) => {
    if (isCurrent) {
      return isLight ? 'bg-blue-600 text-white' : 'bg-amber-400 text-neutral-950';
    }
    const base = isLight
      ? 'bg-slate-100 hover:bg-blue-100 text-slate-800'
      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200';
    const ring = isOriginal ? (isLight ? ' ring-1 ring-blue-400' : ' ring-1 ring-amber-400/60') : '';
    return base + ring;
  };

  return (
    <div
      role="group"
      aria-label="Quick transpose"
      className={`flex items-center rounded-lg border p-0.5 shadow-xs ${
        isLight ? 'border-blue-200 bg-blue-50/70' : 'border-neutral-700/80 bg-neutral-900/60'
      }`}
    >
      <button
        type="button"
        onClick={() => onChange(semitones - 1)}
        className={stepButton}
        title="Down one semitone"
        aria-label="Transpose down one semitone"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center justify-center gap-1 min-w-16 h-8 px-2 rounded-md font-mono font-bold transition-colors cursor-pointer ${centreTone}`}
          title="Choose a key"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Current key ${currentKey}${
            isTransposed ? `, ${Math.abs(semitones)} semitone${Math.abs(semitones) === 1 ? '' : 's'} ${semitones > 0 ? 'up' : 'down'}` : ''
          }. Choose a key`}
        >
          <span className="text-sm leading-none" aria-live="polite">
            {currentKey}
          </span>
          {isTransposed && (
            <span className="text-[10px] leading-none opacity-80">{formatOffset(semitones)}</span>
          )}
          <ChevronDown className={`w-3 h-3 opacity-70 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div
            ref={popoverRef}
            role="listbox"
            aria-label="Choose key"
            className={`absolute top-full left-1/2 mt-2 z-30 w-60 rounded-xl border p-2 shadow-2xl ${
              isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-neutral-900 border-neutral-700 text-neutral-300'
            }`}
            style={{ transform: `translateX(calc(-50% + ${shiftX}px))` }}
          >
            <div className="px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-60">
              Transpose to key
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {choices.map((c) => {
                const isCurrent = c.semitones === semitones;
                const isOriginal = c.semitones === 0;
                return (
                  <button
                    key={c.semitones}
                    type="button"
                    role="option"
                    aria-selected={isCurrent}
                    onClick={() => pick(c.semitones)}
                    title={isOriginal ? `Original key (${c.key})` : `${c.key} (${formatOffset(c.semitones)} semitones)`}
                    className={`flex flex-col items-center justify-center gap-0.5 h-11 rounded-lg transition-colors cursor-pointer active:scale-95 ${cellClass(isCurrent, isOriginal)}`}
                  >
                    <span className="text-sm font-bold font-mono leading-none">{c.key}</span>
                    <span className="text-[9px] font-mono leading-none opacity-70">
                      {isOriginal ? 'orig' : formatOffset(c.semitones)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(semitones + 1)}
        className={stepButton}
        title="Up one semitone"
        aria-label="Transpose up one semitone"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default QuickTransposeButton;
