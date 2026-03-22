'use client';

import {useTranslations} from 'next-intl';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {PortfolioProjectResponse} from '@/features/portfolio-projects/types';
import type {PortfolioProjectMediaFormValues} from '../schema';

type Props = {
  values: PortfolioProjectMediaFormValues;
  linkedProject?: PortfolioProjectResponse;
};

export function PortfolioProjectMediaFormSidebar({
  values,
  linkedProject
}: Props) {
  const t = useTranslations('PortfolioProjectMediaForm');

  const resolvedMediaUrl = resolveMediaUrl(values.mediaUrl);
  const resolvedThumbnailUrl = resolveMediaUrl(values.thumbnailUrl);
  const previewUrl =
    values.mediaType === 'VIDEO'
      ? resolvedThumbnailUrl || resolvedMediaUrl
      : resolvedMediaUrl;

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

          <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {values.mediaType}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {values.altTextEn || values.altTextPt || t('untitledMedia')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {linkedProject?.titleEn || t('untitledLinkedProject')}
        </p>

        <div className="mt-4 grid gap-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('linkedProjectLabel')}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {linkedProject?.titleEn || t('noProjectLinked')}
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
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt={values.altTextEn || values.altTextPt || t('untitledMedia')}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  {t('noMediaSelected')}
                </div>
              )}
            </div>

            <div className="space-y-2 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                <span>{values.mediaType}</span>
              </div>

              <h4 className="text-base font-semibold text-slate-900">
                {values.altTextEn || values.altTextPt || t('untitledMedia')}
              </h4>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {linkedProject?.titleEn || t('untitledLinkedProject')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}