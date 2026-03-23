'use client';

import {useEffect, useMemo, useState} from 'react';
import Image from 'next/image';
import {ImageIcon, LoaderCircle, Play} from 'lucide-react';
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
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-slate-100 text-slate-500">
        <div className="flex items-center gap-3 text-sm font-medium">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          <span>{loadingLabel}</span>
        </div>
      </div>
    );
  }

  if (!preparedMedia.length) {
    return (
      <div className="flex aspect-[16/10] w-full items-center justify-center bg-slate-100 text-slate-500">
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

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
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
      </div>

      {preparedMedia.length > 1 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {preparedMedia.map((mediaItem, index) => {
            const thumbAlt =
              getLocalizedValue(
                locale,
                mediaItem.altTextPt,
                mediaItem.altTextEn
              ) || `${title} ${index + 1}`;

            const resolvedThumbnailUrl =
              mediaItem.thumbnailUrl || mediaItem.mediaUrl || '';

            return (
              <button
                key={`${mediaItem.id}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`group relative overflow-hidden rounded-2xl border transition ${
                  safeActiveIndex === index
                    ? 'border-slate-950 ring-2 ring-slate-950/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  {mediaItem.mediaType === 'IMAGE' ? (
                    <Image
                      src={resolvedThumbnailUrl}
                      alt={thumbAlt}
                      fill
                      className="object-cover"
                    />
                  ) : mediaItem.thumbnailUrl ? (
                    <>
                      <Image
                        src={resolvedThumbnailUrl}
                        alt={thumbAlt}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-lg">
                          <Play className="ml-0.5 h-4 w-4" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center bg-slate-900 text-white">
                      <Play className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}