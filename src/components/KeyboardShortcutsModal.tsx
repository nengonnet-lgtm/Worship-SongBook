import React, { useRef } from 'react';
import {
  X,
  Keyboard,
  Music,
  Sliders,
  Search
} from 'lucide-react';
import { getThemeStyles } from '../utils/themeStyles';
import { useDialogBehavior } from '../utils/useDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  sublabel?: string;
}

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose, theme }) => {
  const t = getThemeStyles(theme);
  const modalRef = useRef<HTMLDivElement>(null);
  useDialogBehavior(modalRef, onClose);

  if (!isOpen) return null;

  const stageShortcuts: ShortcutItem[] = [
    {
      keys: ['Space'],
      label: 'เพลงถัดไป (Next Song in Setlist)',
      sublabel: 'หรือเลื่อนลงทีละหน้าหากเปิดเพลงเดี่ยว (Next song or page down)'
    },
    {
      keys: ['Shift', 'Space'],
      label: 'เพลงก่อนหน้า (Previous Song in Setlist)',
      sublabel: 'ย้อนกลับไปเพลงก่อนหน้าในเซ็ตลิสต์'
    },
    {
      keys: ['→', 'PgDn'],
      label: 'เพลงถัดไป (Next Song)',
      sublabel: 'รองรับทั้งปุ่มคีย์บอร์ดและแป้นเหยียบ Foot Pedal'
    },
    {
      keys: ['←', 'PgUp'],
      label: 'เพลงก่อนหน้า (Previous Song)',
      sublabel: 'รองรับทั้งปุ่มคีย์บอร์ดและแป้นเหยียบ Foot Pedal'
    },
    {
      keys: ['↓'],
      label: 'เลื่อนเนื้อเพลงลงอย่างราบรื่น (Scroll Down)',
      sublabel: 'เลื่อนลงอ่านท่อนถัดไป'
    },
    {
      keys: ['↑'],
      label: 'เลื่อนเนื้อเพลงขึ้น (Scroll Up)',
      sublabel: 'เลื่อนขึ้นกลับไปท่อนก่อนหน้า'
    },
    {
      keys: ['Home', 'End'],
      label: 'ไปยังต้นเพลง / ท้ายเพลง (Top / Bottom)',
      sublabel: 'กระโดดไปต้นหรือจบเพลงทันที'
    },
    {
      keys: ['+'],
      label: 'เปลี่ยนคีย์ขึ้น 1 ครึ่งเสียง (Transpose +1)',
      sublabel: 'คีย์บอร์ดกด + หรือ ='
    },
    {
      keys: ['-'],
      label: 'เปลี่ยนคีย์ลง 1 ครึ่งเสียง (Transpose -1)',
      sublabel: 'คีย์บอร์ดกด - หรือ _'
    },
    {
      keys: ['0'],
      label: 'รีเซ็ตคีย์กลับสู่คีย์เดิม (Reset Key)',
      sublabel: 'กลับสู่ original key ของเพลง'
    },
    {
      keys: ['S'],
      label: 'เริ่ม / หยุดเลื่อนอัตโนมัติ (Toggle Auto-Scroll)',
      sublabel: 'Play / Pause Auto-scroll'
    },
    {
      keys: ['['],
      label: 'ลดความเร็วเลื่อน (Scroll Slower)',
      sublabel: 'ปรับความเร็ว auto-scroll ช้าลง'
    },
    {
      keys: [']'],
      label: 'เพิ่มความเร็วเลื่อน (Scroll Faster)',
      sublabel: 'ปรับความเร็ว auto-scroll เร็วขึ้น'
    },
    {
      keys: ['F'],
      label: 'เปิด / ปิดโหมดเวทีเต็มจอ (Fullscreen Stage)',
      sublabel: 'ซ่อนแถบเบราว์เซอร์เพื่อแสดงผลเต็มจอ'
    },
    {
      keys: ['C'],
      label: 'แสดง / ซ่อนคอร์ด (Toggle Chords)',
      sublabel: 'สลับแสดงเฉพาะเนื้อร้องหรือพร้อมคอร์ด'
    },
    {
      keys: ['D'],
      label: 'เปิดแท็บตารางคอร์ด (Chord Diagrams)',
      sublabel: 'ดูรูปคอร์ดที่ใช้ในเพลงนี้'
    },
    {
      keys: ['Esc'],
      label: 'ปิดหน้าต่าง / กลับสู่คลังเพลง (Close / Back)',
      sublabel: 'ออกจากโหมดอ่านเพลง'
    }
  ];

  const libraryShortcuts: ShortcutItem[] = [
    {
      keys: ['↓', '↑'],
      label: 'เลื่อนเลือกเพลงในรายการ (Navigate Songs)',
      sublabel: 'เลื่อนแถบไฮไลต์เพลงในคลัง'
    },
    {
      keys: ['Enter'],
      label: 'เปิดเพลงที่ไฮไลต์อยู่ (Open Selected Song)',
      sublabel: 'เปิดขึ้นหน้าจอแสดงเพลงทันที'
    },
    {
      keys: ['/'],
      label: 'ค้นหาเพลงด่วน (Focus Search Bar)',
      sublabel: 'กระโดดเข้าช่องค้นหาพิมพ์ได้ทันที'
    },
    {
      keys: ['1'],
      label: 'ไปยังแท็บเพลง (Songs Tab)',
      sublabel: 'สลับไปหน้าคลังเพลง'
    },
    {
      keys: ['2'],
      label: 'ไปยังแท็บเซ็ตลิสต์ (Setlists Tab)',
      sublabel: 'สลับไปหน้าจัดการเซ็ตลิสต์นมัสการ'
    },
    {
      keys: ['N'],
      label: 'สร้างเพลงใหม่ (New Song)',
      sublabel: 'เปิดหน้าต่างเพิ่มเพลง'
    }
  ];

  const toolShortcuts: ShortcutItem[] = [
    {
      keys: ['M'],
      label: 'เปิด / ปิดเครื่องเคาะจังหวะ (Toggle Metronome)',
      sublabel: 'เปิดแถบเมโทรนอมนับจังหวะ'
    },
    {
      keys: ['K'],
      label: 'เปิดคลังคอร์ดกีตาร์ / อูคู / เปียโน (Chord Library)',
      sublabel: 'ค้นหาไดอะแกรมคอร์ดทั้งหมด'
    },
    {
      keys: ['T'],
      label: 'สลับธีมสี (Cycle Theme)',
      sublabel: 'สลับระหว่าง Ink (เวทีดำ) / Midnight / Paper'
    },
    {
      keys: ['?'],
      label: 'เปิดหน้าต่างคีย์ลัดนี้ (Toggle Shortcuts Help)',
      sublabel: 'กด ? หรือ Shift+/ เพื่อดูคีย์ลัดได้ตลอดเวลา'
    }
  ];

  const renderBadge = (keyText: string, i: number) => {
    return (
      <span key={i} className="inline-flex items-center gap-1">
        {i > 0 && <span className={`text-xs opacity-50 font-normal ${t.textMuted}`}>+</span>}
        <kbd
          className={`inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg border text-xs font-mono font-bold shadow-xs ${
            t.isLight
              ? 'bg-[#EAE5D9] border-[#D1C9B7] text-[#1F1C17]'
              : 'bg-white/10 border-white/15 text-white'
          }`}
        >
          {keyText}
        </kbd>
      </span>
    );
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs no-print"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${t.dialog} ${t.focus}`}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${t.dialogBar}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.accentSoft} border`}>
              <Keyboard className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="shortcuts-dialog-title" className="font-display font-bold text-lg leading-tight">
                Keyboard Shortcuts (คีย์ลัดบนคีย์บอร์ด)
              </h2>
              <p className={`text-xs ${t.textMuted}`}>
                ออกแบบสำหรับการซ้อมและผู้นำนมัสการบนเวที รองรับคีย์บอร์ดและแป้นเหยียบ Bluetooth Foot Pedal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts"
            title="ปิดหน้าต่าง (Esc)"
            className={`w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer ${t.iconBtn} ${t.focus}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Foot Pedal Notice Banner */}
          <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3 ${t.accentSoft}`}>
            <span className="text-base select-none">🦶</span>
            <div>
              <span className="font-semibold block text-[13px] mb-0.5">
                รองรับแป้นเหยียบเท้า Bluetooth (AirTurn, PageFlip, Donner, Coda Stomp)
              </span>
              <span>
                แป้นเหยียบส่วนใหญ่ตั้งค่าส่งสัญญาณเป็น <strong>Space</strong>, <strong>PageDown / PageUp</strong> หรือ{' '}
                <strong>ลูกศร ซ้าย / ขวา</strong> คุณสามารถเหยียบเพื่อเปลี่ยนเพลงในเซ็ตลิสต์หรือเลื่อนท่อนเนื้อเพลงได้ทันทีโดยไม่ต้องปล่อยมือจากเครื่องดนตรี
              </span>
            </div>
          </div>

          {/* Section: Stage & Song Viewer */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Music className={`w-4 h-4 ${t.accentText}`} />
              <h3 className="font-display font-bold text-sm tracking-wide uppercase">
                โหมดอ่านเพลง &amp; หน้าเวที (Stage View / Live)
              </h3>
            </div>
            <div className={`rounded-xl border divide-y overflow-hidden ${t.card} ${t.divide}`}>
              {stageShortcuts.map((item, idx) => (
                <div key={idx} className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{item.label}</div>
                    {item.sublabel && (
                      <div className={`text-xs mt-0.5 ${t.textMuted}`}>{item.sublabel}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.keys.map((k, ki) => renderBadge(k, ki))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Library Navigation */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Search className={`w-4 h-4 ${t.accentText}`} />
              <h3 className="font-display font-bold text-sm tracking-wide uppercase">
                โหมดคลังเพลง (Library Navigation)
              </h3>
            </div>
            <div className={`rounded-xl border divide-y overflow-hidden ${t.card} ${t.divide}`}>
              {libraryShortcuts.map((item, idx) => (
                <div key={idx} className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{item.label}</div>
                    {item.sublabel && (
                      <div className={`text-xs mt-0.5 ${t.textMuted}`}>{item.sublabel}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.keys.map((k, ki) => renderBadge(k, ki))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Tools & Globals */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sliders className={`w-4 h-4 ${t.accentText}`} />
              <h3 className="font-display font-bold text-sm tracking-wide uppercase">
                เครื่องมือทั่วไป (Global Tools)
              </h3>
            </div>
            <div className={`rounded-xl border divide-y overflow-hidden ${t.card} ${t.divide}`}>
              {toolShortcuts.map((item, idx) => (
                <div key={idx} className="p-3 sm:px-4 sm:py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium leading-snug">{item.label}</div>
                    {item.sublabel && (
                      <div className={`text-xs mt-0.5 ${t.textMuted}`}>{item.sublabel}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.keys.map((k, ki) => renderBadge(k, ki))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${t.dialogBar}`}>
          <span className={t.textMuted}>
            กดปุ่ม <kbd className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded border border-current">?</kbd> บนคีย์บอร์ดเพื่อเปิด/ปิดหน้านี้ได้ตลอดเวลา
          </span>
          <button
            type="button"
            onClick={onClose}
            className={`h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer ${t.accentBtn} ${t.focus}`}
          >
            ตกลง (Got it)
          </button>
        </div>
      </div>
    </div>
  );
};
