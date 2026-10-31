import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Song, AppSettings } from '../types/song';
import {
  convertTextToChordPro,
  convertChordProTo2LineText,
  KEYS
} from '../utils/chordUtils';
import { parseChordPro } from '../utils/chordProParser';
import {
  formatChordPro,
  detectChordProStats,
  extractMetadataFromChordPro,
  syncMetadataToChordPro
} from '../utils/chordProFormatter';
import { ChordHelperSidebar } from './ChordHelperSidebar';
import { ChordLine } from './ChordLine';
import { getThemeStyles } from '../utils/themeStyles';
import './chordSheetFont.css';
import {
  X,
  Sparkles,
  Save,
  Music,
  ArrowRightLeft,
  Wand2,
  SlidersHorizontal,
  ChevronDown,
  CheckCheck,
  AlignLeft,
  Layers,
  RefreshCw,
  FileCode2
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
  const t = getThemeStyles(settings.theme);
  const [showMoreMeta, setShowMoreMeta] = useState(false);
  const [title, setTitle] = useState(song ? song.title : '');
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
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [formatFeedback, setFormatFeedback] = useState<{ text: string; type: 'success' | 'info' } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // สถานะการยุบ/ขยายแถบตัวช่วยแทรกคอร์ดด้านซ้ายมือ (Default: ขยายบนจอใหญ่)
  const [isChordSidebarCollapsed, setIsChordSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('songbook_chord_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleChordSidebar = () => {
    setIsChordSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('songbook_chord_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // รวบรวมคอร์ดที่ปรากฏในเนื้อเพลงปัจจุบันแบบ Reactive
  const usedChords = useMemo(() => {
    const matches = chordProContent.match(/\[([A-G][a-zA-Z0-9#b/]*?)\]/g) || [];
    const set = new Set<string>();
    matches.forEach((m) => {
      const c = m.slice(1, -1).trim();
      if (c) set.add(c);
    });
    return Array.from(set);
  }, [chordProContent]);

  // ตัวช่วยแทรกคอร์ดจากแถบข้าง
  const handleInsertChordFromSidebar = (chordOrText: string) => {
    const toInsert =
      chordOrText.startsWith('[') ||
      chordOrText.startsWith('{') ||
      chordOrText.startsWith(' ') ||
      chordOrText.startsWith('\n')
        ? chordOrText
        : `[${chordOrText}]`;

    insertTextAtCursor(toInsert);
  };

  // Auto clear format feedback after 4.5 seconds
  useEffect(() => {
    if (!formatFeedback) return;
    const timer = setTimeout(() => {
      setFormatFeedback(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [formatFeedback]);

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

  const handleAutoFormatAll = (includeHeaders = false) => {
    const formatted = formatChordPro(chordProContent, {
      standardizeSections: true,
      normalizeChordBrackets: true,
      standardizeChordCasing: true,
      cleanSpacing: true,
      includeHeaders,
      title,
      artist,
      key,
      tempo
    });
    setChordProContent(formatted);
    const stats = detectChordProStats(formatted);
    setFormatFeedback({
      text: `จัดรูปแบบ ChordPro เรียบร้อยแล้ว ✨ (ตรวจพบ ${stats.chordCount} คอร์ด, ${stats.sectionCount} ท่อนเพลง)`,
      type: 'success'
    });
    setShowFormatDropdown(false);
  };

  const handleStandardizeSectionsOnly = () => {
    const formatted = formatChordPro(chordProContent, {
      standardizeSections: true,
      normalizeChordBrackets: false,
      standardizeChordCasing: false,
      cleanSpacing: true
    });
    setChordProContent(formatted);
    const stats = detectChordProStats(formatted);
    setFormatFeedback({
      text: `จัดระเบียบหัวข้อท่อน {c: ...} เรียบร้อย (${stats.sectionCount} ท่อน)`,
      type: 'success'
    });
    setShowFormatDropdown(false);
  };

  const handleCleanSpacingOnly = () => {
    const formatted = formatChordPro(chordProContent, {
      standardizeSections: false,
      normalizeChordBrackets: false,
      standardizeChordCasing: false,
      cleanSpacing: true
    });
    setChordProContent(formatted);
    setFormatFeedback({
      text: `จัดระเบียบการเว้นบรรทัดและช่องว่างเรียบร้อยแล้ว`,
      type: 'success'
    });
    setShowFormatDropdown(false);
  };

  const handleSyncMetaHeaders = () => {
    const synced = syncMetadataToChordPro(chordProContent, {
      title,
      artist,
      key,
      tempo
    });
    setChordProContent(synced);
    setFormatFeedback({
      text: `แทรก/อัปเดตแท็กหัวเพลง {title, artist, key, tempo} เรียบร้อยแล้ว`,
      type: 'success'
    });
    setShowFormatDropdown(false);
  };

  const handleSyncFromChordProToFields = () => {
    const extracted = extractMetadataFromChordPro(chordProContent);
    let updatedCount = 0;
    if (extracted.title) { setTitle(extracted.title); updatedCount++; }
    if (extracted.artist) { setArtist(extracted.artist); updatedCount++; }
    if (extracted.key && KEYS.includes(extracted.key)) { setKey(extracted.key); updatedCount++; }
    if (extracted.tempo) { setTempo(extracted.tempo); updatedCount++; }

    if (updatedCount > 0) {
      setFormatFeedback({
        text: `ดึงข้อมูล ${updatedCount} รายการจาก ChordPro เข้าแบบฟอร์มเรียบร้อยแล้ว`,
        type: 'success'
      });
    } else {
      setFormatFeedback({
        text: `ไม่พบแท็กหัวเพลง {title}, {key} ในเนื้อเพลง`,
        type: 'info'
      });
    }
    setShowFormatDropdown(false);
  };

  const handleConvertSmart = () => {
    const converted = convertTextToChordPro(chordProContent);
    setChordProContent(converted);
    const stats = detectChordProStats(converted);
    setFormatFeedback({
      text: `แปลงแบบ 2 บรรทัด ➔ ChordPro เรียบร้อย (${stats.chordCount} คอร์ด)`,
      type: 'success'
    });
    setShowFormatDropdown(false);
  };

  const handleConvertTo2Line = () => {
    const converted = convertChordProTo2LineText(chordProContent);
    setChordProContent(converted);
    setFormatFeedback({
      text: `แปลง ChordPro ➔ แบบ 2 บรรทัด เรียบร้อยแล้ว`,
      type: 'success'
    });
    setShowFormatDropdown(false);
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
      <div className={`flex flex-col w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl overflow-hidden border ${t.dialog}`}>
        {/* Top Bar */}
        <div className={`flex items-center justify-between px-6 py-2.5 border-b shrink-0 ${t.dialogBar}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <Music className="w-4 h-4 shrink-0" style={{ color: t.signalHex }} />
            <span className={`font-bold text-sm sm:text-base tracking-tight truncate ${t.textStrong}`}>
              {song ? `Edit: ${song.title}` : 'Create New Chord Sheet'}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`hidden sm:flex items-center p-0.5 rounded-lg border text-xs ${t.dialog}`}>
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer border ${
                  activeTab === 'editor' ? t.segOn : t.segOff
                }`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer border ${
                  activeTab === 'split' ? t.segOn : t.segOff
                }`}
              >
                Side by Side
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer border ${
                  activeTab === 'preview' ? t.segOn : t.segOff
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${t.accentBtn}`}
            >
              <Save className="w-4 h-4" />
              <span>Save Song</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg cursor-pointer transition-colors ${t.iconBtn}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 1. Metadata Inputs Bar */}
        <div className={`px-6 py-2 border-b text-xs shrink-0 space-y-2 ${t.dialogBar}`}>
          <div className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center">
            <div className="sm:col-span-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song Title..."
                className={`w-full px-2.5 py-1 rounded-lg border focus:outline-none ${t.field}`}
              />
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist / Author..."
                className={`w-full px-2.5 py-1 rounded-lg border focus:outline-none ${t.field}`}
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-1">
              <span className={`font-medium ${t.textMuted}`}>Key:</span>
              <select
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className={`w-full px-2 py-1 rounded-lg border focus:outline-none cursor-pointer font-bold ${t.field}`}
                style={{ color: t.signalHex }}
              >
                {KEYS.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-1">
              <span className={`font-medium ${t.textMuted}`}>BPM:</span>
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
                className={`w-full px-2 py-1 rounded-lg border focus:outline-none font-mono ${t.field}`}
              />
            </div>

            <div className="sm:col-span-1 flex justify-end">
              <button
                type="button"
                onClick={() => setShowMoreMeta(!showMoreMeta)}
                className={`px-2 py-1 rounded border text-[11px] whitespace-nowrap cursor-pointer ${t.ghostBtn}`}
              >
                {showMoreMeta ? '▲ ซ่อน' : '▼ เพิ่มเติม'}
              </button>
            </div>
          </div>

          {/* ข้อมูลเสริม (Capo, Tags, Notes) */}
          {showMoreMeta && (
            <div className={`grid grid-cols-1 sm:grid-cols-6 gap-2 pt-2 border-t animate-fadeIn ${t.popoverDivider}`}>
              <div>
                <label className={`block text-[10px] mb-0.5 ${t.textMuted}`}>Capo</label>
                <input
                  type="number"
                  value={capo}
                  onChange={(e) => setCapo(parseInt(e.target.value, 10))}
                  className={`w-full px-2 py-1 rounded border font-mono ${t.field}`}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-[10px] mb-0.5 ${t.textMuted}`}>Tags</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className={`w-full px-2 py-1 rounded border ${t.field}`}
                />
              </div>
              <div className="sm:col-span-3">
                <label className={`block text-[10px] mb-0.5 ${t.textMuted}`}>Performance Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-2 py-1 rounded border ${t.field}`}
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. Compact Toolbar with ChordPro Formatting */}
        <div className={`relative px-6 py-1.5 border-b text-xs shrink-0 ${t.dialogBar}`}>
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0">
              {/* ปุ่มเปิด/ปิด แถบคอร์ดด้านซ้าย */}
              <button
                type="button"
                onClick={toggleChordSidebar}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                  !isChordSidebarCollapsed
                    ? t.segOn
                    : t.ghostBtn
                }`}
                title={isChordSidebarCollapsed ? 'ขยายแถบตัวช่วยแทรกคอร์ดด้านซ้าย' : 'ยุบแถบตัวช่วยแทรกคอร์ดด้านซ้าย'}
              >
                <Music className="w-3.5 h-3.5" style={{ color: !isChordSidebarCollapsed ? undefined : t.signalHex }} />
                <span>{isChordSidebarCollapsed ? 'แถบคอร์ด ◀' : 'ซ่อนคอร์ด'}</span>
              </button>

              {/* ปุ่มหลัก: จัดรูปแบบ ChordPro */}
              <div className="flex items-center rounded-lg border p-0.5 shadow-xs" style={{ borderColor: `${t.signalHex}66` }}>
                <button
                  type="button"
                  onClick={() => handleAutoFormatAll(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] transition-colors cursor-pointer ${t.accentBtn}`}
                  title="จัดรูปแบบ ChordPro อัตโนมัติ (แก้ไขวงเล็บคอร์ด, หัวข้อท่อน, ตัวพิมพ์คอร์ด และสระไทย)"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>จัดรูปแบบ ChordPro</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFormatDropdown(!showFormatDropdown)}
                  className={`px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${t.iconBtn}`}
                  title="ตัวเลือกการจัดรูปแบบเพิ่มเติม"
                >
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFormatDropdown ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* ปุ่มสลับ 2 บรรทัด */}
              <button
                type="button"
                onClick={handleConvertTo2Line}
                className={`hidden md:flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium cursor-pointer transition-colors ${t.ghostBtn}`}
                title="แปลง ChordPro ให้อยู่ในรูปคอร์ดลอยบนเนื้อเพลง"
              >
                <ArrowRightLeft className={`w-3.5 h-3.5 ${t.textMuted}`} />
                <span>➔ 2 บรรทัด</span>
              </button>
            </div>

            {/* Quick Section Headers and Bracket Insert */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-semibold uppercase ${t.textMuted}`}>ท่อน:</span>
              {['{c: Intro}', '{c: Verse 1}', '{c: Verse 2}', '{c: Chorus}', '{c: Bridge}', '{c: Pre-Chorus}', '{c: Outro}'].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => insertTextAtCursor(`\n${sec}\n`)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer shrink-0 transition-colors ${t.ghostBtn}`}
                  style={{ color: t.signalHex }}
                  title={`แทรก ${sec}`}
                >
                  {sec.replace(/[{c:\s}]/g, '')}
                </button>
              ))}

              <button
                type="button"
                onClick={() => insertTextAtCursor('[]')}
                className={`px-2 py-0.5 rounded font-mono text-[11px] border cursor-pointer shrink-0 transition-colors ${t.ghostBtn}`}
                style={{ color: t.signalHex }}
                title="แทรกวงเล็บคอร์ด []"
              >
                [คอร์ด]
              </button>
            </div>
          </div>

          {/* เมนูตัวเลือกการจัดรูปแบบแบบ Dropdown */}
          {showFormatDropdown && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowFormatDropdown(false)}
              />
              <div className={`absolute left-6 top-full mt-1.5 z-50 w-80 rounded-xl shadow-2xl p-2 space-y-1 animate-fadeIn border ${t.popover}`}>
                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${t.textMuted} ${t.popoverDivider}`}>
                  เครื่องมือจัดรูปแบบ ChordPro
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoFormatAll(false)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer group ${t.popoverItem}`}
                >
                  <Wand2 className="w-4 h-4 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" style={{ color: t.signalHex }} />
                  <div>
                    <div className="font-semibold text-xs" style={{ color: t.signalHex }}>จัดรูปแบบทั้งหมดอัตโนมัติ (แนะนำ)</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>ซ่อมแซมวงเล็บ [C], หัวข้อท่อน {'{c:...}'}, ตัวพิมพ์คอร์ด และสระไทย</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleAutoFormatAll(true)}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${t.popoverItem}`}
                >
                  <FileCode2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-semibold text-xs ${t.textStrong}`}>จัดรูปแบบ + ใส่ข้อมูลหัวเพลง</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>จัดรูปแบบพร้อมใส่แท็ก {'{title}'}, {'{artist}'}, {'{key}'}, {'{tempo}'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleStandardizeSectionsOnly}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${t.popoverItem}`}
                >
                  <Layers className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-semibold text-xs ${t.textStrong}`}>แปลงหัวข้อท่อนเป็น {'{c: ...}'}</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>แปลง [Intro], Verse 1:, [Chorus] ให้อยู่ในมาตรฐาน {'{c: ...}'}</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCleanSpacingOnly}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${t.popoverItem}`}
                >
                  <AlignLeft className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-semibold text-xs ${t.textStrong}`}>จัดระเบียบการเว้นบรรทัด</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>ลบบรรทัดว่างส่วนเกินและเว้นวรรคหน้าท่อนเพลงอย่างเป็นระเบียบ</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSyncFromChordProToFields}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${t.popoverItem}`}
                >
                  <RefreshCw className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-semibold text-xs ${t.textStrong}`}>ดึงข้อมูลจาก ChordPro เข้าแบบฟอร์ม</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>สแกนหา {'{title}'}, {'{artist}'}, {'{key}'} ในเนื้อเพลงมาใส่ช่องกรอก</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSyncMetaHeaders}
                  className={`w-full flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${t.popoverItem}`}
                >
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <div className={`font-semibold text-xs ${t.textStrong}`}>ซิงค์แบบฟอร์มเข้าเนื้อเพลง</div>
                    <div className={`text-[10px] leading-tight ${t.textMuted}`}>นำ Title, Key, BPM ไปแทรกหรืออัปเดตเป็นแท็กหัวเพลง</div>
                  </div>
                </button>

                <div className={`pt-1 border-t flex items-center justify-between gap-1 ${t.popoverDivider}`}>
                  <button
                    type="button"
                    onClick={handleConvertSmart}
                    className={`flex-1 py-1 px-2 rounded border text-[10px] font-medium text-center cursor-pointer ${t.ghostBtn}`}
                  >
                    2 บรรทัด ➔ ChordPro
                  </button>
                  <button
                    type="button"
                    onClick={handleConvertTo2Line}
                    className={`flex-1 py-1 px-2 rounded border text-[10px] font-medium text-center cursor-pointer ${t.ghostBtn}`}
                  >
                    ChordPro ➔ 2 บรรทัด
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Format Feedback Banner */}
        {formatFeedback && (
          <div
            className="flex items-center justify-between px-6 py-1.5 border-b text-xs shrink-0 animate-fadeIn"
            style={{
              backgroundColor: `${t.signalHex}18`,
              borderBottomColor: `${t.signalHex}40`,
              color: t.signalHex
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <CheckCheck className="w-4 h-4 shrink-0" />
              <span className="font-medium truncate">{formatFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormatFeedback(null)}
              className="ml-2 text-xs font-bold cursor-pointer hover:opacity-80"
            >
              ✕
            </button>
          </div>
        )}

        {/* Editor & Preview Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden relative">
          {/* แถบตัวช่วยแทรกคอร์ดด้านซ้ายมือ (Collapsible Chord Sidebar) */}
          <ChordHelperSidebar
            currentKey={key}
            isCollapsed={isChordSidebarCollapsed}
            onToggleCollapse={toggleChordSidebar}
            onInsertChord={handleInsertChordFromSidebar}
            usedChords={usedChords}
            theme={settings.theme}
          />

          {/* ChordPro Editor Textarea */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div className={`flex flex-col h-full min-w-0 ${activeTab === 'split' ? 'flex-1 border-r' : 'flex-1'} ${t.popoverDivider}`}>
              <div className={`px-4 py-1.5 text-[11px] font-mono border-b flex justify-between items-center ${t.dialogBar} ${t.textMuted}`}>
                <span>Chord & Lyrics Editor</span>
                <span className="text-[10px] opacity-75">รองรับทั้งแบบ 2 บรรทัด และ [Chord]</span>
              </div>

              <textarea
                ref={textareaRef}
                value={chordProContent}
                onChange={(e) => setChordProContent(e.target.value)}
                placeholder={`ตัวอย่างแบบ 2 บรรทัด:\n        D     Bm       G \nความรักมั่นคงของพระเจ้า ไม่เคยยั้งหยุด\n\nหรือพิมพ์แบบ ChordPro:\nความรักมั่น[D]คงของพระ[Bm]เจ้า ไม่เคยยั้ง[G]หยุด`}
                spellCheck={false}
                className={`flex-1 w-full p-4 chord-sheet-font text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 ${t.page}`}
              />
            </div>
          )}

          {/* Live Preview Panel */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div className={`flex flex-col h-full min-w-0 overflow-y-auto p-6 ${t.page} ${activeTab === 'split' ? 'flex-1' : 'flex-1'}`}>
              <div className={`mb-3 pb-2 border-b ${t.popoverDivider}`}>
                <span className={`text-[10px] font-semibold uppercase tracking-widest font-mono ${t.textMuted}`}>
                  Live Stage Preview
                </span>
                <h2 className={`text-base font-bold ${t.textStrong}`}>{title}</h2>
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
                      <span
                        className="text-xs font-bold font-mono uppercase tracking-wider block"
                        style={{ color: settings.chordsColor || t.signalHex }}
                      >
                        {section.title}
                      </span>
                    )}

                    {section.lines.map((line, lIdx) => {
                      if (line.type === 'empty') return <div key={lIdx} className="h-3" />;
                      if (line.type === 'comment') {
                        return (
                          <div key={lIdx} className={`text-xs italic ${t.textMuted}`}>
                            {line.comment}
                          </div>
                        );
                      }

                      // แสดงคอร์ดผูกกับตำแหน่งเนื้อร้องโดยตรง (ไม่ขึ้นกับความกว้างฟอนต์ ตรงกันทุกอุปกรณ์)
                      const items = line.items ?? [];

                      return (
                        <div key={lIdx} className="mb-3">
                          <ChordLine
                            items={items}
                            chordColor={settings.chordsColor || t.signalHex}
                            lyricClassName={t.textStrong}
                          />
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
    </div>
  );
};