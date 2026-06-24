'use client';

import {useRef, useState, type ChangeEvent} from 'react';
import {useTranslations} from 'next-intl';
import {ImagePlus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {toAppError} from '@/lib/api/client';
import {getErrorMessage} from '@/lib/errors/get-error-message';
import {uploadMedia} from '@/features/media-library/api';
import {createContentBlock} from '../api';

type Props = {
  sectionId: number;
  /** sortOrder to assign to the first uploaded photo; the rest increment. */
  startSortOrder: number;
  onUploaded: (count: number) => void;
  onError: (message: string) => void;
};

/**
 * Lets the owner pick many images at once and turns each into its own IMAGE
 * content block, so building a photo gallery no longer means creating blocks
 * one by one and navigating in and out of the form for every single photo.
 */
export function BulkImageUpload({
  sectionId,
  startSortOrder,
  onUploaded,
  onError
}: Props) {
  const t = useTranslations('ContentBlocksManager');
  const errorT = useTranslations('CommonErrors');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({done: 0, total: 0});

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith('image/')
    );

    if (inputRef.current) {
      inputRef.current.value = '';
    }

    if (files.length === 0) return;

    setBusy(true);
    setProgress({done: 0, total: files.length});

    let created = 0;
    let firstError = '';

    // Sequential so the server isn't hit with a burst and sortOrder stays stable.
    for (let index = 0; index < files.length; index += 1) {
      try {
        const uploaded = await uploadMedia(files[index]);

        if (!uploaded.fileUrl) {
          throw new Error('upload failed');
        }

        await createContentBlock({
          sectionId,
          blockType: 'IMAGE',
          titlePt: null,
          titleEn: null,
          subtitlePt: null,
          subtitleEn: null,
          contentPt: null,
          contentEn: null,
          imageUrl: uploaded.fileUrl,
          videoUrl: null,
          isActive: true,
          sortOrder: startSortOrder + index
        });

        created += 1;
      } catch (error) {
        if (!firstError) {
          firstError = getErrorMessage(toAppError(error), (key) => errorT(key));
        }
      }

      setProgress({done: index + 1, total: files.length});
    }

    setBusy(false);
    setProgress({done: 0, total: 0});

    if (created > 0) {
      onUploaded(created);
    }

    if (firstError) {
      onError(firstError);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <Button
        type="button"
        variant="outline"
        isLoading={busy}
        loadingText={t('bulkUploadProgress', {
          done: progress.done,
          total: progress.total
        })}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="mr-2 h-4 w-4" />
        {t('bulkUploadButton')}
      </Button>
    </>
  );
}
