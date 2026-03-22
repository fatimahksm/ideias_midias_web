'use client';

import {useTranslations} from 'next-intl';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {SectionResponse} from '@/features/sections/types';
import type {ContentBlockFormValues} from '../schema';

type Props = {
  values: ContentBlockFormValues;
  linkedSection?: SectionResponse;
};

export function ContentBlockFormSidebar({values, linkedSection}: Props) {
  const t = useTranslations('ContentBlockForm');

  const imageUrl = resolveMediaUrl(values.imageUrl);
  const previewTitle = values.titleEn || values.titlePt || t('untitledBlock');
  const previewText =
    values.subtitleEn ||
    values.subtitlePt ||
    values.contentEn ||
    values.contentPt ||
    t('noContentYet');

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
            {t(`types.${values.blockType}` as never)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900">{previewTitle}</h3>
        <p className="mt-1 text-sm text-slate-500">
          {linkedSection?.nameEn || t('noSectionLinked')}
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
                  alt={previewTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
                  {t('noImageSelected')}
                </div>
              )}
            </div>

            <div className="space-y-2 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                <span>{t(`types.${values.blockType}` as never)}</span>
              </div>

              <h4 className="text-base font-semibold text-slate-900">
                {previewTitle}
              </h4>
              <p className="line-clamp-3 text-sm leading-6 text-slate-600">
                {previewText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}