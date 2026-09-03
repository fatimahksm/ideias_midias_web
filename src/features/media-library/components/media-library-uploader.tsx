'use client';

import {useRef, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '../api';

type Props = {
  onUploaded?: () => void;
};

type QueuedFile = {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
};

/** How many uploads run at once. High enough to feel fast, low enough that a
 * batch of fifty files does not open fifty connections at the same time. */
const CONCURRENCY = 3;

export function MediaLibraryUploader({onUploaded}: Props) {
  const t = useTranslations('MediaLibraryManager');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const total = queue.length;
  const done = queue.filter((q) => q.status === 'done').length;
  const failed = queue.filter((q) => q.status === 'error');

  function resetInput() {
    if (inputRef.current) inputRef.current.value = '';
  }

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    resetInput();

    if (!files.length) return;

    const items: QueuedFile[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      file,
      status: 'pending'
    }));

    setQueue(items);
    setIsUploading(true);

    await runQueue(items);

    setIsUploading(false);
    await queryClient.invalidateQueries({queryKey: ['media-library']});
    onUploaded?.();
  }

  async function runQueue(items: QueuedFile[]) {
    let cursor = 0;

    async function worker() {
      while (cursor < items.length) {
        const index = cursor;
        cursor += 1;
        const item = items[index];

        setQueue((current) =>
          current.map((q) => (q.id === item.id ? {...q, status: 'uploading'} : q))
        );

        try {
          await uploadMedia(item.file);
          setQueue((current) =>
            current.map((q) => (q.id === item.id ? {...q, status: 'done'} : q))
          );
        } catch (error) {
          const message = getErrorMessage(toAppError(error), (key) => errorT(key));
          setQueue((current) =>
            current.map((q) =>
              q.id === item.id ? {...q, status: 'error', error: message} : q
            )
          );
        }
      }
    }

    await Promise.all(
      Array.from({length: Math.min(CONCURRENCY, items.length)}, () => worker())
    );
  }

  return (
    <SettingsCard
      title={t('uploadCardTitle')}
      description={t('uploadCardDescription')}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">{t('uploadHint')}</p>

          <div className="flex flex-wrap gap-3">
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFilesChange}
            />

            <Button
              type="button"
              variant="outline"
              isLoading={isUploading}
              loadingText={t('uploading')}
              onClick={() => inputRef.current?.click()}
            >
              {t('uploadButton')}
            </Button>
          </div>
        </div>

        {total > 0 ? (
          <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between text-sm font-medium text-slate-700">
              <span>{t('bulkProgress', {done, total})}</span>
              {!isUploading && failed.length === 0 ? (
                <span className="text-green-700">{t('bulkAllDone')}</span>
              ) : null}
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[var(--color-primary)] transition-all"
                style={{width: `${total ? (done / total) * 100 : 0}%`}}
              />
            </div>

            {!isUploading && failed.length > 0 ? (
              <div className="mt-2 space-y-1 text-sm text-red-700">
                <p className="font-medium">
                  {t('bulkFailedCount', {count: failed.length})}
                </p>
                <ul className="list-inside list-disc">
                  {failed.map((item) => (
                    <li key={item.id} className="truncate">
                      {item.file.name}
                      {item.error ? `: ${item.error}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </SettingsCard>
  );
}
