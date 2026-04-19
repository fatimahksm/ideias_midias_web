'use client';

import {useMemo, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {hasAdminToken} from '@/lib/auth/token';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {deleteMedia, getAllMedia, getMediaByType} from '../api';
import type {MediaFileType, MediaLibraryItem} from '../types';
import {sortMediaNewestFirst} from '../utils';
import {MediaLibraryCard} from './media-library-card';
import {MediaLibraryUploader} from './media-library-uploader';

type MediaFilter = 'ALL' | MediaFileType;

export default function MediaLibraryManager() {
  const t = useTranslations('MediaLibraryManager');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();

  const [activeFilter, setActiveFilter] = useState<MediaFilter>('ALL');
  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );
  const [deleteTarget, setDeleteTarget] = useState<MediaLibraryItem | null>(
    null
  );

  const sessionQuery = useAdminSession(hasAdminToken());

  const mediaQuery = useQuery({
    queryKey: ['media-library', activeFilter],
    queryFn: async () => {
      const items =
        activeFilter === 'ALL'
          ? await getAllMedia()
          : await getMediaByType(activeFilter);

      return sortMediaNewestFirst(items);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMedia,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('deleteSuccess'));
      await queryClient.invalidateQueries({queryKey: ['media-library']});
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(() => mediaQuery.data ?? [], [mediaQuery.data]);

  async function handleCopyUrl(item: MediaLibraryItem) {
    try {
      await navigator.clipboard.writeText(item.fileUrl);
      setFeedbackTone('success');
      setFeedback(t('copySuccess'));
    } catch {
      setFeedbackTone('error');
      setFeedback(t('copyFailed'));
    }
  }

  function handleDelete(item: MediaLibraryItem) {
    setDeleteTarget(item);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setFeedback('');
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-6">
      <MediaLibraryUploader
        onUploaded={() => {
          setFeedbackTone('success');
          setFeedback(t('uploadSuccess'));
        }}
      />

      <SettingsCard
        title={t('libraryCardTitle')}
        description={t('libraryCardDescription')}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={activeFilter === 'ALL' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('ALL')}
              >
                {t('allFilter')}
              </Button>

              <Button
                type="button"
                variant={activeFilter === 'IMAGE' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('IMAGE')}
              >
                {t('imageFilter')}
              </Button>

              <Button
                type="button"
                variant={activeFilter === 'VIDEO' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('VIDEO')}
              >
                {t('videoFilter')}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-slate-500">
                {t('resultsCount', {count: items.length})}
              </p>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                isLoading={mediaQuery.isFetching}
                loadingText={common('loading')}
                onClick={() =>
                  queryClient.invalidateQueries({queryKey: ['media-library']})
                }
              >
                {t('refresh')}
              </Button>
            </div>
          </div>

          {feedback ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                feedbackTone === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {feedback}
            </div>
          ) : null}

          {mediaQuery.isPending ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-600">
              {common('loading')}
            </div>
          ) : mediaQuery.isError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
              {getErrorMessage(toAppError(mediaQuery.error), (key) => errorT(key))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="text-base font-semibold text-slate-800">
                {t('emptyTitle')}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {t('emptyDescription')}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {items.map((item) => (
                <MediaLibraryCard
                  key={item.id}
                  item={item}
                  canDelete={canDelete}
                  isDeleting={
                    deleteMutation.isPending &&
                    deleteMutation.variables === item.id
                  }
                  onCopyUrl={handleCopyUrl}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </SettingsCard>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={t('deleteDialogTitle')}
        description={
          deleteTarget
            ? t('deleteConfirm', {name: deleteTarget.originalName})
            : ''
        }
        confirmLabel={t('deleteAction')}
        cancelLabel={common('cancel')}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
        tone="danger"
      />
    </div>
  );
}