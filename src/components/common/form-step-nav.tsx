'use client';

import {cn} from '@/lib/cn';

export type FormStep = {
  key: string;
  label: string;
};

type Props = {
  steps: FormStep[];
  currentStep: number;
  /**
   * When set, steps become clickable and the owner can jump straight to the
   * part they want. Editing an existing record should always allow this;
   * a first-time creation flow only unlocks steps already passed.
   */
  onSelect?: (step: number) => void;
  /** Highest step that may be jumped to. Defaults to every step. */
  maxSelectableStep?: number;
};

export function FormStepNav({
  steps,
  currentStep,
  onSelect,
  maxSelectableStep
}: Props) {
  const limit = maxSelectableStep ?? steps.length - 1;

  return (
    <nav className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;
        const isSelectable = Boolean(onSelect) && index <= limit;

        const content = (
          <span className="flex items-center gap-2 whitespace-nowrap">
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                isCurrent
                  ? 'bg-[var(--color-primary)] text-white'
                  : isDone
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
              )}
            >
              {isDone ? '✓' : index + 1}
            </span>

            <span
              className={cn(
                'text-sm font-medium',
                isCurrent ? 'text-slate-900' : 'text-slate-500'
              )}
            >
              {step.label}
            </span>
          </span>
        );

        return (
          <div key={step.key} className="flex items-center gap-2">
            {index > 0 ? (
              <div
                className={cn(
                  'h-px w-6 shrink-0',
                  isDone || isCurrent
                    ? 'bg-[var(--color-primary)]'
                    : 'bg-slate-200'
                )}
              />
            ) : null}

            {isSelectable ? (
              <button
                type="button"
                aria-current={isCurrent ? 'step' : undefined}
                onClick={() => onSelect?.(index)}
                className="rounded-xl px-2 py-1 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none"
              >
                {content}
              </button>
            ) : (
              <div className="px-2 py-1">{content}</div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
