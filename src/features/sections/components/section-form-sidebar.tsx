'use client';

import {useTranslations} from 'next-intl';
import {resolveMediaUrl} from '@/features/media-library/utils';
import type {SectionFormValues} from '../schema';
import {getSectionPreviewPath} from '../utils';
import {SectionStatusBadge} from './section-status-badge';
import {SectionTypeBadge} from './section-type-badge';
import {SectionTypeHelper} from './section-type-helper';

type Props = {
  values: SectionFormValues;
};

export function SectionFormSidebar({values}: Props) {
  const t = useTranslations('SectionForm');

  const previewPath = getSectionPreviewPath(values.slug);
  const imageUrl = resolveMediaUrl(values.coverImageUrl);
  const videoUrl = resolveMediaUrl(values.coverVideoUrl);

  return (
    <div className="space-y-5 xl:sticky xl:top-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap gap-2">
          <SectionTypeBadge type={values.sectionType} />
          <SectionStatusBadge isActive={values.isActive} />
        </div>

        <h3 className="text-lg font-semibold text-slate-900">
          {values.nameEn || t('untitledSection')}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {values.namePt || t('untitledSectionPt')}
        </p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {t('previewPathLabel')}
          </p>
          <p className="mt-1 break-all text-sm font-medium text-slate-800">
            {previewPath}
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarSortOrder')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {values.sortOrder}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('sidebarPublishing')}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {values.isActive ? t('publishingActive') : t('publishingInactive')}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-semibold text-slate-900">
            {t('coverPreviewTitle')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('coverPreviewDescription')}
          </p>
        </div>

        <div className="h-52 bg-slate-100">
          {videoUrl ? (
            <video
              src={videoUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
            />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={values.nameEn || t('untitledSection')}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-500">
              {t('noCoverSelected')}
            </div>
          )}
        </div>
      </div>

      <SectionTypeHelper type={values.sectionType} />
    </div>
  );
}