import * as React from 'react';
import {cn} from '@/lib/cn';

type SettingsCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export function SettingsCard({
  title,
  description,
  children,
  className
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-5 space-y-1">
        <h2 className="text-xl font-semibold text-[var(--color-text)]">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </div>

      {children}
    </section>
  );
}