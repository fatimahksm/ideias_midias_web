export function getLocalizedValue(
  locale: string,
  pt?: string | null,
  en?: string | null
) {
  if (locale === 'pt') {
    return pt?.trim() || en?.trim() || '';
  }

  return en?.trim() || pt?.trim() || '';
}

export function buildMapsUrl(
  locale: string,
  options: {
    locationLat?: number | null;
    locationLng?: number | null;
    addressPt?: string | null;
    addressEn?: string | null;
  }
) {
  if (options.locationLat != null && options.locationLng != null) {
    return `https://www.google.com/maps?q=${options.locationLat},${options.locationLng}`;
  }

  const address = getLocalizedValue(
    locale,
    options.addressPt,
    options.addressEn
  );

  if (!address) return null;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function toEmbeddableVideoUrl(url?: string | null) {
  const value = url?.trim();

  if (!value) return null;

  try {
    const parsed = new URL(value);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname.includes('youtu.be')) {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname.includes('youtube.com')) {
      if (parsed.pathname.includes('/embed/')) {
        return value;
      }

      const videoId = parsed.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (hostname.includes('vimeo.com')) {
      if (parsed.pathname.includes('/video/')) {
        return value;
      }

      const videoId = parsed.pathname.split('/').filter(Boolean).pop();
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}`
        : null;
    }

    return null;
  } catch {
    return null;
  }
}

export function isEmbeddableVideoUrl(url?: string | null) {
  return Boolean(toEmbeddableVideoUrl(url));
}