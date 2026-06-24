'use client';

import {useEffect, useState} from 'react';
import {ChevronDown, Info} from 'lucide-react';

type Props = {
  /** Unique localStorage key so each guide remembers its own collapsed state. */
  storageKey: string;
  title: string;
  intro: string;
  steps: string[];
  /** Subtitle shown under the title while the guide is open. */
  hideHint: string;
};

/**
 * A reusable, plain-language "how do I do this here?" guide. Open, it shows a
 * numbered step list; collapsed, it shrinks to a small pulsing info icon that
 * reveals its title on hover, so it stays out of the way until needed. Remembers
 * the owner's choice and is fully responsive. Callers pass already-translated
 * strings.
 */
export function CollapsibleGuide({
  storageKey,
  title,
  intro,
  steps,
  hideHint
}: Props) {
  const [open, setOpen] = useState(true);
  // Gate transitions until after hydration so a previously-collapsed guide
  // doesn't visibly animate on first paint.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === 'true') {
        setOpen(false);
      }
    } catch {
      // localStorage may be unavailable (private mode) — just keep it open.
    }
    setHydrated(true);
  }, [storageKey]);

  const setAndStore = (next: boolean) => {
    setOpen(next);
    try {
      window.localStorage.setItem(storageKey, String(!next));
    } catch {
      // ignore persistence failures
    }
  };

  // Collapsed: a compact info icon that gently pulses for attention and shows
  // its title in a tooltip above on hover.
  if (!open) {
    return (
      <div className="group relative inline-flex">
        <button
          type="button"
          onClick={() => setAndStore(true)}
          aria-expanded={false}
          aria-label={title}
          className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 text-emerald-700 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
        >
          <Info className="h-5 w-5" />
        </button>

        {hydrated ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-400/30 [animation-duration:2.4s]"
          />
        ) : null}

        <span className="pointer-events-none absolute bottom-full left-0 z-20 mb-2 whitespace-nowrap rounded-lg bg-emerald-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-md transition-all duration-200 group-hover:-translate-y-0.5 group-hover:opacity-100">
          {title}
        </span>
      </div>
    );
  }

  // Open: the full step-by-step guide.
  return (
    <div className="overflow-hidden rounded-2xl border-2 border-emerald-300 bg-emerald-50 shadow-sm sm:rounded-3xl">
      <button
        type="button"
        onClick={() => setAndStore(false)}
        aria-expanded
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-emerald-100/60 sm:gap-4 sm:p-5"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Info className="h-4 w-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-emerald-900 sm:text-base">
            {title}
          </span>
          <span className="mt-0.5 block text-xs text-emerald-700 sm:text-sm">
            {hideHint}
          </span>
        </span>

        <ChevronDown className="h-5 w-5 shrink-0 rotate-180 text-emerald-700 transition-transform duration-300" />
      </button>

      <div className="px-4 pb-5 sm:px-5">
        <p className="max-w-3xl text-sm leading-6 text-emerald-800">{intro}</p>

        <ol className="mt-4 space-y-2.5">
          {steps.map((step, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                {index + 1}
              </span>
              <span className="text-sm leading-6 text-emerald-900">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
