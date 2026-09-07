'use client';

import {useMemo, useState} from 'react';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  CircleX,
  ImageIcon,
  LoaderCircle,
  Play
} from 'lucide-react';
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

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  if (preparedMedia.length === 1) {
    const only = preparedMedia[0];
    const onlyAlt =
      getLocalizedValue(locale, only.altTextPt, only.altTextEn) || title;

    return (
      <>
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          className="relative block aspect-[16/10] w-full overflow-hidden bg-[var(--color-surface-muted)]"
        >
          {only.mediaType === 'IMAGE' ? (
            <Image src={only.mediaUrl || ''} alt={onlyAlt} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900 text-white">
              <Play className="h-10 w-10" />
            </div>
          )}
        </button>

        {lightboxIndex !== null ? (
          <MediaLightbox
            locale={locale}
            title={title}
            media={preparedMedia}
            activeIndex={lightboxIndex}
            onChangeIndex={setLightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 p-1">
        {preparedMedia.map((item, index) => {
          const alt =
            getLocalizedValue(locale, item.altTextPt, item.altTextEn) || '';
          const thumbnailUrl =
            item.mediaType === 'IMAGE'
              ? item.thumbnailUrl || item.mediaUrl || ''
              : item.thumbnailUrl || '';

          return (
            <button
              key={`${item.id}-${index}`}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-surface-muted)]"
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={alt || title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-900" />
              )}

              {item.mediaType === 'VIDEO' ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[var(--color-text)]">
                    <Play className="ml-0.5 h-4 w-4" />
                  </div>
                </div>
              ) : null}

              {alt ? (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-4">
                  <p className="truncate text-[11px] font-semibold text-white">{alt}</p>
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {lightboxIndex !== null ? (
        <MediaLightbox
          locale={locale}
          title={title}
          media={preparedMedia}
          activeIndex={lightboxIndex}
          onChangeIndex={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

function MediaLightbox({
  locale,
  title,
  media,
  activeIndex,
  onChangeIndex,
  onClose
}: {
  locale: string;
  title: string;
  media: GalleryMediaItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
}) {
  const activeMedia = media[activeIndex];
  const activeAlt =
    getLocalizedValue(locale, activeMedia.altTextPt, activeMedia.altTextEn) ||
    title;

  const activeEmbedUrl =
    activeMedia.mediaType === 'VIDEO'
      ? toEmbeddableVideoUrl(activeMedia.mediaUrl)
      : null;

  const hasMultiple = media.length > 1;

  const goToPrevious = () => {
    onChangeIndex((activeIndex - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    onChangeIndex((activeIndex + 1) % media.length);
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
      >
        <CircleX className="h-5 w-5" />
      </button>

      <div
        className="relative flex h-full w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {activeMedia.mediaType === 'IMAGE' ? (
          <Image
            src={activeMedia.mediaUrl || ''}
            alt={activeAlt}
            fill
            className="object-contain"
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
            className="h-full w-full object-contain"
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
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              aria-label="Next"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        ) : null}

        {getLocalizedValue(locale, activeMedia.altTextPt, activeMedia.altTextEn) ? (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-1.5 text-sm font-semibold text-white">
            {getLocalizedValue(locale, activeMedia.altTextPt, activeMedia.altTextEn)}
          </div>
        ) : null}
      </div>
    </div>
  );
}