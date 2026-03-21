'use client';

import {useEffect, useMemo, useState} from 'react';
import type {LeafletMouseEvent, LatLngExpression} from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents
} from 'react-leaflet';
import {useTranslations} from 'next-intl';
import {Button} from '@/components/ui/button';

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
};

const DEFAULT_CENTER: LatLngExpression = [33.8938, 35.5018]; // Beirut

function buildMapUrl(lat: number, lng: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
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

function RecenterMap({lat, lng}: {lat?: number; lng?: number}) {
  const map = useMap();

  useEffect(() => {
    if (lat == null || lng == null) return;
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);

  return null;
}

function ClickHandler({
  onPick
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onPick(event.latlng.lat, event.latlng.lng);
    }
  });

  return null;
}

export default function MapPickerField({lat, lng, onChange}: Props) {
  const t = useTranslations('MapPickerField');
  const common = useTranslations('Common');

  const [isLocating, setIsLocating] = useState(false);
  const [localError, setLocalError] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');

  const center = useMemo<LatLngExpression>(() => {
    if (lat != null && lng != null) {
      return [lat, lng];
    }

    return DEFAULT_CENTER;
  }, [lat, lng]);

  async function handlePick(nextLat: number, nextLng: number) {
    setLocalError('');

    try {
      const address = await reverseGeocode(nextLat, nextLng);

      setSelectedAddress(address);

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
    }
  }

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
        await handlePick(position.coords.latitude, position.coords.longitude);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--color-text)]">
            {t('label')}
          </p>
          <p className="text-sm text-slate-500">{t('clickHint')}</p>
        </div>

        <Button
          type="button"
          variant="outline"
          isLoading={isLocating}
          loadingText={t('locating')}
          onClick={handleUseMyLocation}
        >
          {t('useMyLocation')}
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200">
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-[360px] w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ClickHandler onPick={handlePick} />
          <RecenterMap lat={lat} lng={lng} />

          {lat != null && lng != null ? (
            <CircleMarker
              center={[lat, lng]}
              radius={10}
              pathOptions={{
                color: '#0f172a',
                fillColor: '#2563eb',
                fillOpacity: 0.9
              }}
            >
              <Popup>
                {t('selectedCoordinates')}: {lat.toFixed(6)}, {lng.toFixed(6)}
              </Popup>
            </CircleMarker>
          ) : null}
        </MapContainer>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-sm font-medium text-[var(--color-text)]">
            {t('selectedCoordinates')}
          </p>
          <p className="text-sm text-slate-600">
            {lat != null && lng != null
              ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
              : common('notAvailable')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-1 text-sm font-medium text-[var(--color-text)]">
            {t('selectedAddress')}
          </p>
          <p className="text-sm text-slate-600">
            {selectedAddress || common('notAvailable')}
          </p>
        </div>
      </div>

      {localError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {localError}
        </div>
      ) : null}
    </div>
  );
}