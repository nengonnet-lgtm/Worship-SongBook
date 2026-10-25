import React, { useState, useRef } from 'react';
import { Song, AppSettings } from '../types/song';
import {
  convertTextToChordPro,
  convertChordProTo2LineText,
  KEYS
} from '../utils/chordUtils';
import { parseChordPro } from '../utils/chordProParser';
import {
  X,
  Sparkles,
  Save,
  Music,
  ArrowRightLeft,
  ClipboardPaste,
  Check
} from 'lucide-react';

interface Props {
  song: Song | null;
  settings: AppSettings;
  onSave: (song: Song) => void;
  onClose: () => void;
}

export const SongEditorModal: React.FC<Props> = ({
  song,
  settings,
  onSave,
  onClose
}) => {
  const [showMoreMeta, setShowMoreMeta] = useState(false);
  const [title, setTitle] = useState(song ? song.title : 'New Song');
  const [artist, setArtist] = useState(song ? song.artist : '');
  const [key, setKey] = useState(song ? song.key : 'C');
  const [tempo, setTempo] = useState(song ? song.tempo : 120);
  const [timeSignature, setTimeSignature] = useState(song ? song.timeSignature : '4/4');
  const [capo, setCapo] = useState(song ? song.capo : 0);
  const [tagsInput, setTagsInput] = useState(song ? song.tags.join(', ') : 'Worship');
  const [notes, setNotes] = useState(song ? song.notes || '' : '');
  const [chordProContent, setChordProContent] = useState(
    song
      ? song.chordProContent
      : `{c: Verse 1}\n        D     Bm       G \nความรักมั่นคงของพระเจ้า ไม่เคยยั้งหยุด\n\n{c: Chorus}\n        D     Bm       G \nความรักมั่นคงของพระเจ้า ไม่เคยยั้งหยุด`
  );

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInput, setPasteInput] = useState('');
  const [pasteConvertMode, setPasteConvertMode] = useState<'chordpro' | 'raw'>('chordpro');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Quick insertion helper
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = textarea.value;

    const updated = current.substring(0, start) + textToInsert + current.substring(end);
    setChordProContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 0);
  };

  const handleConvertSmart = () => {
    const converted = convertTextToChordPro(chordProContent);
    setChordProContent(converted);
  };

  const handleConvertTo2Line = () => {
    const converted = convertChordProTo2LineText(chordProContent);
    setChordProContent(converted);
  };

  const handleSmartPasteSubmit = () => {
    if (!pasteInput.trim()) return;

    const titleMatch = pasteInput.match(/(?:เพลง|Title|title):\s*([^\n\r]+)/i);
    const artistMatch = pasteInput.match(/(?:ศิลปิน|Artist|artist|by):\s*([^\n\r]+)/i);
    const keyMatch = pasteInput.match(/(?:คีย์|Key|key):\s*([A-G][#b]?m?)/i);
    const tempoMatch = pasteInput.match(/(?:ความเร็ว|Tempo|BPM|bpm):\s*(\d+)/i);

    if (titleMatch && titleMatch[1].trim() && (title === 'New Song' || !title)) {
      setTitle(titleMatch[1].trim());
    }
    if (artistMatch && artistMatch[1].trim() && !artist) {
      setArtist(artistMatch[1].trim());
    }
    if (keyMatch && keyMatch[1].trim()) {
      const detectedKey = keyMatch[1].trim().replace(/m$/i, '');
      if (KEYS.includes(detectedKey)) {
        setKey(detectedKey);
      }
    }
    if (tempoMatch && tempoMatch[1]) {
      setTempo(parseInt(tempoMatch[1], 10) || 120);
    }

    if (pasteConvertMode === 'chordpro') {
      const converted = convertTextToChordPro(pasteInput);
      setChordProContent(converted);
    } else {
      setChordProContent(pasteInput);
    }

    setPasteInput('');
    setShowPasteModal(false);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedSong: Song = {
      id: song ? song.id : `song-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      key,
      originalKey: song ? song.originalKey : key,
      tempo: Number(tempo) || 120,
      timeSignature,
      capo: Number(capo) || 0,
      duration: song ? song.duration : 180,
      tags,
      notes: notes.trim(),
      chordProContent,
      lastModified: Date.now()
    };

    onSave(updatedSong);
  };

  const previewParsed = parseChordPro(chordProContent, 0, key, settings.chordNotation, key);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-5xl h-[92vh] bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-neutral-100">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <Music className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold text-sm sm:text-base tracking-tight truncate">
              {song ? `Edit: ${song.title}` : 'Create New Chord Sheet'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center p-0.5 rounded-lg bg-neutral-800 border border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'editor' ? 'bg-neutral-900 text-amber-400 font-bold shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'split' ? 'bg-neutral-900 text-amber-400 font-bold shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Side by Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === 'preview' ? 'bg-neutral-900 text-amber-400 font-bold shadow-xs' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Song</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Metadata Inputs Bar */}
        <div className="px-6 py-2 border-b border-neutral-800 bg-neutral-950/40 text-xs shrink-0 space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title..."
                className="w-full px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist / Author..."
                className="w-full px-2.5 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-1">
              <span className="text-neutral-400 font-medium">Key:</span>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-400 cursor-pointer font-bold text-amber-400"
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-1">
              <span className="text-neutral-400 font-medium">BPM:</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                className="w-full px-2 py-1 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMoreMeta(!showMoreMeta)}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 text-[11px] whitespace-nowrap cursor-pointer"
              >
                {showMoreMeta ? '▲ ซ่อน' : '▼ เพิ่มเติม'}
              </button>
            </div>
          </div>

          {/* ข้อมูลเสริม (Capo, Tags, Notes) */}
          {showMoreMeta && (
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 pt-2 border-t border-neutral-800/60 animate-fadeIn">
              <div>
                <label className="block text-[10px] text-neutral-400 mb-0.5">Capo</label>
                <input
                  type="number"
                  value={capo}
                  onChange={(e) => setCapo(parseInt(e.target.value, 10))}
                  className="w-full px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-100 font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-neutral-400 mb-0.5">Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-100"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] text-neutral-400 mb-0.5">Performance Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-neutral-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Compact Toolbar */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-neutral-800 bg-neutral-950/70 text-xs shrink-0 gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>วางจาก Word / เว็บ</span>
            </button>

            <button
              type="button"
              onClick={handleConvertSmart}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-[11px] font-semibold cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2 บรรทัด ➔ ChordPro</span>
            </button>

            <button
              type="button"
              onClick={handleConvertTo2Line}
              className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-[11px] font-medium cursor-pointer transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-neutral-400" />
              <span>ChordPro ➔ 2 บรรทัด</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[10px] font-semibold text-neutral-500 uppercase shrink-0">ท่อนเพลง:</span>
            {['{c: Verse 1}', '{c: Chorus}', '{c: Bridge}', '{c: Outro}'].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => insertTextAtCursor(`\n${sec}\n`)}
                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-sky-400 font-mono text-[11px] border border-neutral-700 cursor-pointer shrink-0 transition-colors"
              >
                {sec.replace(/[{}]/g, '')}
              </button>
            ))}
          </div>
        </div>

        {/* Editor & Preview Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* ChordPro Editor Textarea */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div className={`flex flex-col h-full ${activeTab === 'split' ? 'w-1/2 border-r border-neutral-800' : 'w-full'}`}>
              <div className="px-4 py-1.5 text-[11px] font-mono text-neutral-400 bg-neutral-900/90 border-b border-neutral-800 flex justify-between items-center">
                <span>Chord & Lyrics Editor</span>
                <span className="text-[10px] text-neutral-500">รองรับทั้งแบบ 2 บรรทัด และ [Chord]</span>
              </div>

              <textarea
                ref={textareaRef}
                value={chordProContent}
                onChange={(e) => setChordProContent(e.target.value)}
                placeholder={`ตัวอย่างแบบ 2 บรรทัด:\n        D     Bm       G \nความรักมั่นคงของพระเจ้า ไม่เคยยั้งหยุด\n\nหรือพิมพ์แบบ ChordPro:\nความรักมั่น[D]คงของพระ[Bm]เจ้า ไม่เคยยั้ง[G]หยุด`}
                spellCheck={false}
                className="flex-1 w-full p-4 bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-200 resize-none focus:outline-none focus:ring-0"
              />
            </div>
          )}

          {/* Live Preview Panel */}
{/* Live Preview Panel ใน SongEditorModal.tsx */}
{(activeTab === 'preview' || activeTab === 'split') && (
  <div className={`flex flex-col h-full overflow-y-auto p-6 ${
    settings.theme === 'light' ? 'bg-white text-slate-900' : 'bg-neutral-950 text-neutral-100'
  } ${activeTab === 'split' ? 'w-1/2' : 'w-full'}`}>
    <div className="mb-3 pb-2 border-b border-neutral-800">
      <span className="text-[10px] font-semibold uppercase tracking-widest font-mono text-neutral-400">
        Live Stage Preview
      </span>
      <h2 className="text-base font-bold text-neutral-100">{title}</h2>
    </div>

    <div
      className="space-y-6 font-mono text-sm leading-tight"
      style={{
        fontFamily: "'Courier New', Courier, 'JetBrains Mono', monospace",
        letterSpacing: '0px'
      }}
    >
      {previewParsed.sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-3">
          {section.title && (
            <span className="text-xs font-bold font-mono uppercase tracking-wider block text-amber-400">
              {section.title}
            </span>
          )}

          {section.lines.map((line, lIdx) => {
            if (line.type === 'empty') return <div key={lIdx} className="h-3" />;
            if (line.type === 'comment') {
              return (
                <div key={lIdx} className="text-xs italic text-neutral-400">
                  {line.comment}
                </div>
              );
            }

            // คำนวณ Plain Text 2 บรรทัดสำหรับ Preview
            let chordLineStr = '';
            let lyricLineStr = '';
            let currentPos = 0;

            const THAI_NON_SPACING_REGEX = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g;
            const getVisualLen = (str: string) => str.replace(THAI_NON_SPACING_REGEX, '').length;

            line.items?.forEach((item) => {
              const chord = item.chord || '';
              const lyric = item.lyric || '';

              if (chord) {
                const padding = Math.max(0, currentPos - getVisualLen(chordLineStr));
                chordLineStr += ' '.repeat(padding) + chord;
              }

              lyricLineStr += lyric;

              const chordVisLen = chord ? getVisualLen(chord) : 0;
              const lyricVisLen = getVisualLen(lyric);
              currentPos += Math.max(chordVisLen, lyricVisLen);
            });

            return (
              <div key={lIdx} className="font-mono leading-tight select-none mb-3">
                {/* บรรทัดคอร์ด */}
                {chordLineStr.trim() && (
                  <div
                    className="whitespace-pre font-bold block"
                    style={{ color: settings.chordsColor || '#38bdf8' }}
                  >
                    {chordLineStr}
                  </div>
                )}
                {/* บรรทัดเนื้อเพลง */}
                <div className="whitespace-pre block text-neutral-200">
                  {lyricLineStr}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  </div>
)}
        </div>
      </div>

      {/* Smart Paste Modal */}
      {showPasteModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100">
            <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardPaste className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">วางคอร์ดจาก Word หรือ เว็บ (Smart Paste)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <p className="text-xs text-neutral-400 leading-relaxed">
                คัดลอก (Copy) คอร์ดและเนื้อเพลงแบบ 2 บรรทัดจากไฟล์ Word, TXT, หรือเว็บคอร์ดเพลง แล้วนำมาวาง (Paste) ลงในช่องนี้ ระบบจะคำนวณตำแหน่งสระ วรรณยุกต์ และคอร์ดภาษาไทยให้อย่างแม่นยำอัตโนมัติ
              </p>

              <textarea
                value={pasteInput}
                onChange={(e) => setPasteInput(e.target.value)}
                placeholder={`วางข้อความที่นี่ เช่น:\n        D     Bm       G \nความรักมั่นคงของพระเจ้า ไม่เคยยั้งหยุด`}
                rows={9}
                className="w-full p-3.5 rounded-xl bg-neutral-950 border border-neutral-700 font-mono text-xs sm:text-sm text-neutral-200 resize-none focus:outline-none focus:border-sky-400 leading-relaxed"
              />

              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-neutral-400 font-medium">รูปแบบผลลัพธ์:</span>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300">
                    <input
                      type="radio"
                      name="pasteMode"
                      checked={pasteConvertMode === 'chordpro'}
                      onChange={() => setPasteConvertMode('chordpro')}
                      className="accent-sky-400"
                    />
                    <span>แปลงเป็น ChordPro [คอร์ด] (แนะนำ)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-neutral-300 ml-2">
                    <input
                      type="radio"
                      name="pasteMode"
                      checked={pasteConvertMode === 'raw'}
                      onChange={() => setPasteConvertMode('raw')}
                      className="accent-sky-400"
                    />
                    <span>เก็บแบบ 2 บรรทัด</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSmartPasteSubmit}
                disabled={!pasteInput.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs disabled:opacity-40 cursor-pointer shadow-sm transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>แทรกลงในเพลง</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};