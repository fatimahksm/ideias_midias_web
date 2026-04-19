'use client';

import {useMemo} from 'react';
import {useTranslations} from 'next-intl';

type Variant = 'page' | 'section' | 'admin';

type Props = {
  variant?: Variant;
};

export default function RouteLoadingScreen({
  variant = 'page'
}: Props) {
  const t = useTranslations('RouteLoading');

  const content = useMemo(() => {
    if (variant === 'admin') {
      return {
        badge: t('adminBadge'),
        title: t('adminTitle'),
        description: t('adminDescription')
      };
    }

    if (variant === 'section') {
      return {
        badge: t('sectionBadge'),
        title: t('sectionTitle'),
        description: t('sectionDescription')
      };
    }

    return {
      badge: t('pageBadge'),
      title: t('pageTitle'),
      description: t('pageDescription')
    };
  }, [t, variant]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-10 md:px-8">
        <div className="w-full max-w-xl overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden px-8 py-10 md:px-10 md:py-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_55%)]" />
            <div className="absolute right-[-50px] top-[-50px] h-36 w-36 rounded-full bg-[var(--color-primary-soft)] blur-3xl" />
            <div className="absolute bottom-[-40px] left-[-40px] h-28 w-28 rounded-full bg-[var(--color-accent-soft)] blur-3xl" />

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] theme-text-muted">
                {content.badge}
              </div>

              <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[var(--color-border)]" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--color-primary)] border-r-[var(--color-accent)]" />
                <div className="h-8 w-8 rounded-full bg-[var(--color-primary-soft)]" />
              </div>

              <h2 className="text-2xl font-black tracking-[-0.03em] md:text-3xl">
                {content.title}
              </h2>

              <p className="mt-3 max-w-md text-sm leading-7 theme-text-muted md:text-base">
                {content.description}
              </p>

              <div className="mt-8 grid w-full gap-3">
                <div className="h-4 w-11/12 animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
                <div className="h-4 w-9/12 animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
                <div className="h-4 w-10/12 animate-pulse rounded-full bg-[var(--color-surface-muted)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}