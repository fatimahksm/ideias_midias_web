'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {uploadMedia} from '@/features/media-library/api';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {useToast} from '@/components/common/toast-provider';
import {createPortfolioProjectMedia} from '../api';

type Props = {
  projectId: number;
  nextSortOrder: number;
  onCompleted?: () => Promise<void> | void;
};

export function PortfolioProjectMediaBulkUploader({
  projectId,
  nextSortOrder,
  onCompleted
}: Props) {
  const t = useTranslations('PortfolioProjectMediaBulkUploader');
  const errorT = useTranslations('CommonErrors');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const {showSuccess, showError} = useToast();
  const [isUploading, setIsUploading] = useState(false);

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith('image/') && !file.type.startsWith('video/')
    );

    if (invalidFile) {
      showError(t('invalidMediaOnly'));
      resetInput();
      return;
    }

    setIsUploading(true);

    try {
      for (const [index, file] of files.entries()) {
        const uploaded = await uploadMedia(file);

        if (!uploaded.fileUrl) {
          throw new Error(t('uploadFailed'));
        }

        await createPortfolioProjectMedia({
          projectId,
          mediaType:
            uploaded.fileType ??
            (file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE'),
          mediaUrl: uploaded.fileUrl,
          thumbnailUrl: null,
          altTextPt: null,
          altTextEn: null,
          isActive: true,
          sortOrder: nextSortOrder + index
        });
      }

      showSuccess(
        t('bulkSuccess', {
          count: files.length
        })
      );

      if (onCompleted) {
        await onCompleted();
      }
    } catch (error) {
      showError(
        getErrorMessage(toAppError(error), (key) => errorT(key)) ||
          t('uploadFailed')
      );
    } finally {
      setIsUploading(false);
      resetInput();
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t('title')}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
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
            onClick={() => inputRef.current?.click()}
            isLoading={isUploading}
            loadingText={t('uploading')}
          >
            {t('selectMedia')}
          </Button>
        </div>
      </div>

    </div>
  );
}
