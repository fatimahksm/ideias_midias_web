'use client';

import {useRef, useState} from 'react';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {uploadMedia} from '@/features/media-library/api';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
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

  const [isUploading, setIsUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

    const invalidFile = files.find((file) => !file.type.startsWith('image/'));

    if (invalidFile) {
      setSuccessMessage('');
      setLocalError(t('invalidImagesOnly'));
      resetInput();
      return;
    }

    setIsUploading(true);
    setLocalError('');
    setSuccessMessage('');

    try {
      for (const [index, file] of files.entries()) {
        const uploaded = await uploadMedia(file);

        if (!uploaded.fileUrl) {
          throw new Error(t('uploadFailed'));
        }

        await createPortfolioProjectMedia({
          projectId,
          mediaType: 'IMAGE',
          mediaUrl: uploaded.fileUrl,
          thumbnailUrl: null,
          altTextPt: null,
          altTextEn: null,
          isActive: true,
          sortOrder: nextSortOrder + index
        });
      }

      setSuccessMessage(
        t('bulkSuccess', {
          count: files.length
        })
      );

      if (onCompleted) {
        await onCompleted();
      }
    } catch (error) {
      setSuccessMessage('');
      setLocalError(
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
            accept="image/*"
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
            {t('selectImages')}
          </Button>
        </div>
      </div>

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {localError ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : null}
    </div>
  );
}