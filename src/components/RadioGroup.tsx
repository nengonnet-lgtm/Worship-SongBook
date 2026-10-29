import React from 'react';

interface Props {
  label: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * A group of buttons that behave like radio buttons for keyboard users:
 * give each child role="radio", aria-checked, and tabIndex 0 only on the selected one (see tabIndexFor).
 * Arrow keys then move between them and select as they go.
 */
export const RadioGroup: React.FC<Props> = ({ label, className, children }) => {
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;

    const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const at = radios.indexOf(document.activeElement as HTMLButtonElement);
    if (at === -1) return;

    e.preventDefault();
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const next = radios[(at + step + radios.length) % radios.length];
    next.focus();
    next.click();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className={className}>
      {children}
    </div>
  );
};

/** Only the selected radio is a Tab stop; if nothing is selected the first one is, so the group stays reachable. */
export const tabIndexFor = (selected: boolean, index: number, anySelected: boolean): 0 | -1 =>
  selected || (!anySelected && index === 0) ? 0 : -1;

export default RadioGroup;
