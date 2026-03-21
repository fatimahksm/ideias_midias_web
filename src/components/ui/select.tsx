import * as React from 'react';
import {cn} from '@/lib/cn';

type Option = {
  value: string;
  label: string;
};

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  hint?: string;
  options: Option[];
  containerClassName?: string;
};

export function Select({
  label,
  error,
  hint,
  className,
  containerClassName,
  id,
  options,
  ...props
}: SelectProps) {
  return (
    <div className={cn('w-full space-y-1.5', containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--color-text)]"
        >
          {label}
        </label>
      ) : null}

      <select
        id={id}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 text-sm text-[var(--color-text)] outline-none transition',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-accent)]/10',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}