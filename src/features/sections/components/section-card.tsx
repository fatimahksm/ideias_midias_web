'use client';

import {useLocale, useTranslations} from 'next-intl';
import {useRouter} from 'next/navigation';
import {Link} from '@/i18n/navigation';
import {ActionMenu} from '@/components/ui/action-menu';
import {Button} from '@/components/ui/button';
import {resolveMediaUrl, formatMediaDate} from '@/features/media-library/utils';
import type {SectionResponse} from '../types';
import {getSectionPreviewPath} from '../utils';
import {SectionStatusBadge} from './section-status-badge';
import {SectionTypeBadge} from './section-type-badge';

type Props = {
  item: SectionResponse;
  canDelete: boolean;
  isDeleting: boolean;
  onDelete: (item: SectionResponse) => void;
};

function CoverFallback({
  name,
  typeLabel
}: {
  name: string;
  typeLabel: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 text-center">
      <span className="rounded-full border border-white/70 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        {typeLabel}
      </span>
      <p className="mt-3 line-clamp-2 text-base font-semibold text-slate-700">
        {name}
      </p>
    </div>
  );
}

export function SectionCard({
  item,
  canDelete,
  isDeleting,
  onDelete
}: Props) {
  const t = useTranslations('SectionsManager');
  const common = useTranslations('Common');
  const commonSections = useTranslations('SectionsCommon');
  const locale = useLocale();
  const router = useRouter();

  const imageUrl = resolveMediaUrl(item.coverImageUrl);
  const videoUrl = resolveMediaUrl(item.coverVideoUrl);
  const previewPath = getSectionPreviewPath(item.slug);

  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative h-56 overflow-hidden bg-slate-100">
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
            alt={item.nameEn}
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverFallback
            name={item.nameEn}
            typeLabel={commonSections(`types.${item.sectionType}.label`)}
          />
        )}

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <SectionTypeBadge type={item.sectionType} />
          <SectionStatusBadge isActive={item.isActive} />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {item.nameEn}
              </h3>
              <p className="truncate text-sm text-slate-500">{item.namePt}</p>
            </div>

            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                {t('sortOrder')}
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {item.sortOrder}
              </p>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-6 text-slate-600">
            {item.descriptionEn || item.descriptionPt || t('noDescription')}
          </p>
        </div>

        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('updatedAt')}
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {formatMediaDate(item.updatedAt, locale)}
            </dd>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              {t('contentMode')}
            </dt>
            <dd className="mt-1 text-sm text-slate-700">
              {commonSections(`types.${item.sectionType}.shortMode`)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/sections/${item.id}`} className="grow sm:grow-0">
            <Button type="button" className="w-full sm:w-auto">
              {t('openWorkspace')}
            </Button>
          </Link>

          <ActionMenu
            label={common('moreActions')}
            items={[
              {
                key: 'edit',
                label: t('editSettings'),
                onSelect: () =>
                  router.push(`/${locale}/admin/sections/${item.id}/edit`)
              },
              {
                key: 'preview',
                label: t('preview'),
                href: `/${locale}${previewPath}`,
                external: true
              },
              ...(canDelete
                ? [
                    {
                      key: 'delete',
                      label: isDeleting ? common('loading') : common('delete'),
                      tone: 'danger' as const,
                      disabled: isDeleting,
                      onSelect: () => onDelete(item)
                    }
                  ]
                : [])
            ]}
          />
        </div>
      </div>
    </article>
  );
}