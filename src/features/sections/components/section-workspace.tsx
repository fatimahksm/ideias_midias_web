'use client';

import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useLocale, useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Button} from '@/components/ui/button';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {getSectionById} from '../api';
import {getSectionPreviewPath} from '../utils';
import {SectionStatusBadge} from './section-status-badge';
import {SectionTypeBadge} from './section-type-badge';
import CategoriesManager from '@/features/categories/components/categories-manager';
import ItemsManager from '@/features/items/components/items-manager';
import ContentBlocksManager from '@/features/content-blocks/components/content-blocks-manager';
import PortfolioProjectsManager from '@/features/portfolio-projects/components/portfolio-projects-manager';

type Props = {
  sectionId: number;
};

function InfoCard({label, value}: {label: string; value: string | number}) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
        {label}:
      </span>
      <span className="text-xs font-semibold text-slate-800">{value}</span>
    </div>
  );
}

export function SectionWorkspace({sectionId}: Props) {
  const t = useTranslations('SectionWorkspace');
  const locale = useLocale();
  const sectionsCommon = useTranslations('SectionsCommon');
  const errorT = useTranslations('CommonErrors');

  const sectionQuery = useQuery({
    queryKey: ['sections', 'by-id', sectionId],
    queryFn: () => getSectionById(sectionId)
  });

  const section = sectionQuery.data;

  const previewPath = useMemo(() => {
    if (!section) return '/';
    return getSectionPreviewPath(section.slug);
  }, [section]);

  if (sectionQuery.isPending) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-600">{t('loading')}</p>
      </div>
    );
  }

  if (sectionQuery.isError || !section) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-semibold text-red-700">
          {t('loadErrorTitle')}
        </p>
        <p className="mt-2 text-sm text-red-600">
          {getErrorMessage(
            toAppError(sectionQuery.error),
            (key) => errorT(key)
          )}
        </p>

        <div className="mt-4">
          <Link href="/admin/sections">
            <Button type="button" variant="outline" size="sm">
              {t('backToSections')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <SectionTypeBadge type={section.sectionType} />
              <SectionStatusBadge isActive={section.isActive} />
              <h2 className="truncate text-base font-semibold text-slate-900">
                {section.nameEn}
              </h2>
              <span className="truncate text-xs text-slate-400">
                {section.namePt}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <InfoCard
                label={t('contentModeLabel')}
                value={sectionsCommon(`types.${section.sectionType}.shortMode`)}
              />
              <InfoCard label={t('sortOrderLabel')} value={section.sortOrder} />
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            <Link href={`/admin/sections/${section.id}/edit`}>
              <Button type="button" variant="outline" size="sm">
                {t('editSection')}
              </Button>
            </Link>

            <a href={`/${locale}${previewPath}`} target="_blank" rel="noreferrer">
              <Button type="button" size="sm">
                {t('previewSection')}
              </Button>
            </a>
          </div>
        </div>
      </div>

      {section.sectionType === 'CATEGORY_ITEMS' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('CATEGORY_ITEMS.embeddedTitle')}
          </h3>

          <CategoriesManager sectionId={section.id} compact />
          <ItemsManager sectionId={section.id} compact />
        </div>
      ) : null}

      {section.sectionType === 'DIRECT_ITEMS' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('DIRECT_ITEMS.embeddedTitle')}
          </h3>

          <ItemsManager sectionId={section.id} compact forceDirectMode />
        </div>
      ) : null}

      {section.sectionType === 'CONTENT' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('CONTENT.embeddedTitle')}
          </h3>

          <ContentBlocksManager sectionId={section.id} compact />
        </div>
      ) : null}

      {section.sectionType === 'PORTFOLIO' ? (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('PORTFOLIO.embeddedTitle')}
          </h3>

          <PortfolioProjectsManager sectionId={section.id} compact />
        </div>
      ) : null}
    </div>
  );
}