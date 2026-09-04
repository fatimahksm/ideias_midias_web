'use client';

import {Pencil} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import type {MediaLibraryItem} from '../types';
import {
  formatFileSize,
  formatMediaDate,
  resolveMediaUrl
} from '../utils';

type Props = {
  item: MediaLibraryItem;
  canDelete: boolean;
  isDeleting: boolean;
  onCopyUrl: (item: MediaLibraryItem) => void;
  onEdit: (item: MediaLibraryItem) => void;
  onDelete: (item: MediaLibraryItem) => void;
};

const anchorClassName =
  'inline-flex h-9 items-center justify-center rounded-xl border border-[var(--color-primary)] bg-white px-3 text-sm font-medium text-[var(--color-primary)] transition hover:bg-slate-50';

export function MediaLibraryCard({
  item,
  canDelete,
  isDeleting,
  onCopyUrl,
  onEdit,
  onDelete
}: Props) {
  const t = useTranslations('MediaLibraryManager');
  const common = useTranslations('Common');
  const locale = useLocale();

  const previewUrl = resolveMediaUrl(item.fileUrl);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-56 overflow-hidden bg-slate-100">
        {previewUrl ? (
          item.fileType === 'VIDEO' ? (
            <video
              src={previewUrl}
              controls
              className="h-full w-full bg-black object-cover"
            />
          ) : (
            <img
              src={previewUrl}
              alt={item.originalName}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center px-4 text-center text-sm text-slate-500">
            {common('notAvailable')}
          </div>
        )}
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {item.originalName}
            </h3>
            <p className="truncate text-xs text-slate-500">{item.fileName}</p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {item.fileType === 'IMAGE' ? t('imageType') : t('videoType')}
          </span>
        </div>

        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t('fileSizeLabel')}
            </dt>
            <dd className="mt-1 text-slate-800">
              {formatFileSize(item.fileSize)}
            </dd>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3">
            <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {t('uploadedLabel')}
            </dt>
            <dd className="mt-1 text-slate-800">
              {formatMediaDate(item.createdAt, locale)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            className="w-full grow sm:w-auto sm:grow-0"
            onClick={() => onCopyUrl(item)}
          >
            {t('copyUrl')}
          </Button>

          {item.fileType === 'IMAGE' ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => onEdit(item)}
            >
              <Pencil className="h-4 w-4" />
              {t('editButton')}
            </Button>
          ) : null}

          {previewUrl ? (
            <a href={previewUrl} target="_blank" rel="noreferrer" className={anchorClassName}>
              {t('openFile')}
            </a>
          ) : null}

          {canDelete ? (
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              loadingText={common('loading')}
              onClick={() => onDelete(item)}
            >
              {common('delete')}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}