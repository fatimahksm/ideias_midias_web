import * as React from 'react';
import {cn} from '@/lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
};

export function Input({
  label,
  error,
  hint,
  className,
  containerClassName,
  id,
  ...props
}: InputProps) {
  return (
    <div className={cn('w-full space-y-1.5', containerClassName)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-800"
        >
          {label}
        </label>
      ) : null}

      <input
        id={id}
        className={cn(
          'w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100'
            : 'border-slate-300 focus:border-slate-900 focus:ring-2 focus:ring-slate-100',
          'placeholder:text-slate-400',
          className
        )}
        {...props}
      />

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-sm text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}