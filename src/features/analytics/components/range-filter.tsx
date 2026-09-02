'use client';

import {ANALYTICS_RANGE_OPTIONS, type AnalyticsRangeDays} from '../constants';

type Props = {
  value: AnalyticsRangeDays;
  onChange: (value: AnalyticsRangeDays) => void;
  labels: Record<AnalyticsRangeDays, string>;
  ariaLabel: string;
};

export function RangeFilter({value, onChange, labels, ariaLabel}: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1"
    >
      {ANALYTICS_RANGE_OPTIONS.map((option) => {
        const isActive = option === value;

        return (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {labels[option]}
          </button>
        );
      })}
    </div>
  );
}
