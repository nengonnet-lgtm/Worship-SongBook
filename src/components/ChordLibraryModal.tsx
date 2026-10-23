import React, { useState } from 'react';
import { GUITAR_CHORDS, UKULELE_CHORDS, playChordSound } from '../utils/chordDiagrams';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
import { InstrumentType } from '../types/song';
import { X, Search, Volume2, BookOpen } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const ChordLibraryModal: React.FC<Props> = ({ onClose }) => {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [query, setQuery] = useState('');
  const [selectedChord, setSelectedChord] = useState<string>('C');

  // List of all chords available
  const chordKeys = Object.keys(GUITAR_CHORDS);
  const filteredChords = chordKeys.filter((ch) =>
    ch.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
      <div className="flex flex-col w-full max-w-3xl h-[85vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-lg tracking-tight">Chord Reference Library</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Instrument selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs">
              {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                    instrument === inst
                      ? 'bg-amber-400 text-neutral-950 shadow-xs'
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar list + Detail Diagram */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chords selector column */}
          <div className="w-48 sm:w-60 border-r border-neutral-800 flex flex-col bg-neutral-950/40">
            <div className="p-3 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter chord..."
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredChords.map((chord) => (
                <button
                  key={chord}
                  onClick={() => setSelectedChord(chord)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-between cursor-pointer ${
                    selectedChord === chord
                      ? 'bg-amber-400 text-neutral-950 shadow-sm'
                      : 'text-neutral-300 hover:bg-neutral-800'
                  }`}
                >
                  <span>{chord}</span>
                  <span className="text-[10px] opacity-60">Play</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagram display column */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto bg-neutral-950">
            <ChordDiagramVisualizer
              chord={selectedChord}
              instrument={instrument}
              showStrumButton={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
