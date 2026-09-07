'use client';

import {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {ChevronLeft, ChevronRight, ImageIcon, LoaderCircle} from 'lucide-react';
import {resolveMediaUrl} from '@/lib/media/resolve-media-url';
import {getLocalizedValue, toEmbeddableVideoUrl} from '../utils';

type GalleryMediaItem = {
  id: number | string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  altTextPt?: string | null;
  altTextEn?: string | null;
};

type Props = {
  locale: string;
  title: string;
  media: GalleryMediaItem[];
  fallbackImageUrl?: string | null;
  fallbackVideoUrl?: string | null;
  isLoading?: boolean;
  loadingLabel: string;
  noMediaLabel: string;
};

function buildMediaList(
  media: GalleryMediaItem[],
  fallbackImageUrl?: string | null,
  fallbackVideoUrl?: string | null
) {
  const seen = new Set<string>();
  const result: GalleryMediaItem[] = [];

  const pushItem = (item: GalleryMediaItem | null) => {
    if (!item) return;

    const resolvedMediaUrl = resolveMediaUrl(item.mediaUrl);
    if (!resolvedMediaUrl) return;

    const resolvedThumbnailUrl = resolveMediaUrl(item.thumbnailUrl);
    const key = `${item.mediaType}:${resolvedMediaUrl}`;

    if (seen.has(key)) return;
    seen.add(key);

    result.push({
      ...item,
      mediaUrl: resolvedMediaUrl,
      thumbnailUrl: resolvedThumbnailUrl || null
    });
  };

  if (fallbackImageUrl) {
    pushItem({
      id: 'fallback-image',
      mediaType: 'IMAGE',
      mediaUrl: fallbackImageUrl
    });
  }

  if (fallbackVideoUrl) {
    pushItem({
      id: 'fallback-video',
      mediaType: 'VIDEO',
      mediaUrl: fallbackVideoUrl
    });
  }

  media.forEach(pushItem);

  return result;
}

export default function PublicMediaGallery({
  locale,
  title,
  media,
  fallbackImageUrl,
  fallbackVideoUrl,
  isLoading = false,
  loadingLabel,
  noMediaLabel
}: Props) {
  const preparedMedia = useMemo(
    () => buildMediaList(media, fallbackImageUrl, fallbackVideoUrl),
    [media, fallbackImageUrl, fallbackVideoUrl]
  );

  const mediaSignature = useMemo(
    () => preparedMedia.map((item) => `${item.id}:${item.mediaUrl}`).join('|'),
    [preparedMedia]
  );

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [mediaSignature]);

  if (isLoading && !preparedMedia.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <div className="flex items-center gap-3 text-sm font-medium">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span>{loadingLabel}</span>
        </div>
      </div>
    );
  }

  if (!preparedMedia.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <ImageIcon className="h-10 w-10" />
          <span className="text-sm font-medium">{noMediaLabel}</span>
        </div>
      </div>
    );
  }

  const safeActiveIndex =
    activeIndex >= preparedMedia.length ? 0 : activeIndex;

  const activeMedia = preparedMedia[safeActiveIndex];
  const activeAlt =
    getLocalizedValue(locale, activeMedia.altTextPt, activeMedia.altTextEn) ||
    title;

  const activeEmbedUrl =
    activeMedia.mediaType === 'VIDEO'
      ? toEmbeddableVideoUrl(activeMedia.mediaUrl)
      : null;

  const hasMultiple = preparedMedia.length > 1;

  const goToPrevious = () => {
    setActiveIndex(
      (safeActiveIndex - 1 + preparedMedia.length) % preparedMedia.length
    );
  };

  const goToNext = () => {
    setActiveIndex((safeActiveIndex + 1) % preparedMedia.length);
  };

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-surface-muted)]">
      {activeMedia.mediaType === 'IMAGE' ? (
        <Image
          src={activeMedia.mediaUrl || ''}
          alt={activeAlt}
          fill
          className="object-cover"
        />
      ) : activeEmbedUrl ? (
        <iframe
          src={activeEmbedUrl}
          title={activeAlt}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video
          className="h-full w-full object-cover"
          controls
          playsInline
          preload="metadata"
        >
          <source src={activeMedia.mediaUrl || ''} />
        </video>
      )}

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Previous"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      ) : null}
    </div>
  );
}