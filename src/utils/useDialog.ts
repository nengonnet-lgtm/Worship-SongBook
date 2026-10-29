import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Closes a menu / popover when the user taps outside it or presses Escape.
 * Escape is handled in the capture phase and stopped, so it closes only the popover
 * and not a dialog it may be sitting inside.
 */
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
  /** Optional: where focus goes when Escape closes the popover (normally the button that opened it) */
  returnFocusRef?: RefObject<HTMLElement | null>
): void {
  const latest = useRef(onDismiss);
  useEffect(() => {
    latest.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const el = ref.current;
      if (el && !el.contains(e.target as Node)) latest.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        latest.current();
        returnFocusRef?.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, ref, returnFocusRef]);
}

// Only the most recently opened dialog reacts to Escape / Tab
const dialogStack: symbol[] = [];

/**
 * Keyboard behaviour every modal dialog needs:
 *  - moves focus into the dialog when it opens (an element with data-autofocus wins, otherwise the first control)
 *  - keeps Tab / Shift+Tab inside the dialog
 *  - Escape closes it
 *  - returns focus to whatever opened it when it closes
 * Mount the dialog only while it is open (render it conditionally).
 */
export function useDialogBehavior(ref: RefObject<HTMLElement | null>, onClose: () => void): void {
  const latestClose = useRef(onClose);
  useEffect(() => {
    latestClose.current = onClose;
  });

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const id = Symbol('dialog');
    dialogStack.push(id);
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => !el.hasAttribute('hidden') && el.getAttribute('aria-hidden') !== 'true'
      );

    const initial = root.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0] ?? root;
    initial.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== id) return;

      if (e.key === 'Escape') {
        e.stopPropagation();
        latestClose.current();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!active || !root.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === root)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      const at = dialogStack.indexOf(id);
      if (at !== -1) dialogStack.splice(at, 1);
      previouslyFocused?.focus?.();
    };
  }, [ref]);
}
