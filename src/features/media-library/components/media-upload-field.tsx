'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {ImageIcon, UploadCloud, Video as VideoIcon, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/cn';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '../api';
import type {MediaFileType} from '../types';
import {resolveMediaUrl} from '../utils';
import {ImageCropModal} from './image-crop-modal';

type Props = {
  label: string;
  value?: string | null;
  type: MediaFileType;
  onChange: (value: string | null) => void;
  cropAspect?: number;
  cropShape?: 'rect' | 'round';
  /** Optional guidance shown under the dropzone, e.g. recommended dimensions. */
  hint?: string;
};

export function MediaUploadField({
  label,
  value,
  type,
  onChange,
  cropAspect = 4 / 3,
  cropShape = 'rect',
  hint
}: Props) {
  const t = useTranslations('MediaUploadField');
  const common = useTranslations('Common');
  const errorT = useTranslations('CommonErrors');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [localError, setLocalError] = useState('');
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: uploadMedia
  });

  const isImage = type === 'IMAGE';

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
    if (isImage && !file.type.startsWith('image/')) {
      return t('invalidImage');
    }

    if (!isImage && !file.type.startsWith('video/')) {
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

  // Shared entry point for both the file picker and drag-and-drop.
  async function processFile(file: File) {
    const validationError = validateFile(file);

    if (validationError) {
      setLocalError(validationError);
      resetInputValue();
      return;
    }

    setLocalError('');

    if (isImage) {
      setCropFile(file);
      setIsCropOpen(true);
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    await uploadSelectedFile(file, blobUrl);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  async function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (uploadMutation.isPending) return;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  }

  function openPicker() {
    if (!uploadMutation.isPending) {
      inputRef.current?.click();
    }
  }

  async function handleApplyCrop(croppedFile: File, croppedPreviewUrl: string) {
    await uploadSelectedFile(croppedFile, croppedPreviewUrl);
    setCropFile(null);
    setIsCropOpen(false);
  }

  // "Use without cropping" — upload the original, untouched image.
  async function handleSkipCrop() {
    if (!cropFile) return;

    const fileToUpload = cropFile;
    setIsCropOpen(false);
    setCropFile(null);

    const blobUrl = URL.createObjectURL(fileToUpload);
    await uploadSelectedFile(fileToUpload, blobUrl);
  }

  function handleCloseCrop() {
    setCropFile(null);
    setIsCropOpen(false);
    resetInputValue();
  }

  function handleRemove(event: React.MouseEvent) {
    event.stopPropagation();
    setLocalError('');
    setCropFile(null);
    setIsCropOpen(false);
    replaceTempPreview(null);
    onChange(null);
    resetInputValue();
  }

  return (
    <>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>

        <input
          ref={inputRef}
          type="file"
          accept={isImage ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
          className="hidden"
          id={`${label}-${type}-upload`}
        />

        <div
          role="button"
          tabIndex={0}
          aria-label={hasPreview ? t('replaceHint') : t('uploadAria')}
          onClick={openPicker}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openPicker();
            }
          }}
          onDragOver={(event) => {
            event.preventDefault();
            if (!isDragging) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'group relative flex min-h-52 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-slate-50 text-center transition',
            isDragging
              ? 'border-[var(--color-primary)] bg-[var(--color-primary-soft)]'
              : 'border-slate-300 hover:border-[var(--color-primary)] hover:bg-white',
            uploadMutation.isPending && 'pointer-events-none opacity-70'
          )}
        >
          {hasPreview ? (
            <>
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl ?? ''}
                  alt={label}
                  className="h-52 w-full object-cover"
                />
              ) : (
                <video
                  src={previewUrl ?? ''}
                  className="h-52 w-full bg-black object-cover"
                />
              )}

              <div className="pointer-events-none absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/55 via-transparent to-transparent p-3 opacity-0 transition group-hover:opacity-100">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800">
                  <UploadCloud className="h-3.5 w-3.5" />
                  {t('replaceHint')}
                </span>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                aria-label={t('remove')}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm transition hover:bg-white hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 px-6 py-8">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                {isImage ? (
                  <ImageIcon className="h-6 w-6" />
                ) : (
                  <VideoIcon className="h-6 w-6" />
                )}
              </span>

              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {uploadMutation.isPending
                    ? t('uploading')
                    : isDragging
                      ? t('dropHere')
                      : isImage
                        ? t('dragOrClickImage')
                        : t('dragOrClickVideo')}
                </p>
                <p className="text-xs text-slate-500">
                  {isImage ? t('imageFormats') : t('videoFormats')}
                </p>
              </div>
            </div>
          )}
        </div>

        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}

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
        skipLabel={t('cropSkip')}
        helperText={t('cropHelperText')}
        loadImageErrorText={t('cropLoadImageError')}
        cropCanvasErrorText={t('cropCanvasError')}
        generateBlobErrorText={t('cropGenerateBlobError')}
        cropFailedErrorText={t('cropFailed')}
        aspect={cropAspect}
        cropShape={cropShape}
        isApplying={uploadMutation.isPending}
        onSkip={handleSkipCrop}
        onClose={handleCloseCrop}
        onApply={handleApplyCrop}
      />
    </>
  );
}
