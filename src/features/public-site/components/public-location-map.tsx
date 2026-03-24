'use client';

import {MapPin} from 'lucide-react';
import {MapContainer, Marker, Popup, TileLayer} from 'react-leaflet';
import L from 'leaflet';

type Props = {
  lat: number;
  lng: number;
  title: string;
  address?: string | null;
  openInMapsLabel: string;
  googleMapsUrl?: string | null;
};

const markerIcon = new L.DivIcon({
  className: 'public-location-pin',
  html: `
    <div style="
      width: 44px;
      height: 44px;
      border-radius: 9999px;
      background: var(--color-primary);
      border: 4px solid white;
      box-shadow: 0 12px 30px rgba(0,0,0,0.22);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    ">
      <div style="
        width: 12px;
        height: 12px;
        border-radius: 9999px;
        background: white;
      "></div>
      <div style="
        position: absolute;
        bottom: -10px;
        left: 50%;
        transform: translateX(-50%);
        width: 14px;
        height: 14px;
        background: var(--color-primary);
        rotate: 45deg;
        border-bottom-right-radius: 4px;
        box-shadow: 8px 8px 18px rgba(0,0,0,0.12);
        z-index: -1;
      "></div>
    </div>
  `,
  iconSize: [44, 54],
  iconAnchor: [22, 48],
  popupAnchor: [0, -42]
});

export default function PublicLocationMap({
  lat,
  lng,
  title,
  address,
  openInMapsLabel,
  googleMapsUrl
}: Props) {
  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="relative h-[520px] w-full">
        <MapContainer
          center={[lat, lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={[lat, lng]} icon={markerIcon}>
            <Popup>
              <div className="min-w-[180px] space-y-2">
                <p className="text-sm font-bold text-slate-900">{title}</p>

                {address ? (
                  <p className="text-xs leading-5 text-slate-600">{address}</p>
                ) : null}

                {googleMapsUrl ? (
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    {openInMapsLabel}
                  </a>
                ) : null}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {googleMapsUrl ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
            <div className="pointer-events-auto rounded-[24px] border border-white/20 bg-white/94 p-4 shadow-xl backdrop-blur-md md:max-w-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
                  <MapPin className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-slate-950">{title}</p>

                  {address ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {address}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <MapPin className="h-4 w-4" />
                  {openInMapsLabel}
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}