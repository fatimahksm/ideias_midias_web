'use client';

import {useQuery} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {getMediaByType} from '../api';
import type {MediaFileType, MediaLibraryItem} from '../types';
import {resolveMediaUrl, sortMediaNewestFirst} from '../utils';

type Props = {
  open: boolean;
  type: MediaFileType;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem) => void;
};

export function MediaLibraryPickerModal({open, type, onClose, onSelect}: Props) {
  const t = useTranslations('MediaLibraryPicker');

  const mediaQuery = useQuery({
    queryKey: ['media-library', 'type', type],
    queryFn: () => getMediaByType(type),
    enabled: open
  });

  if (!open) return null;

  const items = sortMediaNewestFirst(mediaQuery.data ?? []);

  return (
    <div
      className="fixed inset-0 z-[140] bg-black/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex min-h-full items-center justify-center p-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border shadow-2xl"
          style={{
            background: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)'
          }}
        >
          <div
            className="flex items-start justify-between gap-4 border-b px-6 py-5"
            style={{borderColor: 'var(--color-border)'}}
          >
            <div>
              <h3 className="text-xl font-black">
                {type === 'IMAGE' ? t('titleImage') : t('titleVideo')}
              </h3>
              <p
                className="mt-2 text-sm leading-6"
                style={{color: 'var(--color-text-muted)'}}
              >
                {t('description')}
              </p>
            </div>

            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {t('close')}
            </Button>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            {mediaQuery.isLoading ? (
              <p className="py-10 text-center text-sm" style={{color: 'var(--color-text-muted)'}}>
                {t('loading')}
              </p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm" style={{color: 'var(--color-text-muted)'}}>
                {t('empty')}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((item) => {
                  const previewUrl = resolveMediaUrl(item.fileUrl);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelect(item)}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 text-left transition hover:border-[var(--color-primary)] hover:shadow-md"
                    >
                      <div className="h-28 w-full overflow-hidden bg-slate-100">
                        {previewUrl ? (
                          type === 'VIDEO' ? (
                            <video src={previewUrl} className="h-full w-full object-cover" muted />
                          ) : (
                            <img
                              src={previewUrl}
                              alt={item.originalName}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                          )
                        ) : null}
                      </div>
                      <p className="truncate px-2 py-1.5 text-xs text-slate-600">
                        {item.originalName}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
