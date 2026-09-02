'use client';

import {useEffect, useRef, useState} from 'react';
import {MoreHorizontal} from 'lucide-react';
import {cn} from '@/lib/cn';

export type ActionMenuItem = {
  key: string;
  label: string;
  /** Internal navigation is handled by the caller through `render`. */
  onSelect?: () => void;
  href?: string;
  /** Opens `href` in a new tab. Used for public preview links. */
  external?: boolean;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type Props = {
  label: string;
  items: ActionMenuItem[];
  align?: 'left' | 'right';
};

/**
 * Secondary actions folded behind one button, so a card shows a single obvious
 * thing to click instead of a row of six equally loud buttons.
 */
export function ActionMenu({label, items, align = 'right'}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // A trigger with nothing behind it is worse than no trigger at all.
  if (items.length === 0) {
    return null;
  }

  const itemClass =
    'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition',
          'hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none',
          open && 'border-slate-300 bg-slate-50'
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span>{label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            'absolute z-30 mt-2 min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-lg',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => {
            const toneClass =
              item.tone === 'danger'
                ? 'text-red-600 hover:bg-red-50'
                : 'text-slate-700 hover:bg-slate-50';

            if (item.href && item.external) {
              return (
                <a
                  key={item.key}
                  role="menuitem"
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(itemClass, toneClass)}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cn(itemClass, toneClass)}
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
