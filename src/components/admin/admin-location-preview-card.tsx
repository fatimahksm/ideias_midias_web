'use client';

import {ExternalLink, MapPin, LocateFixed} from 'lucide-react';

type Props = {
  title?: string;
  address?: string | null;
  mapEmbedUrl?: string | null;
  mapsUrl?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
};

function hasMeaningfulText(value?: string | null) {
  return Boolean(value && value.trim().length > 0);
}

function normalizeMapEmbedUrl(url?: string | null) {
  if (!hasMeaningfulText(url)) return '';

  const value = url!.trim();

  if (value.includes('output=embed') || value.includes('/maps/embed')) {
    return value;
  }

  try {
    const parsed = new URL(value);

    const q =
      parsed.searchParams.get('q') ||
      parsed.searchParams.get('query') ||
      parsed.searchParams.get('destination');

    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
    }
  } catch {
    return '';
  }

  return '';
}

function buildMapEmbedUrl({
  mapEmbedUrl,
  locationLat,
  locationLng,
  address
}: {
  mapEmbedUrl?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  address?: string | null;
}) {
  const normalized = normalizeMapEmbedUrl(mapEmbedUrl);
  if (normalized) return normalized;

  if (
    typeof locationLat === 'number' &&
    !Number.isNaN(locationLat) &&
    typeof locationLng === 'number' &&
    !Number.isNaN(locationLng)
  ) {
    return `https://maps.google.com/maps?q=${locationLat},${locationLng}&z=15&output=embed`;
  }

  if (hasMeaningfulText(address)) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address!)}&z=15&output=embed`;
  }

  return '';
}

export function AdminLocationPreviewCard({
  title = 'Location preview',
  address,
  mapEmbedUrl,
  mapsUrl,
  locationLat,
  locationLng
}: Props) {
  const embedUrl = buildMapEmbedUrl({
    mapEmbedUrl,
    locationLat,
    locationLng,
    address
  });

  const hasCoords =
    typeof locationLat === 'number' &&
    !Number.isNaN(locationLat) &&
    typeof locationLng === 'number' &&
    !Number.isNaN(locationLng);

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">
            Preview
          </p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{title}</h3>
        </div>

        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-100"
          >
            <ExternalLink className="h-4 w-4" />
            Open in Maps
          </a>
        ) : null}
      </div>

      {embedUrl ? (
        <div className="relative">
          <iframe
            src={embedUrl}
            title={title}
            className="h-[420px] w-full"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
            <div className="pointer-events-auto rounded-[22px] border border-white/20 bg-white/92 p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                  <MapPin className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-950">Selected location</p>

                  {hasMeaningfulText(address) ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {address}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      No address yet
                    </p>
                  )}

                  {hasCoords ? (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                      <LocateFixed className="h-3.5 w-3.5" />
                      {locationLat}, {locationLng}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-[420px] flex-col justify-between bg-slate-50 p-6">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
              <MapPin className="h-7 w-7" />
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-950">
              No map preview yet
            </h3>

            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              Add an embed URL, coordinates, or address and the preview will appear here.
            </p>
          </div>

          {hasMeaningfulText(address) ? (
            <div className="rounded-[20px] border border-slate-200 bg-white p-4 text-sm text-slate-700">
              {address}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}