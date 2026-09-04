'use client';

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Link2,
  LoaderCircle,
  LocateFixed,
  MapPin,
  Maximize2,
  Search,
  X
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';
import {apiClient} from '@/lib/api/client';
import {endpoints} from '@/lib/api/endpoints';
import {getAdminToken} from '@/lib/auth/token';
import {SATELLITE_RASTER_STYLE} from '@/lib/map/tile-style';

type MapPickerValue = {
  lat: number;
  lng: number;
  address: string;
  mapUrl: string;
};

type Props = {
  lat?: number;
  lng?: number;
  onChange: (value: MapPickerValue) => void;
  /** 'modal' renders the same picker taller, without its own expand button — used when this component renders itself inside the expanded view. */
  variant?: 'inline' | 'modal';
};

type SearchPlaceResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

const DEFAULT_CENTER = {
  lat: 33.8938,
  lng: 35.5018
};

const DEFAULT_ZOOM = 14.5;
const SELECTED_ZOOM = 17;
const SEARCH_MIN_CHARS = 3;

function buildMapUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function isValidLatLng(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

const COORDINATE_PATTERNS = [
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
  /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
  /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/
];

/**
 * Reads coordinates straight out of a full Google Maps link, or out of a
 * bare "lat,lng" pasted from Maps' own "copy coordinates" action — no
 * network round trip needed. A shortened link (maps.app.goo.gl) has no
 * coordinates in the URL itself, so this returns null and the caller falls
 * back to asking the backend to resolve it.
 */
function extractLatLngFromText(raw: string): {lat: number; lng: number} | null {
  for (const pattern of COORDINATE_PATTERNS) {
    const match = raw.match(pattern);
    if (match) {
      const lat = Number(match[1]);
      const lng = Number(match[2]);
      if (isValidLatLng(lat, lng)) {
        return {lat, lng};
      }
    }
  }

  const bare = raw.trim().match(/^(-?\d{1,2}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (bare) {
    const lat = Number(bare[1]);
    const lng = Number(bare[2]);
    if (isValidLatLng(lat, lng)) {
      return {lat, lng};
    }
  }

  return null;
}

async function resolveGoogleMapsLink(url: string): Promise<{lat: number; lng: number}> {
  const token = getAdminToken();

  return apiClient<{lat: number; lng: number}>(endpoints.admin.resolveMapsLink, {
    method: 'POST',
    body: {url},
    token: token ?? undefined
  });
}

async function reverseGeocode(lat: number, lng: number) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }

  const data: {display_name?: string} = await response.json();
  return data.display_name || '';
}

async function searchPlaces(query: string, signal?: AbortSignal) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '6');
  url.searchParams.set('addressdetails', '1');

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json'
    },
    signal
  });

  if (!response.ok) {
    throw new Error('Place search failed');
  }

  return (await response.json()) as SearchPlaceResult[];
}

function createMarkerElement() {
  const wrapper = document.createElement('div');
  wrapper.style.width = '38px';
  wrapper.style.height = '52px';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.position = 'relative';

  wrapper.innerHTML = `
    <div style="
      position: relative;
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: #ef4444;
      border: 4px solid #ffffff;
      box-shadow: 0 16px 32px rgba(15, 23, 42, 0.28);
    ">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background: #ffffff;
        transform: translate(-50%, -50%);
      "></div>

      <div style="
        position: absolute;
        left: 50%;
        bottom: -8px;
        width: 12px;
        height: 12px;
        background: #ef4444;
        transform: translateX(-50%) rotate(45deg);
        border-bottom-right-radius: 3px;
        z-index: -1;
      "></div>
    </div>
  `;

  return wrapper;
}

function createPopupContent(label: string, lat: number, lng: number) {
  const container = document.createElement('div');
  container.style.minWidth = '170px';
  container.style.padding = '2px 0';

  const title = document.createElement('p');
  title.style.margin = '0 0 6px';
  title.style.fontSize = '12px';
  title.style.fontWeight = '700';
  title.style.color = '#0f172a';
  title.textContent = label;

  const coords = document.createElement('p');
  coords.style.margin = '0';
  coords.style.fontSize = '12px';
  coords.style.color = '#475569';
  coords.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  container.appendChild(title);
  container.appendChild(coords);

  return container;
}

export default function MapPickerField({lat, lng, onChange, variant = 'inline'}: Props) {
  const t = useTranslations('MapPickerField');
  const common = useTranslations('Common');

  const selectedCoordinatesLabel = useMemo(
    () => t('selectedCoordinates'),
    [t]
  );
  const mapLoadFailedLabel = useMemo(() => t('mapLoadFailed'), [t]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const handlePickRef = useRef<
    (nextLat: number, nextLng: number, addressOverride?: string) => Promise<void>
  >(async () => {});
  const lastResolvedCoordsRef = useRef('');
  const searchAbortRef = useRef<AbortController | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [localError, setLocalError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchPlaceResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [isResolvingLink, setIsResolvingLink] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLinkPanelOpen, setIsLinkPanelOpen] = useState(variant !== 'modal');

  const isBusy = isLocating || isResolving;

  const updateMarker = useCallback(
    (nextLat?: number, nextLng?: number) => {
      const map = mapRef.current;
      if (!map) return;

      if (nextLat == null || nextLng == null) {
        popupRef.current?.remove();
        popupRef.current = null;
        markerRef.current?.remove();
        markerRef.current = null;
        return;
      }

      const popupContent = createPopupContent(
        selectedCoordinatesLabel,
        nextLat,
        nextLng
      );

      if (!popupRef.current) {
        popupRef.current = new maplibregl.Popup({
          offset: 28,
          closeButton: false,
          closeOnClick: true
        });
      }

      popupRef.current.setDOMContent(popupContent);

      if (!markerRef.current) {
        markerRef.current = new maplibregl.Marker({
          element: createMarkerElement(),
          anchor: 'bottom'
        })
          .setLngLat([nextLng, nextLat])
          .setPopup(popupRef.current)
          .addTo(map);
      } else {
        markerRef.current
          .setLngLat([nextLng, nextLat])
          .setPopup(popupRef.current);
      }

      map.easeTo({
        center: [nextLng, nextLat],
        zoom: Math.max(map.getZoom(), SELECTED_ZOOM),
        duration: 700
      });
    },
    [selectedCoordinatesLabel]
  );

  const handlePick = useCallback(
    async (nextLat: number, nextLng: number, addressOverride?: string) => {
      setLocalError('');
      updateMarker(nextLat, nextLng);

      const coordsKey = `${nextLat.toFixed(6)},${nextLng.toFixed(6)}`;
      lastResolvedCoordsRef.current = coordsKey;

      if (addressOverride) {
        setSelectedAddress(addressOverride);
        setSearchQuery(addressOverride);

        onChange({
          lat: nextLat,
          lng: nextLng,
          address: addressOverride,
          mapUrl: buildMapUrl(nextLat, nextLng)
        });
        return;
      }

      setSelectedAddress('');
      setIsResolving(true);

      try {
        const address = await reverseGeocode(nextLat, nextLng);
        setSelectedAddress(address);
        setSearchQuery(address);

        onChange({
          lat: nextLat,
          lng: nextLng,
          address,
          mapUrl: buildMapUrl(nextLat, nextLng)
        });
      } catch {
        setLocalError(t('reverseFailed'));

        onChange({
          lat: nextLat,
          lng: nextLng,
          address: '',
          mapUrl: buildMapUrl(nextLat, nextLng)
        });
      } finally {
        setIsResolving(false);
      }
    },
    [onChange, t, updateMarker]
  );

  handlePickRef.current = handlePick;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = lat ?? DEFAULT_CENTER.lat;
    const initialLng = lng ?? DEFAULT_CENTER.lng;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: SATELLITE_RASTER_STYLE,
      center: [initialLng, initialLat],
      zoom: lat != null && lng != null ? SELECTED_ZOOM : DEFAULT_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: {}
    });

    mapRef.current = map;

    map.on('error', (event) => {
      console.error('MapLibre error:', event.error);
      setLocalError(mapLoadFailedLabel);
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false
      }),
      'top-right'
    );

    map.on('click', (event) => {
      setIsSearchOpen(false);
      setSearchResults([]);
      void handlePickRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    map.on('load', () => {
      updateMarker(lat, lng);
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      searchAbortRef.current?.abort();
      searchAbortRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, mapLoadFailedLabel, updateMarker]);

  useEffect(() => {
    updateMarker(lat, lng);
  }, [lat, lng, updateMarker]);

  useEffect(() => {
    if (lat == null || lng == null) {
      setSelectedAddress('');
      lastResolvedCoordsRef.current = '';
      return;
    }

    const coordsKey = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    if (coordsKey === lastResolvedCoordsRef.current) {
      return;
    }

    let cancelled = false;
    setIsResolving(true);

    void reverseGeocode(lat, lng)
      .then((address) => {
        if (cancelled) return;
        lastResolvedCoordsRef.current = coordsKey;
        setSelectedAddress(address);
        setSearchQuery(address);
      })
      .catch(() => {
        if (cancelled) return;
        setSelectedAddress('');
      })
      .finally(() => {
        if (cancelled) return;
        setIsResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  useEffect(() => {
    const term = searchQuery.trim();

    if (term.length < SEARCH_MIN_CHARS) {
      searchAbortRef.current?.abort();
      searchAbortRef.current = null;
      setSearchResults([]);
      setIsSearchOpen(false);
      setIsSearching(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      searchAbortRef.current?.abort();

      const controller = new AbortController();
      searchAbortRef.current = controller;

      setIsSearching(true);
      setLocalError('');

      void searchPlaces(term, controller.signal)
        .then((results) => {
          setSearchResults(results);
          setIsSearchOpen(true);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
          setSearchResults([]);
          setIsSearchOpen(false);
          setLocalError(t('searchFailed'));
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchQuery, t]);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setLocalError(t('geolocationUnsupported'));
      return;
    }

    setLocalError('');
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        await handlePick(
          position.coords.latitude,
          position.coords.longitude
        );
      },
      () => {
        setIsLocating(false);
        setLocalError(t('permissionDenied'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  }

  function handleSelectSearchResult(place: SearchPlaceResult) {
    const nextLat = Number(place.lat);
    const nextLng = Number(place.lon);

    setSearchQuery(place.display_name);
    setSearchResults([]);
    setIsSearchOpen(false);

    void handlePick(nextLat, nextLng, place.display_name);
  }

  function handleClearSearch() {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchOpen(false);
    setLocalError('');
  }

  async function handleUseLink() {
    const raw = linkInput.trim();
    if (!raw) return;

    setLinkError('');
    setLocalError('');

    const direct = extractLatLngFromText(raw);
    if (direct) {
      await handlePick(direct.lat, direct.lng);
      setLinkInput('');
      return;
    }

    setIsResolvingLink(true);
    try {
      const resolved = await resolveGoogleMapsLink(raw);
      await handlePick(resolved.lat, resolved.lng);
      setLinkInput('');
    } catch {
      setLinkError(t('linkResolveFailed'));
    } finally {
      setIsResolvingLink(false);
    }
  }

  return (
    <div className={variant === 'modal' ? 'flex h-full flex-col gap-4' : 'space-y-4'}>
      <div className="space-y-3">
        {variant === 'inline' ? (
          <div>
            <p className="text-sm font-medium text-[var(--color-text)]">
              {t('label')}
            </p>
            <p className="mt-1 text-sm text-slate-500">{t('clickHint')}</p>
          </div>
        ) : null}

        <div className="relative">
          <div className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              placeholder={t('searchPlaceholder')}
              className="h-full w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

            {isSearching ? (
              <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-slate-400" />
            ) : null}

            {!isSearching && searchQuery ? (
              <button
                type="button"
                onClick={handleClearSearch}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {isSearchOpen && searchResults.length > 0 ? (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_48px_rgba(15,23,42,0.16)]">
              {searchResults.map((place) => (
                <button
                  key={place.place_id}
                  type="button"
                  onClick={() => handleSelectSearchResult(place)}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <MapPin className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {place.display_name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={variant === 'inline' ? 'flex justify-between gap-3' : 'flex justify-end'}>
          {variant === 'inline' ? (
            <Button type="button" variant="ghost" onClick={() => setIsExpanded(true)}>
              <Maximize2 className="h-4 w-4" />
              {t('expandMap')}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            isLoading={isLocating}
            loadingText={t('locating')}
            onClick={handleUseMyLocation}
          >
            <LocateFixed className="h-4 w-4" />
            {t('useMyLocation')}
          </Button>
        </div>

        {variant === 'modal' && !isLinkPanelOpen ? (
          <button
            type="button"
            onClick={() => setIsLinkPanelOpen(true)}
            className="flex w-full items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-[var(--color-text)] transition hover:bg-slate-100"
          >
            <Link2 className="h-4 w-4 shrink-0 text-slate-500" />
            {t('pasteLinkLabel')}
          </button>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  {t('pasteLinkLabel')}
                </p>
                <p className="mt-1 text-sm text-slate-500">{t('pasteLinkHint')}</p>
              </div>

              {variant === 'modal' ? (
                <button
                  type="button"
                  onClick={() => setIsLinkPanelOpen(false)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={linkInput}
                onChange={(event) => {
                  setLinkInput(event.target.value);
                  setLinkError('');
                }}
                placeholder={t('pasteLinkPlaceholder')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />

              <Button
                type="button"
                variant="outline"
                disabled={!linkInput.trim()}
                isLoading={isResolvingLink}
                loadingText={t('resolvingLink')}
                onClick={handleUseLink}
              >
                {t('pasteLinkAction')}
              </Button>
            </div>

            {linkError ? (
              <p className="mt-2 text-sm text-red-600">{linkError}</p>
            ) : null}
          </div>
        )}
      </div>

      <div
        className={
          variant === 'modal'
            ? 'flex-1 min-h-0 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]'
            : 'overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_22px_70px_rgba(15,23,42,0.08)]'
        }
      >
        <div className={variant === 'modal' ? 'relative h-full' : 'relative'}>
          <div
            ref={mapContainerRef}
            className={variant === 'modal' ? 'h-full w-full' : 'h-[460px] w-full'}
          />

          {isBusy ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/25 backdrop-blur-[2px]">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/92 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {isLocating ? t('locating') : t('resolvingAddress')}
              </div>
            </div>
          ) : null}

          {lat != null && lng != null ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 md:p-5">
              <div className="pointer-events-auto rounded-[24px] border border-white/40 bg-white/94 p-4 shadow-xl backdrop-blur-md md:max-w-md">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950">
                      {t('selectedLocation')}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {selectedAddress || common('notAvailable')}
                    </p>

                    <p className="mt-2 text-xs font-medium text-slate-500">
                      {lat.toFixed(6)}, {lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {localError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : null}

      {variant === 'inline' && isExpanded ? (
        <div className="fixed inset-0 z-[150] flex flex-col bg-white">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-xl font-black text-slate-950">
                {t('expandedTitle')}
              </h3>
              <p className="mt-1 text-sm text-slate-500">{t('clickHint')}</p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
            >
              {t('doneButton')}
            </Button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
            <MapPickerField lat={lat} lng={lng} onChange={onChange} variant="modal" />
          </div>
        </div>
      ) : null}
    </div>
  );
}