'use client';

import {useTranslations} from 'next-intl';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {SectionResponse} from '@/features/sections/types';
import type {PortfolioProjectFormValues} from '../schema';

type Props = {
  values: PortfolioProjectFormValues;
  linkedSection?: SectionResponse;
};

export function PortfolioProjectFormSidebar({values, linkedSection}: Props) {
  const t = useTranslations('PortfolioProjectForm');
  const imageUrl = resolveMediaUrl(values.coverImageUrl);

  return (
    <div className="space-y-5 xl:sticky xl:top-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
              values.isActive
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {values.isActive ? t('statusActive') : t('statusInactive')}
          </span>

          {values.isFeatured ? (
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {t('featuredBadge')}
            </span>
          ) : null}
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {values.titleEn || t('untitledProject')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {values.titlePt || t('untitledProjectPt')}
        </p>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('linkedSectionLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {linkedSection?.nameEn || t('noSectionLinked')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('clientNameLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {values.clientName || t('noClient')}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarSortOrder')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {values.sortOrder}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            {t('previewTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('previewDescription')}
          </p>
        </div>

        <div className="p-5">
          <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50">
            <div className="h-44 bg-slate-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={values.titleEn || t('untitledProject')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  {t('noImageSelected')}
                </div>
              )}
            </div>

            <div className="space-y-2 p-4">
              <h4 className="text-base font-semibold text-slate-900">
                {values.titleEn || t('untitledProject')}
              </h4>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {values.shortDescriptionEn ||
                  values.shortDescriptionPt ||
                  t('noDescriptionYet')}
              </p>
              <p className="text-xs font-medium text-slate-500">
                {values.clientName || t('noClient')}
                {values.projectDate ? ` • ${values.projectDate}` : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}