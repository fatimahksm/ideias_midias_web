'use client';

import {useMemo, useState} from 'react';
import {useInfiniteQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import {SettingsCard} from '@/components/common/settings-card';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {hasAdminToken} from '@/lib/auth/token';
import {useAdminSession} from '@/features/admin-layout/hooks/use-admin-session';
import {deleteMedia, fetchMediaAsFile, getMediaPage, uploadMedia} from '../api';
import type {MediaFileType, MediaLibraryItem} from '../types';
import {ImageCropModal} from './image-crop-modal';
import {MediaLibraryCard} from './media-library-card';
import {MediaLibraryUploader} from './media-library-uploader';

type MediaFilter = 'ALL' | MediaFileType;

const ASPECT_PRESETS_KEY = [
  {labelKey: 'aspectSquare', value: 1} as const,
  {labelKey: 'aspectLandscape', value: 4 / 3} as const,
  {labelKey: 'aspectWide', value: 16 / 9} as const,
  {labelKey: 'aspectPortrait', value: 3 / 4} as const
];

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
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isLoadingEditFile, setIsLoadingEditFile] = useState(false);
  const [editAspect, setEditAspect] = useState(4 / 3);

  const sessionQuery = useAdminSession(hasAdminToken());

  // The library is read a page at a time: it grows with every upload, and
  // loading all of it was the screen's slowest part.
  const mediaQuery = useInfiniteQuery({
    queryKey: ['media-library', 'page', activeFilter],
    initialPageParam: 0,
    queryFn: ({pageParam}) => getMediaPage(activeFilter, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined
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

  const uploadCroppedMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('editSuccess'));
      await queryClient.invalidateQueries({queryKey: ['media-library']});
      setEditFile(null);
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  const canDelete = sessionQuery.data?.role === 'SUPER_ADMIN';

  const items = useMemo(
    () => mediaQuery.data?.pages.flatMap((page) => page.content) ?? [],
    [mediaQuery.data]
  );

  const totalCount =
    mediaQuery.data?.pages[0]?.totalElements ?? items.length;

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

  async function handleEdit(item: MediaLibraryItem) {
    setFeedback('');
    setEditAspect(4 / 3);
    setIsLoadingEditFile(true);

    try {
      const file = await fetchMediaAsFile(item);
      setEditFile(file);
    } catch {
      setFeedbackTone('error');
      setFeedback(t('editLoadFailed'));
    } finally {
      setIsLoadingEditFile(false);
    }
  }

  function handleCloseCrop() {
    setEditFile(null);
  }

  async function handleApplyCrop(croppedFile: File, croppedPreviewUrl: string) {
    await uploadCroppedMutation.mutateAsync(croppedFile);
    URL.revokeObjectURL(croppedPreviewUrl);
  }

  const aspectPresets = ASPECT_PRESETS_KEY.map((preset) => ({
    label: t(preset.labelKey),
    value: preset.value
  }));

  return (
    <div className="space-y-6">
      {/*
        The uploader now handles a batch of files and shows its own
        progress and any per-file failures inline, so a blanket "uploaded
        successfully" banner here would be wrong when some files fail.
      */}
      <MediaLibraryUploader />

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
                {t('resultsCount', {count: totalCount})}
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
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {mediaQuery.hasNextPage ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                isLoading={mediaQuery.isFetchingNextPage}
                loadingText={common('loading')}
                onClick={() => mediaQuery.fetchNextPage()}
              >
                {t('loadMore')}
              </Button>
            </div>
          ) : null}
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

      {isLoadingEditFile ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-xl">
            {common('loading')}
          </div>
        </div>
      ) : null}

      <ImageCropModal
        open={Boolean(editFile)}
        file={editFile}
        title={t('editModalTitle')}
        description={t('editModalDescription')}
        zoomLabel={t('editZoomLabel')}
        resetLabel={t('editResetLabel')}
        cancelLabel={common('cancel')}
        confirmLabel={t('editConfirm')}
        helperText={t('editHelperText')}
        loadImageErrorText={t('editLoadFailed')}
        cropCanvasErrorText={t('editCropCanvasError')}
        generateBlobErrorText={t('editGenerateBlobError')}
        cropFailedErrorText={t('editCropFailed')}
        aspect={editAspect}
        aspectPresets={aspectPresets}
        onAspectSelect={setEditAspect}
        isApplying={uploadCroppedMutation.isPending}
        onClose={handleCloseCrop}
        onApply={handleApplyCrop}
      />
    </div>
  );
}