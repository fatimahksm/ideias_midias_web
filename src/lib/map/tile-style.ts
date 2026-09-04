import type {StyleSpecification} from 'maplibre-gl';

/**
 * Plain OpenStreetMap raster tiles — used by both the admin location picker
 * and the public map so they show the same data. A prettier vector style
 * (CARTO Voyager) was tried for the admin picker, but its place-label
 * coverage is much thinner outside a handful of major cities, so a real
 * address can end up on an almost blank map. Standard OSM tiles carry the
 * richer local data (street names, shops, landmarks) everywhere the public
 * map already relies on.
 */
export const OSM_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm'
    }
  ]
};
