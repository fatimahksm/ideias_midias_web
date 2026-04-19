'use client';

import {useTranslations} from 'next-intl';

export default function AppBootScreen() {
  const t = useTranslations('AppBoot');

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="relative mx-auto flex w-full max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="absolute top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />

        <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_20px_60px_rgba(15,23,42,0.10)]">
          <div className="absolute inset-0 rounded-[28px] border-4 border-transparent border-t-[var(--color-primary)] border-r-[var(--color-accent)] animate-spin" />
          <div className="h-10 w-10 rounded-full bg-[var(--color-primary-soft)]" />
        </div>

        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">
          {t('badge')}
        </div>

        <h1 className="text-2xl font-black tracking-[-0.03em] md:text-4xl">
          {t('title')}
        </h1>

        <p className="mt-3 max-w-md text-sm leading-7 theme-text-muted md:text-base">
          {t('description')}
        </p>

        <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
          <div className="h-3 w-full animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
          <div className="h-3 w-4/5 animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
          <div className="h-3 w-3/5 animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
        </div>
      </div>
    </div>
  );
}