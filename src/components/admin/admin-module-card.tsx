import * as React from 'react';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/cn';

type StatusTone = 'ready' | 'next';

type Props = {
  title: string;
  description: string;
  statusLabel: string;
  statusTone?: StatusTone;
  actionLabel?: string;
  href?: string;
  className?: string;
};

const badgeClasses: Record<StatusTone, string> = {
  ready: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  next: 'border-amber-200 bg-amber-50 text-amber-700'
};

export function AdminModuleCard({
  title,
  description,
  statusLabel,
  statusTone = 'ready',
  actionLabel,
  href,
  className
}: Props) {
  return (
    <article
      className={cn(
        'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <span
          className={cn(
            'inline-flex shrink-0 rounded-full border px-3 py-1 text-xs font-semibold',
            badgeClasses[statusTone]
          )}
        >
          {statusLabel}
        </span>
      </div>

      {href && actionLabel ? (
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}