'use client';

import {useEffect, useRef} from 'react';
import {MapPin} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import {OSM_RASTER_STYLE} from '@/lib/map/tile-style';

type Props = {
  lat: number;
  lng: number;
  title: string;
  address?: string | null;
  openInMapsLabel: string;
  googleMapsUrl?: string | null;
};

const MAP_ZOOM = 15;

function createMarkerElement() {
  const wrapper = document.createElement('div');
  wrapper.style.width = '34px';
  wrapper.style.height = '46px';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'center';
  wrapper.style.justifyContent = 'center';
  wrapper.style.position = 'relative';

  wrapper.innerHTML = `
    <div style="
      position: relative;
      width: 26px;
      height: 26px;
      border-radius: 9999px;
      background: var(--color-primary);
      border: 4px solid #ffffff;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.22);
    ">
      <div style="
        position: absolute;
        left: 50%;
        bottom: -8px;
        width: 12px;
        height: 12px;
        background: var(--color-primary);
        transform: translateX(-50%) rotate(45deg);
        border-bottom-right-radius: 3px;
        z-index: -1;
      "></div>
    </div>
  `;

  return wrapper;
}

function createPopupContent(
  title: string,
  address?: string | null,
  googleMapsUrl?: string | null,
  openInMapsLabel?: string
) {
  const container = document.createElement('div');
  container.style.minWidth = '180px';

  const content = document.createElement('div');
  content.className = 'min-w-[180px] space-y-2';

  const titleEl = document.createElement('p');
  titleEl.className = 'text-sm font-bold text-slate-900';
  titleEl.textContent = title;

  content.appendChild(titleEl);

  if (address) {
    const addressEl = document.createElement('p');
    addressEl.className = 'text-xs leading-5 text-slate-600';
    addressEl.textContent = address;
    content.appendChild(addressEl);
  }

  if (googleMapsUrl && openInMapsLabel) {
    const link = document.createElement('a');
    link.href = googleMapsUrl;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.className =
      'inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800';
    link.textContent = openInMapsLabel;

    content.appendChild(link);
  }

  container.appendChild(content);
  return container;
}

export default function PublicLocationMap({
  lat,
  lng,
  title,
  address,
  openInMapsLabel,
  googleMapsUrl
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OSM_RASTER_STYLE,
      center: [lng, lat],
      zoom: MAP_ZOOM,
      minZoom: 3,
      maxZoom: 18,
      scrollZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      attributionControl: {}
    });

    mapRef.current = map;

    map.on('error', (event) => {
      console.error('MapLibre error:', event.error);
    });

    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: false
      }),
      'top-right'
    );

    const popup = new maplibregl.Popup({
      offset: 28,
      closeButton: false,
      closeOnClick: false
    }).setDOMContent(
      createPopupContent(title, address, googleMapsUrl, openInMapsLabel)
    );

    popupRef.current = popup;

    const marker = new maplibregl.Marker({
      element: createMarkerElement(),
      anchor: 'bottom'
    })
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map);

    markerRef.current = marker;

    map.on('load', () => {
      if (!marker.getPopup()?.isOpen()) {
        marker.togglePopup();
      }
    });

    return () => {
      popupRef.current?.remove();
      popupRef.current = null;
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, title, address, googleMapsUrl, openInMapsLabel]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    const popup = popupRef.current;

    if (!map || !marker || !popup) return;

    map.easeTo({
      center: [lng, lat],
      zoom: MAP_ZOOM,
      duration: 700
    });

    marker.setLngLat([lng, lat]);

    popup.setDOMContent(
      createPopupContent(title, address, googleMapsUrl, openInMapsLabel)
    );

    marker.setPopup(popup);

    if (!marker.getPopup()?.isOpen()) {
      marker.togglePopup();
    }
  }, [lat, lng, title, address, googleMapsUrl, openInMapsLabel]);

  return (
    <div className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
      <div className="relative h-[520px] w-full">
        <div ref={mapContainerRef} className="h-full w-full" />

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