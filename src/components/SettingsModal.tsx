import React, { useId, useRef } from 'react';
import { X, Settings, Columns, Eye, EyeOff, Moon, Sun, Monitor, Check } from 'lucide-react';
import { AppSettings, InstrumentType, ChordNotation } from '../types/song';
import { RadioGroup, tabIndexFor } from './RadioGroup';
import { getThemeStyles } from '../utils/themeStyles';
import type { ThemeStyles } from '../utils/themeStyles';
import { useDialogBehavior } from '../utils/useDialog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
}

const CHORD_COLORS = [
  { name: 'Sky Blue', hex: '#38bdf8' },
  { name: 'Amber', hex: '#fbbf24' },
  { name: 'Emerald', hex: '#34d399' },
  { name: 'Rose', hex: '#fb7185' },
  { name: 'Purple', hex: '#c084fc' },
  { name: 'Yellow', hex: '#facc15' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'White', hex: '#ffffff' }
];

const INSTRUMENTS: { value: InstrumentType; label: string }[] = [
  { value: 'guitar', label: 'กีตาร์' },
  { value: 'ukulele', label: 'อูคู' },
  { value: 'piano', label: 'เปียโน' }
];

const NOTATIONS: { value: ChordNotation; label: string }[] = [
  { value: 'standard', label: 'C D E' },
  { value: 'solfege', label: 'Do Re' },
  { value: 'nashville', label: '1 2 3' }
];

// Theme tiles keep the look of each theme so the choice is recognisable at a glance
const THEME_TILES = [
  {
    value: 'stage-black',
    label: 'OLED',
    Icon: Moon,
    on: 'bg-black border-amber-400 text-amber-400',
    off: 'bg-black border-neutral-700 text-neutral-400 hover:border-neutral-500'
  },
  {
    value: 'dark',
    label: 'Slate',
    Icon: Monitor,
    on: 'bg-[#1e293b] border-sky-400 text-sky-400',
    off: 'bg-[#1e293b] border-slate-600 text-slate-400 hover:border-slate-400'
  },
  {
    value: 'light',
    label: 'Light',
    Icon: Sun,
    on: 'bg-white border-blue-600 text-blue-700',
    off: 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
  }
] as const;

export const SettingsModal: React.FC<Props> = (props) =>
  props.isOpen ? <SettingsDialog {...props} /> : null;

/** One setting: a heading (with its current value on the right) above its control. */
const Section: React.FC<{
  id: string;
  title: string;
  value?: string;
  t: ThemeStyles;
  /** No vertical padding: used when the section sits inside a two-column row that already has it */
  flush?: boolean;
  children: React.ReactNode;
}> = ({ id, title, value, t, flush, children }) => (
  <section aria-labelledby={id} className={flush ? '' : 'py-4 first:pt-0 last:pb-0'}>
    <div className="flex items-baseline justify-between gap-3 mb-2.5">
      <h3 id={id} className="text-sm font-semibold">
        {title}
      </h3>
      {value && <span className={`text-sm font-mono shrink-0 ${t.accentText}`}>{value}</span>}
    </div>
    {children}
  </section>
);

interface SegProps<V extends string | number | boolean> {
  label: string;
  t: ThemeStyles;
  value: V | undefined;
  options: { value: V; label: string; icon?: React.ReactNode }[];
  onChange: (v: V) => void;
  small?: boolean;
}

/** Segmented choice built as a radio group (arrow keys move between options). */
function Segmented<V extends string | number | boolean>({
  label,
  t,
  value,
  options,
  onChange,
  small
}: SegProps<V>) {
  const anySelected = options.some((o) => o.value === value);
  return (
    <RadioGroup
      label={label}
      className={`grid gap-1.5 ${
        options.length === 2 ? 'grid-cols-2' : options.length === 3 ? 'grid-cols-3' : 'grid-cols-1'
      }`}
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={tabIndexFor(selected, i, anySelected)}
            onClick={() => onChange(opt.value)}
            className={`h-10 px-2 rounded-lg border font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors motion-reduce:transition-none ${
              small ? 'text-xs' : 'text-sm'
            } ${selected ? t.segOn : t.segOff} ${t.focus}`}
          >
            {opt.icon}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </RadioGroup>
  );
}

const SettingsDialog: React.FC<Props> = ({ onClose, settings, onUpdateSettings }) => {
  const t = getThemeStyles(settings.theme);
  const panelRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  useDialogBehavior(panelRef, onClose);

  const fontSize = settings.fontSize || 16;
  const scrollSpeed = settings.autoScrollSpeed || 3;
  const colorName = CHORD_COLORS.find((c) => c.hex === settings.chordsColor)?.name || 'Custom';
  const themeSelected = THEME_TILES.some((o) => o.value === settings.theme);
  const colorSelected = CHORD_COLORS.some((c) => c.hex === settings.chordsColor);

  const stepBtn = `w-10 h-10 shrink-0 rounded-lg border text-sm font-bold flex items-center justify-center cursor-pointer transition-colors motion-reduce:transition-none ${t.ghostBtn} ${t.focus}`;

  const applyTheme = (value: (typeof THEME_TILES)[number]['value']) => {
    if (value === 'stage-black') {
      onUpdateSettings({
        theme: 'stage-black',
        chordsColor: settings.chordsColor === '#1d4ed8' ? '#fbbf24' : settings.chordsColor
      });
    } else if (value === 'dark') {
      onUpdateSettings({
        theme: 'dark',
        chordsColor: settings.chordsColor === '#1d4ed8' ? '#38bdf8' : settings.chordsColor
      });
    } else {
      onUpdateSettings({ theme: 'light', chordsColor: '#1d4ed8' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/65 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${uid}-title`}
        tabIndex={-1}
        className={`relative w-full max-w-md max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col z-10 animate-scaleIn motion-reduce:animate-none focus:outline-none ${t.dialog}`}
      >
        {/* Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 shrink-0 ${t.dialogBar}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${t.accentBtn}`}>
              <Settings className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 id={`${uid}-title`} className="font-bold text-base leading-tight truncate">
                ตั้งค่าระบบ (Settings)
              </h2>
              <p className={`text-sm leading-tight truncate ${t.textMuted}`}>
                ปรับแต่งธีม สีคอร์ด และการแสดงผล
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด (Close)"
            className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center cursor-pointer transition-colors motion-reduce:transition-none ${t.iconBtn} ${t.focus}`}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className={`px-5 py-5 overflow-y-auto divide-y ${t.divide}`}>
          <Section id={`${uid}-theme`} title="ธีมการแสดงผล (Theme)" t={t}>
            <RadioGroup label="ธีมการแสดงผล" className="grid grid-cols-3 gap-2">
              {THEME_TILES.map((tile, i) => {
                const selected = settings.theme === tile.value;
                return (
                  <button
                    key={tile.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    tabIndex={tabIndexFor(selected, i, themeSelected)}
                    onClick={() => applyTheme(tile.value)}
                    className={`h-14 rounded-xl border-2 text-sm font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-colors motion-reduce:transition-none ${
                      selected ? tile.on : tile.off
                    } ${t.focus}`}
                  >
                    <tile.Icon className="w-4 h-4" aria-hidden="true" />
                    <span>{tile.label}</span>
                  </button>
                );
              })}
            </RadioGroup>
          </Section>

          <Section id={`${uid}-color`} title="สีคอร์ด (Chord color)" value={colorName} t={t}>
            <RadioGroup label="สีคอร์ด" className="flex flex-wrap gap-2.5">
              {CHORD_COLORS.map((col, i) => {
                const selected = settings.chordsColor === col.hex;
                return (
                  <button
                    key={col.hex}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={col.name}
                    title={col.name}
                    tabIndex={tabIndexFor(selected, i, colorSelected)}
                    onClick={() => onUpdateSettings({ chordsColor: col.hex })}
                    style={{ backgroundColor: col.hex }}
                    className={`w-10 h-10 rounded-full border border-black/25 flex items-center justify-center cursor-pointer transition-transform motion-reduce:transition-none ${
                      selected
                        ? `scale-105 ring-2 ring-offset-2 ${
                            t.isLight ? 'ring-slate-700 ring-offset-white' : 'ring-white ring-offset-neutral-900'
                          }`
                        : 'hover:scale-105'
                    } ${t.focus}`}
                  >
                    {selected && (
                      <Check
                        className={`w-4 h-4 ${col.hex === '#ffffff' || col.hex === '#facc15' ? 'text-black' : 'text-white'}`}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </RadioGroup>
          </Section>

          <Section id={`${uid}-size`} title="ขนาดตัวอักษร (Font size)" value={`${fontSize}px`} t={t}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="ลดขนาดตัวอักษร"
                onClick={() => onUpdateSettings({ fontSize: Math.max(12, fontSize - 1) })}
                className={stepBtn}
              >
                A−
              </button>
              <input
                type="range"
                min={12}
                max={30}
                step={1}
                value={fontSize}
                aria-labelledby={`${uid}-size`}
                aria-valuetext={`${fontSize} พิกเซล`}
                onChange={(e) => onUpdateSettings({ fontSize: parseInt(e.target.value, 10) })}
                className={`flex-1 h-8 cursor-pointer ${t.accentColor} ${t.focus}`}
              />
              <button
                type="button"
                aria-label="เพิ่มขนาดตัวอักษร"
                onClick={() => onUpdateSettings({ fontSize: Math.min(30, fontSize + 1) })}
                className={stepBtn}
              >
                A+
              </button>
            </div>
          </Section>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Section flush id={`${uid}-cols`} title="คอลัมน์ (Columns)" t={t}>
              <Segmented
                label="จำนวนคอลัมน์"
                t={t}
                value={settings.columns}
                onChange={(v) => onUpdateSettings({ columns: v })}
                options={[
                  { value: 1, label: '1', icon: <Columns className="w-4 h-4" aria-hidden="true" /> },
                  { value: 2, label: '2', icon: <Columns className="w-4 h-4" aria-hidden="true" /> }
                ]}
              />
            </Section>
            <Section flush id={`${uid}-chords`} title="คอร์ด (Chords)" t={t}>
              <Segmented
                label="แสดงคอร์ด"
                t={t}
                value={settings.showChords !== false}
                onChange={(v) => onUpdateSettings({ showChords: v })}
                options={[
                  { value: true, label: 'แสดง', icon: <Eye className="w-4 h-4" aria-hidden="true" /> },
                  { value: false, label: 'ซ่อน', icon: <EyeOff className="w-4 h-4" aria-hidden="true" /> }
                ]}
              />
            </Section>
          </div>

          <div className="grid grid-cols-2 gap-4 py-4">
            <Section flush id={`${uid}-inst`} title="เครื่องดนตรี (Instrument)" t={t}>
              <Segmented
                label="เครื่องดนตรี"
                t={t}
                small
                value={settings.instrument}
                onChange={(v) => onUpdateSettings({ instrument: v })}
                options={INSTRUMENTS}
              />
            </Section>
            <Section flush id={`${uid}-notation`} title="รูปแบบคอร์ด (Notation)" t={t}>
              <Segmented
                label="รูปแบบการเขียนคอร์ด"
                t={t}
                small
                value={settings.chordNotation}
                onChange={(v) => onUpdateSettings({ chordNotation: v })}
                options={NOTATIONS}
              />
            </Section>
          </div>

          <Section
            id={`${uid}-scroll`}
            title="เลื่อนอัตโนมัติ (Auto-scroll)"
            value={`ระดับ ${scrollSpeed}/10`}
            t={t}
          >
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={scrollSpeed}
              aria-labelledby={`${uid}-scroll`}
              aria-valuetext={`ระดับ ${scrollSpeed} จาก 10`}
              onChange={(e) => onUpdateSettings({ autoScrollSpeed: parseInt(e.target.value, 10) })}
              className={`w-full h-8 cursor-pointer ${t.accentColor} ${t.focus}`}
            />
            <div className={`flex justify-between text-xs mt-1 ${t.textMuted}`}>
              <span>ช้า</span>
              <span>เร็ว</span>
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-end shrink-0 ${t.dialogBar}`}>
          <button
            type="button"
            onClick={onClose}
            className={`h-11 px-6 rounded-lg text-sm font-bold cursor-pointer transition-colors motion-reduce:transition-none ${t.accentBtn} ${t.focus}`}
          >
            เรียบร้อย (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
