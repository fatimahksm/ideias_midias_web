'use client';

import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import type {SectionType} from '../types';
import {SectionTypeBadge} from './section-type-badge';

type Props = {
  hasAnySections: boolean;
  activeTypeFilter: 'ALL' | SectionType;
  isFiltered: boolean;
};

export function SectionEmptyState({
  hasAnySections,
  activeTypeFilter,
  isFiltered
}: Props) {
  const t = useTranslations('SectionsManager');

  if (!hasAnySections) {
    return (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
        <div className="mx-auto max-w-xl space-y-4">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
            {t('emptyStudioBadge')}
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            {t('emptyTitle')}
          </h3>

          <p className="text-sm leading-6 text-slate-600">
            {t('emptyDescription')}
          </p>

          <div className="pt-2">
            <Link href="/admin/sections/new">
              <Button type="button">{t('createFirst')}</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto max-w-xl space-y-4">
        {activeTypeFilter !== 'ALL' ? (
          <div className="flex justify-center">
            <SectionTypeBadge type={activeTypeFilter} />
          </div>
        ) : null}

        <h3 className="text-2xl font-bold text-slate-900">
          {isFiltered ? t('filteredEmptyTitle') : t('searchEmptyTitle')}
        </h3>

        <p className="text-sm leading-6 text-slate-600">
          {activeTypeFilter !== 'ALL'
            ? t('filteredByTypeDescription')
            : isFiltered
              ? t('filteredEmptyDescription')
              : t('searchEmptyDescription')}
        </p>

        <div className="pt-2">
          <Link href="/admin/sections/new">
            <Button type="button" variant="outline">
              {t('createAnother')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}