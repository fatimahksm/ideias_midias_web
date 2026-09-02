'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {MediaPreview} from '@/components/common/media-preview';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '../api';
import type {MediaFileType, MediaLibraryItem} from '../types';
import {isHeicFile, convertHeicToJpeg} from '../heic';
import {resolveMediaUrl} from '../utils';
import {ImageCropModal} from './image-crop-modal';
import {MediaLibraryPickerModal} from './media-library-picker-modal';

type Props = {
  label: string;
  value?: string | null;
  type: MediaFileType;
  onChange: (value: string | null) => void;
  cropAspect?: number;
  cropShape?: 'rect' | 'round';
};

export function MediaUploadField({
  label,
  value,
  type,
  onChange,
  cropAspect = 4 / 3,
  cropShape = 'rect'
}: Props) {
  const t = useTranslations('MediaUploadField');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [localError, setLocalError] = useState('');
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: uploadMedia
  });

  const previewUrl = useMemo(() => {
    return tempPreviewUrl || resolveMediaUrl(value);
  }, [tempPreviewUrl, value]);

  const hasPreview = Boolean(previewUrl);

  useEffect(() => {
    return () => {
      if (tempPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(tempPreviewUrl);
      }
    };
  }, [tempPreviewUrl]);

  function resetInputValue() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function replaceTempPreview(nextUrl: string | null) {
    setTempPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return nextUrl;
    });
  }

  function validateFile(file: File) {
    if (type === 'IMAGE' && !file.type.startsWith('image/') && !isHeicFile(file)) {
      return t('invalidImage');
    }

    if (type === 'VIDEO' && !file.type.startsWith('video/')) {
      return t('invalidVideo');
    }

    return '';
  }

  async function uploadSelectedFile(file: File, optimisticPreviewUrl?: string | null) {
    setLocalError('');

    if (optimisticPreviewUrl) {
      replaceTempPreview(optimisticPreviewUrl);
    }

    try {
      const uploaded = await uploadMutation.mutateAsync(file);

      if (!uploaded.fileUrl) {
        throw new Error(t('uploadFailed'));
      }

      onChange(uploaded.fileUrl);
      replaceTempPreview(null);
    } catch (error) {
      const appError = toAppError(error);
      setLocalError(
        getErrorMessage(appError, (key) => errorT(key)) || t('uploadFailed')
      );
    } finally {
      resetInputValue();
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    let file = event.target.files?.[0];
    if (!file) return;

    if (type === 'IMAGE' && isHeicFile(file)) {
      setLocalError('');
      setIsConvertingHeic(true);

      try {
        file = await convertHeicToJpeg(file);
      } catch {
        setLocalError(t('heicConversionFailed'));
        setIsConvertingHeic(false);
        resetInputValue();
        return;
      }

      setIsConvertingHeic(false);
    }

    const validationError = validateFile(file);

    if (validationError) {
      setLocalError(validationError);
      resetInputValue();
      return;
    }

    setLocalError('');

    if (type === 'IMAGE') {
      setCropFile(file);
      setIsCropOpen(true);
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    await uploadSelectedFile(file, blobUrl);
  }

  async function handleApplyCrop(croppedFile: File, croppedPreviewUrl: string) {
    await uploadSelectedFile(croppedFile, croppedPreviewUrl);
    setCropFile(null);
    setIsCropOpen(false);
  }

  function handleCloseCrop() {
    setCropFile(null);
    setIsCropOpen(false);
    resetInputValue();
  }

  function handleRemove() {
    setLocalError('');
    setCropFile(null);
    setIsCropOpen(false);
    replaceTempPreview(null);
    onChange(null);
    resetInputValue();
  }

  function handlePickFromLibrary(item: MediaLibraryItem) {
    setLocalError('');
    replaceTempPreview(null);
    onChange(item.fileUrl);
    setIsPickerOpen(false);
  }

  return (
    <>
      <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <MediaPreview
          label={label}
          url={previewUrl}
          type={type === 'VIDEO' ? 'video' : 'image'}
          emptyText={t('noFileSelected')}
        />

        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept={type === 'IMAGE' ? 'image/*,.heic,.heif' : 'video/*'}
            onChange={handleFileChange}
            className="hidden"
            id={`${label}-${type}-upload`}
          />

          <Button
            type="button"
            variant="outline"
            isLoading={uploadMutation.isPending || isConvertingHeic}
            loadingText={isConvertingHeic ? t('convertingHeic') : t('uploading')}
            onClick={() => inputRef.current?.click()}
          >
            {hasPreview
              ? type === 'IMAGE'
                ? t('replaceImage')
                : t('replaceVideo')
              : type === 'IMAGE'
                ? t('uploadImage')
                : t('uploadVideo')}
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsPickerOpen(true)}
          >
            {t('chooseFromLibrary')}
          </Button>

          {hasPreview ? (
            <Button type="button" variant="ghost" onClick={handleRemove}>
              {t('remove')}
            </Button>
          ) : null}
        </div>

        {localError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {localError}
          </div>
        ) : null}
      </div>

      <ImageCropModal
        open={isCropOpen}
        file={cropFile}
        title={t('cropTitle')}
        description={t('cropDescription')}
        zoomLabel={t('cropZoomLabel')}
        resetLabel={t('cropReset')}
        cancelLabel={common('cancel')}
        confirmLabel={t('cropConfirm')}
        helperText={t('cropHelperText')}
        loadImageErrorText={t('cropLoadImageError')}
        cropCanvasErrorText={t('cropCanvasError')}
        generateBlobErrorText={t('cropGenerateBlobError')}
        cropFailedErrorText={t('cropFailed')}
        aspect={cropAspect}
        cropShape={cropShape}
        isApplying={uploadMutation.isPending}
        onClose={handleCloseCrop}
        onApply={handleApplyCrop}
      />

      <MediaLibraryPickerModal
        open={isPickerOpen}
        type={type}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handlePickFromLibrary}
      />
    </>
  );
}