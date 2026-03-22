'use client';

import {useRef, useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useTranslations} from 'next-intl';
import {SettingsCard} from '@/components/common/settings-card';
import {Button} from '@/components/ui/button';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '../api';

type Props = {
  onUploaded?: () => void;
};

export function MediaLibraryUploader({onUploaded}: Props) {
  const t = useTranslations('MediaLibraryManager');
  const errorT = useTranslations('CommonErrors');
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [feedback, setFeedback] = useState('');
  const [feedbackTone, setFeedbackTone] = useState<'success' | 'error'>(
    'success'
  );

  const uploadMutation = useMutation({
    mutationFn: uploadMedia,
    onSuccess: async () => {
      setFeedbackTone('success');
      setFeedback(t('uploadSuccess'));
      await queryClient.invalidateQueries({queryKey: ['media-library']});
      onUploaded?.();
    },
    onError: (error) => {
      setFeedbackTone('error');
      setFeedback(getErrorMessage(toAppError(error), (key) => errorT(key)));
    }
  });

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFeedback('');

    try {
      await uploadMutation.mutateAsync(file);
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
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
              className="hidden"
              onChange={handleFileChange}
            />

            <Button
              type="button"
              variant="outline"
              isLoading={uploadMutation.isPending}
              loadingText={t('uploading')}
              onClick={() => inputRef.current?.click()}
            >
              {t('uploadButton')}
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
      </div>
    </SettingsCard>
  );
}