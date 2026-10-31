import React from 'react';
import { GUITAR_CHORDS, UKULELE_CHORDS, getChordMidiNotes, playChordSound } from '../utils/chordDiagrams';
import { InstrumentType } from '../types/song';
import { Volume2 } from 'lucide-react';
import { getThemeStyles, ThemeStyles } from '../utils/themeStyles';

interface Props {
  chord: string;
  instrument?: InstrumentType;
  onClose?: () => void;
  showStrumButton?: boolean;
  theme?: string;
}

export const ChordDiagramVisualizer: React.FC<Props> = ({
  chord,
  instrument = 'guitar',
  showStrumButton = true,
  theme
}) => {
  const t = getThemeStyles(theme);

  // Strip slash notes for base diagram lookup if needed
  const baseChord = chord.split('/')[0].trim();
  const guitarData = GUITAR_CHORDS[baseChord] || GUITAR_CHORDS[chord];
  const ukuleleData = UKULELE_CHORDS[baseChord] || UKULELE_CHORDS[chord];

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChordSound(chord);
  };

  return (
    <div className={`flex flex-col items-center p-3.5 rounded-2xl border shadow-xl max-w-xs ${t.dialog}`}>
      <div className={`flex items-center justify-between w-full mb-2 pb-1.5 border-b ${t.popoverDivider}`}>
        <span className={`text-lg font-bold tracking-tight font-mono ${t.accentText}`}>
          {chord}
        </span>
        {showStrumButton && (
          <button
            onClick={handlePlaySound}
            title="Hear chord sound"
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${t.ghostBtn}`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${t.accentText}`} />
            <span>Strum</span>
          </button>
        )}
      </div>

      {instrument === 'guitar' && (
        <div className="flex flex-col items-center">
          {guitarData ? (
            <GuitarDiagram data={guitarData} t={t} />
          ) : (
            <div className={`py-6 text-xs text-center ${t.textMuted}`}>
              Fretboard diagram preview for {chord}
              <button
                onClick={handlePlaySound}
                className={`mt-2 block mx-auto underline ${t.accentText}`}
              >
                Play Audio Strum
              </button>
            </div>
          )}
          <span className={`text-[11px] mt-1 ${t.textMuted}`}>Guitar (E A D G B E)</span>
        </div>
      )}

      {instrument === 'ukulele' && (
        <div className="flex flex-col items-center">
          {ukuleleData ? (
            <UkuleleDiagram data={ukuleleData} t={t} />
          ) : (
            <div className={`py-6 text-xs text-center ${t.textMuted}`}>
              Ukulele diagram for {chord}
            </div>
          )}
          <span className={`text-[11px] mt-1 ${t.textMuted}`}>Ukulele (G C E A)</span>
        </div>
      )}

      {instrument === 'piano' && (
        <div className="flex flex-col items-center">
          <PianoDiagram chord={chord} t={t} />
          <span className={`text-[11px] mt-1 ${t.textMuted}`}>Piano Keys</span>
        </div>
      )}
    </div>
  );
};

// SVG Guitar Fretboard
const GuitarDiagram: React.FC<{ data: typeof GUITAR_CHORDS[string]; t: ThemeStyles }> = ({ data, t }) => {
  const numStrings = 6;
  const numFrets = 4;
  const stringSpacing = 16;
  const fretSpacing = 20;
  const startX = 20;
  const startY = 22;
  const width = startX * 2 + (numStrings - 1) * stringSpacing;
  const height = startY + numFrets * fretSpacing + 12;

  const frets = data.frets; // 6 strings
  const nutColor = t.isLight ? '#1F1C17' : '#E8EEF8';
  const fretColor = t.isLight ? '#D8D1C2' : '#525252';
  const stringColor = t.isLight ? '#6A6458' : '#737373';
  const dotColor = t.signalHex;
  const dotTextColor = t.isLight ? '#FFFFFF' : '#06121F';

  return (
    <svg width={width} height={height} className="select-none overflow-visible">
      {/* Nut (Thick line on top if in 1st position) */}
      <line
        x1={startX}
        y1={startY}
        x2={startX + (numStrings - 1) * stringSpacing}
        y2={startY}
        stroke={nutColor}
        strokeWidth="3.5"
      />

      {/* Frets */}
      {Array.from({ length: numFrets + 1 }).map((_, f) => (
        <line
          key={`fret-${f}`}
          x1={startX}
          y1={startY + f * fretSpacing}
          x2={startX + (numStrings - 1) * stringSpacing}
          y2={startY + f * fretSpacing}
          stroke={fretColor}
          strokeWidth="1.2"
        />
      ))}

      {/* Strings */}
      {Array.from({ length: numStrings }).map((_, s) => (
        <line
          key={`string-${s}`}
          x1={startX + s * stringSpacing}
          y1={startY}
          x2={startX + s * stringSpacing}
          y2={startY + numFrets * fretSpacing}
          stroke={stringColor}
          strokeWidth={1 + (numStrings - s) * 0.25}
        />
      ))}

      {/* String status markers above nut (O for open, X for mute) */}
      {frets.map((fret, stringIdx) => {
        const x = startX + stringIdx * stringSpacing;
        if (fret === -1) {
          // X marker
          return (
            <text
              key={`marker-${stringIdx}`}
              x={x}
              y={startY - 6}
              textAnchor="middle"
              className={`text-[10px] font-mono font-bold ${t.isLight ? 'fill-neutral-600' : 'fill-neutral-400'}`}
            >
              ×
            </text>
          );
        } else if (fret === 0) {
          // O marker
          return (
            <circle
              key={`marker-${stringIdx}`}
              cx={x}
              cy={startY - 8}
              r="3.5"
              fill="none"
              stroke={t.isLight ? '#6A6458' : '#A3A3A3'}
              strokeWidth="1.5"
            />
          );
        }
        return null;
      })}

      {/* Barre indicator */}
      {data.barres && data.barres.length > 0 && (
        <rect
          x={startX}
          y={startY + (data.barres[0] - 0.5) * fretSpacing - 4}
          width={(numStrings - 1) * stringSpacing}
          height="8"
          rx="4"
          fill={dotColor}
          opacity="0.85"
        />
      )}

      {/* Finger dots on frets */}
      {frets.map((fret, stringIdx) => {
        if (fret > 0 && fret <= numFrets) {
          const x = startX + stringIdx * stringSpacing;
          const y = startY + (fret - 0.5) * fretSpacing;
          const finger = data.fingers ? data.fingers[stringIdx] : null;

          return (
            <g key={`dot-${stringIdx}`}>
              <circle cx={x} cy={y} r="5.5" fill={dotColor} />
              {finger && finger > 0 && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  fill={dotTextColor}
                  className="text-[9px] font-bold select-none pointer-events-none"
                >
                  {finger}
                </text>
              )}
            </g>
          );
        }
        return null;
      })}
    </svg>
  );
};

// SVG Ukulele Diagram (4 strings)
const UkuleleDiagram: React.FC<{ data: typeof UKULELE_CHORDS[string]; t: ThemeStyles }> = ({ data, t }) => {
  const numStrings = 4;
  const numFrets = 4;
  const stringSpacing = 16;
  const fretSpacing = 20;
  const startX = 20;
  const startY = 22;
  const width = startX * 2 + (numStrings - 1) * stringSpacing;
  const height = startY + numFrets * fretSpacing + 12;

  const frets = data.frets;
  const nutColor = t.isLight ? '#1F1C17' : '#E8EEF8';
  const fretColor = t.isLight ? '#D8D1C2' : '#525252';
  const stringColor = t.isLight ? '#6A6458' : '#737373';
  const dotColor = t.signalHex;

  return (
    <svg width={width} height={height} className="select-none overflow-visible">
      <line
        x1={startX}
        y1={startY}
        x2={startX + (numStrings - 1) * stringSpacing}
        y2={startY}
        stroke={nutColor}
        strokeWidth="3.5"
      />

      {Array.from({ length: numFrets + 1 }).map((_, f) => (
        <line
          key={`fret-${f}`}
          x1={startX}
          y1={startY + f * fretSpacing}
          x2={startX + (numStrings - 1) * stringSpacing}
          y2={startY + f * fretSpacing}
          stroke={fretColor}
          strokeWidth="1.2"
        />
      ))}

      {Array.from({ length: numStrings }).map((_, s) => (
        <line
          key={`string-${s}`}
          x1={startX + s * stringSpacing}
          y1={startY}
          x2={startX + s * stringSpacing}
          y2={startY + numFrets * fretSpacing}
          stroke={stringColor}
          strokeWidth="1.5"
        />
      ))}

      {frets.map((fret, stringIdx) => {
        const x = startX + stringIdx * stringSpacing;
        if (fret === 0) {
          return (
            <circle
              key={`marker-${stringIdx}`}
              cx={x}
              cy={startY - 8}
              r="3.5"
              fill="none"
              stroke={t.isLight ? '#6A6458' : '#A3A3A3'}
              strokeWidth="1.5"
            />
          );
        }
        return null;
      })}

      {frets.map((fret, stringIdx) => {
        if (fret > 0 && fret <= numFrets) {
          const x = startX + stringIdx * stringSpacing;
          const y = startY + (fret - 0.5) * fretSpacing;
          return (
            <circle key={`dot-${stringIdx}`} cx={x} cy={y} r="5" fill={dotColor} />
          );
        }
        return null;
      })}
    </svg>
  );
};

// SVG Piano Keyboard Diagram
const PianoDiagram: React.FC<{ chord: string; t: ThemeStyles }> = ({ chord, t }) => {
  const midiNotes = getChordMidiNotes(chord);
  // Pitch classes (0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B)
  const activePitchClasses = new Set(midiNotes.map((m) => m % 12));

  // 1 Octave + 3 notes (C to E)
  const whiteKeys = [
    { note: 0, label: 'C' },
    { note: 2, label: 'D' },
    { note: 4, label: 'E' },
    { note: 5, label: 'F' },
    { note: 7, label: 'G' },
    { note: 9, label: 'A' },
    { note: 11, label: 'B' },
    { note: 0, label: 'C' }
  ];

  const blackKeys = [
    { note: 1, pos: 0.7 }, // C#
    { note: 3, pos: 1.7 }, // D#
    { note: 6, pos: 3.7 }, // F#
    { note: 8, pos: 4.7 }, // G#
    { note: 10, pos: 5.7 } // A#
  ];

  const keyWidth = 14;
  const keyHeight = 52;
  const blackWidth = 9;
  const blackHeight = 32;

  const inactiveWhiteFill = t.isLight ? '#FFFFFF' : '#FAFAFA';
  const whiteStroke = t.isLight ? '#D8D1C2' : '#404040';
  const inactiveBlackFill = t.isLight ? '#262320' : '#171717';
  const blackStroke = t.isLight ? '#1A1815' : '#0A0A0A';

  return (
    <svg
      width={whiteKeys.length * keyWidth + 2}
      height={keyHeight + 4}
      className="select-none overflow-visible my-2"
    >
      {/* White Keys */}
      {whiteKeys.map((k, i) => {
        const isActive = activePitchClasses.has(k.note);
        return (
          <rect
            key={`white-${i}`}
            x={i * keyWidth + 1}
            y={1}
            width={keyWidth - 1}
            height={keyHeight}
            fill={isActive ? t.signalHex : inactiveWhiteFill}
            stroke={whiteStroke}
            strokeWidth="1"
            rx="2"
          />
        );
      })}

      {/* Black Keys */}
      {blackKeys.map((k, i) => {
        const isActive = activePitchClasses.has(k.note);
        return (
          <rect
            key={`black-${i}`}
            x={k.pos * keyWidth + 1}
            y={1}
            width={blackWidth}
            height={blackHeight}
            fill={isActive ? t.signalHex : inactiveBlackFill}
            stroke={blackStroke}
            strokeWidth="1"
            rx="1"
          />
        );
      })}
    </svg>
  );
};
