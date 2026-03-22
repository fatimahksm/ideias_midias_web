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

export function isEmbeddableVideoUrl(url?: string | null) {
  if (!url) return false;

  const normalized = url.toLowerCase();

  return (
    normalized.includes('youtube.com/embed') ||
    normalized.includes('youtube.com/watch') ||
    normalized.includes('youtu.be/') ||
    normalized.includes('vimeo.com/')
  );
}