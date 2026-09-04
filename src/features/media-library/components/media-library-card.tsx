'use client';

import {Copy, ExternalLink, LoaderCircle, Pencil, Trash2} from 'lucide-react';
import {useTranslations} from 'next-intl';
import type {MediaLibraryItem} from '../types';
import {resolveMediaUrl} from '../utils';

type Props = {
  item: MediaLibraryItem;
  canDelete: boolean;
  isDeleting: boolean;
  onCopyUrl: (item: MediaLibraryItem) => void;
  onEdit: (item: MediaLibraryItem) => void;
  onDelete: (item: MediaLibraryItem) => void;
};

const iconButtonClassName =
  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50';

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

  const previewUrl = resolveMediaUrl(item.fileUrl);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
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

      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-2">
        <p
          className="min-w-0 truncate text-sm font-medium text-slate-800"
          title={item.originalName}
        >
          {item.originalName}
        </p>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            title={t('copyUrl')}
            onClick={() => onCopyUrl(item)}
            className={iconButtonClassName}
          >
            <Copy className="h-4 w-4" />
          </button>

          {item.fileType === 'IMAGE' ? (
            <button
              type="button"
              title={t('editButton')}
              onClick={() => onEdit(item)}
              className={iconButtonClassName}
            >
              <Pencil className="h-4 w-4" />
            </button>
          ) : null}

          {previewUrl ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noreferrer"
              title={t('openFile')}
              className={iconButtonClassName}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}

          {canDelete ? (
            <button
              type="button"
              title={common('delete')}
              disabled={isDeleting}
              onClick={() => onDelete(item)}
              className={`${iconButtonClassName} hover:bg-red-50 hover:text-red-600`}
            >
              {isDeleting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
