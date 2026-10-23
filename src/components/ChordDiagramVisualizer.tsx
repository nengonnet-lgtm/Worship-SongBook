import React from 'react';
import { GUITAR_CHORDS, UKULELE_CHORDS, getChordMidiNotes, playChordSound } from '../utils/chordDiagrams';
import { InstrumentType } from '../types/song';
import { Volume2 } from 'lucide-react';

interface Props {
  chord: string;
  instrument?: InstrumentType;
  onClose?: () => void;
  showStrumButton?: boolean;
}

export const ChordDiagramVisualizer: React.FC<Props> = ({
  chord,
  instrument = 'guitar',
  showStrumButton = true
}) => {
  // Strip slash notes for base diagram lookup if needed
  const baseChord = chord.split('/')[0].trim();
  const guitarData = GUITAR_CHORDS[baseChord] || GUITAR_CHORDS[chord];
  const ukuleleData = UKULELE_CHORDS[baseChord] || UKULELE_CHORDS[chord];

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    playChordSound(chord);
  };

  return (
    <div className="flex flex-col items-center p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-xl max-w-xs">
      <div className="flex items-center justify-between w-full mb-2 pb-1 border-b border-neutral-800">
        <span className="text-lg font-bold tracking-tight text-amber-400 font-mono">
          {chord}
        </span>
        {showStrumButton && (
          <button
            onClick={handlePlaySound}
            title="Hear chord sound"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Strum</span>
          </button>
        )}
      </div>

      {instrument === 'guitar' && (
        <div className="flex flex-col items-center">
          {guitarData ? (
            <GuitarDiagram data={guitarData} />
          ) : (
            <div className="py-6 text-xs text-neutral-400 text-center">
              Fretboard diagram preview for {chord}
              <button
                onClick={handlePlaySound}
                className="mt-2 block mx-auto text-amber-400 underline"
              >
                Play Audio Strum
              </button>
            </div>
          )}
          <span className="text-[11px] text-neutral-400 mt-1">Guitar (E A D G B E)</span>
        </div>
      )}

      {instrument === 'ukulele' && (
        <div className="flex flex-col items-center">
          {ukuleleData ? (
            <UkuleleDiagram data={ukuleleData} />
          ) : (
            <div className="py-6 text-xs text-neutral-400 text-center">
              Ukulele diagram for {chord}
            </div>
          )}
          <span className="text-[11px] text-neutral-400 mt-1">Ukulele (G C E A)</span>
        </div>
      )}

      {instrument === 'piano' && (
        <div className="flex flex-col items-center">
          <PianoDiagram chord={chord} />
          <span className="text-[11px] text-neutral-400 mt-1">Piano Keys</span>
        </div>
      )}
    </div>
  );
};

// SVG Guitar Fretboard
const GuitarDiagram: React.FC<{ data: typeof GUITAR_CHORDS[string] }> = ({ data }) => {
  const numStrings = 6;
  const numFrets = 4;
  const stringSpacing = 16;
  const fretSpacing = 20;
  const startX = 20;
  const startY = 22;
  const width = startX * 2 + (numStrings - 1) * stringSpacing;
  const height = startY + numFrets * fretSpacing + 12;

  const frets = data.frets; // 6 strings

  return (
    <svg width={width} height={height} className="select-none overflow-visible">
      {/* Nut (Thick line on top if in 1st position) */}
      <line
        x1={startX}
        y1={startY}
        x2={startX + (numStrings - 1) * stringSpacing}
        y2={startY}
        stroke="#e5e5e5"
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
          stroke="#525252"
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
          stroke="#737373"
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
              className="text-[10px] font-mono fill-neutral-400 font-bold"
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
              stroke="#a3a3a3"
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
          fill="#38bdf8"
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
              <circle cx={x} cy={y} r="5.5" fill="#38bdf8" />
              {finger && finger > 0 && (
                <text
                  x={x}
                  y={y + 3}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-neutral-950 select-none pointer-events-none"
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
const UkuleleDiagram: React.FC<{ data: typeof UKULELE_CHORDS[string] }> = ({ data }) => {
  const numStrings = 4;
  const numFrets = 4;
  const stringSpacing = 16;
  const fretSpacing = 20;
  const startX = 20;
  const startY = 22;
  const width = startX * 2 + (numStrings - 1) * stringSpacing;
  const height = startY + numFrets * fretSpacing + 12;

  const frets = data.frets;

  return (
    <svg width={width} height={height} className="select-none overflow-visible">
      <line
        x1={startX}
        y1={startY}
        x2={startX + (numStrings - 1) * stringSpacing}
        y2={startY}
        stroke="#e5e5e5"
        strokeWidth="3.5"
      />

      {Array.from({ length: numFrets + 1 }).map((_, f) => (
        <line
          key={`fret-${f}`}
          x1={startX}
          y1={startY + f * fretSpacing}
          x2={startX + (numStrings - 1) * stringSpacing}
          y2={startY + f * fretSpacing}
          stroke="#525252"
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
          stroke="#737373"
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
              stroke="#a3a3a3"
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
            <circle key={`dot-${stringIdx}`} cx={x} cy={y} r="5" fill="#38bdf8" />
          );
        }
        return null;
      })}
    </svg>
  );
};

// SVG Piano Keyboard Diagram
const PianoDiagram: React.FC<{ chord: string }> = ({ chord }) => {
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
            fill={isActive ? '#38bdf8' : '#fafafa'}
            stroke="#404040"
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
            fill={isActive ? '#38bdf8' : '#171717'}
            stroke="#0a0a0a"
            strokeWidth="1"
            rx="1"
          />
        );
      })}
    </svg>
  );
};
