'use client';

import {useEffect, useMemo, useRef, useState} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {MediaPreview} from '@/components/common/media-preview';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '../api';
import type {MediaFileType} from '../types';

type Props = {
  label: string;
  value?: string | null;
  type: MediaFileType;
  onChange: (value: string | null) => void;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  ''
).replace(/\/$/, '');

function isAbsoluteUrl(url: string) {
  return /^https?:\/\//i.test(url);
}

function isBlobOrDataUrl(url: string) {
  return url.startsWith('blob:') || url.startsWith('data:');
}

function resolveMediaUrl(url?: string | null) {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  if (isAbsoluteUrl(trimmed) || isBlobOrDataUrl(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return API_BASE_URL ? `${API_BASE_URL}${trimmed}` : trimmed;
  }

  return API_BASE_URL ? `${API_BASE_URL}/${trimmed}` : `/${trimmed}`;
}

function extractUploadedFileUrl(uploaded: any): string | null {
  return (
    uploaded?.fileUrl ||
    uploaded?.data?.fileUrl ||
    uploaded?.data?.data?.fileUrl ||
    uploaded?.url ||
    uploaded?.data?.url ||
    uploaded?.path ||
    uploaded?.data?.path ||
    null
  );
}

export function MediaUploadField({label, value, type, onChange}: Props) {
  const t = useTranslations('MediaUploadField');
  const errorT = useTranslations('CommonErrors');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [localError, setLocalError] = useState('');
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);

  const uploadMutation = useMutation({
    mutationFn: uploadMedia
  });

  const previewUrl = useMemo(() => {
    return tempPreviewUrl || resolveMediaUrl(value);
  }, [tempPreviewUrl, value]);

  useEffect(() => {
    return () => {
      if (tempPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(tempPreviewUrl);
      }
    };
  }, [tempPreviewUrl]);

  function validateFile(file: File) {
    if (type === 'IMAGE' && !file.type.startsWith('image/')) {
      return t('invalidImage');
    }

    if (type === 'VIDEO' && !file.type.startsWith('video/')) {
      return t('invalidVideo');
    }

    return '';
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);

    if (validationError) {
      setLocalError(validationError);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setLocalError('');

    const blobUrl = URL.createObjectURL(file);

    setTempPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return blobUrl;
    });

    try {
      const uploaded = await uploadMutation.mutateAsync(file);
      const uploadedFileUrl = extractUploadedFileUrl(uploaded);

      if (!uploadedFileUrl) {
        throw new Error(t('uploadFailed'));
      }

      onChange(uploadedFileUrl);

      setTempPreviewUrl((previous) => {
        if (previous?.startsWith('blob:')) {
          URL.revokeObjectURL(previous);
        }
        return null;
      });
    } catch (error) {
      const appError = toAppError(error);
      setLocalError(
        getErrorMessage(appError, (key) => errorT(key)) || t('uploadFailed')
      );
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleRemove() {
    setLocalError('');

    setTempPreviewUrl((previous) => {
      if (previous?.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return null;
    });

    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <MediaPreview
        label={label}
        url={previewUrl}
        type={type === 'VIDEO' ? 'video' : 'image'}
        emptyText={t('noFileSelected')}
      />

      <div className="flex flex-wrap gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={type === 'IMAGE' ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
          className="hidden"
          id={`${label}-${type}-upload`}
        />

        <Button
          type="button"
          variant="outline"
          isLoading={uploadMutation.isPending}
          loadingText={t('uploading')}
          onClick={() => inputRef.current?.click()}
        >
          {value || tempPreviewUrl
            ? type === 'IMAGE'
              ? t('replaceImage')
              : t('replaceVideo')
            : type === 'IMAGE'
              ? t('uploadImage')
              : t('uploadVideo')}
        </Button>

        {value || tempPreviewUrl ? (
          <Button
            type="button"
            variant="ghost"
            onClick={handleRemove}
          >
            {t('remove')}
          </Button>
        ) : null}
      </div>

      {localError ? (
        <p className="text-sm text-red-600">{localError}</p>
      ) : null}
    </div>
  );
}