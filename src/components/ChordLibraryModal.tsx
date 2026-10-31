import React, { useState } from 'react';
import { GUITAR_CHORDS, UKULELE_CHORDS } from '../utils/chordDiagrams';
import { ChordDiagramVisualizer } from './ChordDiagramVisualizer';
import { InstrumentType } from '../types/song';
import { X, Search, BookOpen } from 'lucide-react';
import { getThemeStyles } from '../utils/themeStyles';

interface Props {
  onClose: () => void;
  theme?: string;
}

export const ChordLibraryModal: React.FC<Props> = ({ onClose, theme }) => {
  const [instrument, setInstrument] = useState<InstrumentType>('guitar');
  const [query, setQuery] = useState('');
  const [selectedChord, setSelectedChord] = useState<string>('C');
  const t = getThemeStyles(theme);

  // List of all chords available
  const chordKeys = Object.keys(GUITAR_CHORDS);
  const filteredChords = chordKeys.filter((ch) =>
    ch.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div
        className={`flex flex-col w-full max-w-3xl h-[85vh] rounded-2xl border shadow-2xl overflow-hidden animate-scaleIn motion-reduce:animate-none ${t.dialog}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${t.dialogBar}`}>
          <div className="flex items-center gap-2.5">
            <BookOpen className={`w-5 h-5 ${t.accentText}`} />
            <h2 className={`font-bold text-lg tracking-tight ${t.textStrong}`}>Chord Reference Library</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Instrument selector */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs ${t.card}`}>
              {(['guitar', 'ukulele', 'piano'] as InstrumentType[]).map((inst) => (
                <button
                  key={inst}
                  onClick={() => setInstrument(inst)}
                  className={`px-3 py-1 rounded-md font-semibold capitalize transition-colors cursor-pointer ${
                    instrument === inst
                      ? t.segOn
                      : `${t.textMuted} hover:${t.textStrong}`
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${t.iconBtn}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Sidebar list + Detail Diagram */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chords selector column */}
          <div className={`w-48 sm:w-60 border-r flex flex-col ${t.card}`}>
            <div className={`p-3 border-b ${t.popoverDivider}`}>
              <div className="relative">
                <Search className={`absolute left-2.5 top-2.5 w-3.5 h-3.5 ${t.textMuted}`} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter chord..."
                  className={`w-full pl-8 pr-2.5 py-1.5 rounded-lg border text-xs ${t.field} ${t.focus}`}
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
                      ? t.segOn
                      : `${t.textStrong} ${t.rowHover}`
                  }`}
                >
                  <span>{chord}</span>
                  <span className="text-[10px] opacity-60">Play</span>
                </button>
              ))}
            </div>
          </div>

          {/* Diagram display column */}
          <div className={`flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto ${t.page}`}>
            <ChordDiagramVisualizer
              chord={selectedChord}
              instrument={instrument}
              showStrumButton={true}
              theme={theme}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
