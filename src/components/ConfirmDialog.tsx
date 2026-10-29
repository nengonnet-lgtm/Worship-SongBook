import React, { useId, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { getThemeStyles } from '../utils/themeStyles';
import { useDialogBehavior } from '../utils/useDialog';

interface Props {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" gives the confirm button the red style used for deletes */
  tone?: 'danger' | 'default';
  theme?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * In-app confirmation, used instead of window.confirm (which can be blocked in PWAs / embedded views
 * and cannot follow the app theme). Mount it only while a confirmation is pending.
 * Focus starts on "Cancel" so an accidental Enter never deletes anything.
 */
export const ConfirmDialog: React.FC<Props> = ({
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel = 'ยกเลิก',
  tone = 'default',
  theme,
  onConfirm,
  onCancel
}) => {
  const t = getThemeStyles(theme);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const messageId = useId();
  useDialogBehavior(panelRef, onCancel);

  const isDanger = tone === 'danger';

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
      onClick={onCancel}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl animate-scaleIn motion-reduce:animate-none ${t.dialog}`}
      >
        <div className="flex items-start gap-3.5">
          {isDanger && (
            <div className="w-10 h-10 shrink-0 rounded-full bg-red-500/15 text-red-500 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-base font-semibold leading-snug break-words">
              {title}
            </h2>
            {message && (
              <p id={messageId} className={`mt-1.5 text-sm leading-relaxed ${t.textMuted}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            data-autofocus
            onClick={onCancel}
            className={`h-11 px-5 rounded-lg border text-sm font-semibold cursor-pointer transition-colors ${t.ghostBtn} ${t.focus}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
              isDanger ? t.dangerBtn : t.accentBtn
            } ${t.focus}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
