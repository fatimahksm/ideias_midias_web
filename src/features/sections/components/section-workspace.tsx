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

function InfoCard({
  label,
  value,
  href
}: {
  label: string;
  value: string | number;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block truncate text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
      )}
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <SectionTypeBadge type={section.sectionType} />
              <SectionStatusBadge isActive={section.isActive} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {section.nameEn}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                {section.namePt}
              </p>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {section.descriptionEn ||
                section.descriptionPt ||
                sectionsCommon(`types.${section.sectionType}.description`)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label={t('sectionIdLabel')} value={`#${section.id}`} />
          <InfoCard label={t('slugLabel')} value={previewPath} href={`/${locale}${previewPath}`} />
          <InfoCard
            label={t('contentModeLabel')}
            value={sectionsCommon(`types.${section.sectionType}.shortMode`)}
          />
          <InfoCard label={t('sortOrderLabel')} value={section.sortOrder} />
        </div>
      </div>

      {section.sectionType === 'CATEGORY_ITEMS' ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('CATEGORY_ITEMS.embeddedTitle')}
          </h3>

          <CategoriesManager sectionId={section.id} compact />
          <ItemsManager sectionId={section.id} compact />
        </div>
      ) : null}

      {section.sectionType === 'DIRECT_ITEMS' ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('DIRECT_ITEMS.embeddedTitle')}
          </h3>

          <ItemsManager sectionId={section.id} compact forceDirectMode />
        </div>
      ) : null}

      {section.sectionType === 'CONTENT' ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('CONTENT.embeddedTitle')}
          </h3>

          <ContentBlocksManager sectionId={section.id} compact />
        </div>
      ) : null}

      {section.sectionType === 'PORTFOLIO' ? (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">
            {t('PORTFOLIO.embeddedTitle')}
          </h3>

          <PortfolioProjectsManager sectionId={section.id} compact />
        </div>
      ) : null}
    </div>
  );
}