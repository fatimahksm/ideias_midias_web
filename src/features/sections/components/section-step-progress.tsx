'use client';

import {useTranslations} from 'next-intl';
import {cn} from '@/lib/cn';

const STEP_KEYS = [
  'stepTypeLabel',
  'stepBasicsLabel',
  'stepDescriptionLabel',
  'stepMediaLabel',
  'stepPublishLabel'
] as const;

type Props = {
  currentStep: number;
};

export function SectionStepProgress({currentStep}: Props) {
  const t = useTranslations('SectionForm');

  return (
    <div className="flex items-center gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {STEP_KEYS.map((key, index) => {
        const isDone = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div key={key} className="flex items-center gap-2">
            {index > 0 ? (
              <div
                className={cn(
                  'h-px w-6 shrink-0',
                  isDone || isCurrent ? 'bg-[var(--color-primary)]' : 'bg-slate-200'
                )}
              />
            ) : null}

            <div className="flex items-center gap-2 whitespace-nowrap">
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
                {t(key)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
