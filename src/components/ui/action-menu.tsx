'use client';

import {useCallback, useEffect, useRef, useState} from 'react';
import {createPortal} from 'react-dom';
import {MoreHorizontal} from 'lucide-react';
import {cn} from '@/lib/cn';

export type ActionMenuItem = {
  key: string;
  label: string;
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

/** Enough room for the longest menu we open; below this the menu flips up. */
const ESTIMATED_MENU_HEIGHT = 260;
const GAP = 8;

type Position = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

/**
 * Secondary actions folded behind one button, so a card shows a single obvious
 * thing to click instead of a row of six equally loud buttons.
 *
 * The panel is rendered into `document.body` rather than next to the trigger:
 * these menus live inside cards that clip their own content, and a menu that
 * gets cut off at the card's edge is worse than no menu at all.
 */
export function ActionMenu({label, items, align = 'right'}: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const flipUp = rect.bottom + ESTIMATED_MENU_HEIGHT > window.innerHeight;

    setPosition({
      ...(flipUp
        ? {bottom: window.innerHeight - rect.top + GAP}
        : {top: rect.bottom + GAP}),
      ...(align === 'right'
        ? {right: window.innerWidth - rect.right}
        : {left: rect.left})
    });
  }, [align]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;

      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    // The panel is fixed to the viewport, so it has to follow the trigger.
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // A trigger with nothing behind it is worse than no trigger at all.
  if (items.length === 0) {
    return null;
  }

  const itemClass =
    'flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }

          // Measured before opening, so the panel never paints unpositioned.
          updatePosition();
          setOpen(true);
        }}
        className={cn(
          'inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 transition',
          'hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none',
          open && 'border-slate-300 bg-slate-50'
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span>{label}</span>
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={position}
              className="fixed z-[200] min-w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-xl"
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
            </div>,
            document.body
          )
        : null}
    </>
  );
}
