import type {StyleSpecification} from 'maplibre-gl';

/**
 * Satellite photo tiles with place/road labels on top — used by both the
 * admin location picker and the public map so they show the same view,
 * closer to how Google Maps' satellite mode looks. Esri's World Imagery +
 * World Boundaries and Places services are free to use and need no API key
 * or account, unlike Google Maps tiles.
 */
export const SATELLITE_RASTER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'esri-imagery': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Esri, Maxar, Earthstar Geographics'
    },
    'esri-labels': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256
    }
  },
  layers: [
    {
      id: 'esri-imagery',
      type: 'raster',
      source: 'esri-imagery'
    },
    {
      id: 'esri-labels',
      type: 'raster',
      source: 'esri-labels'
    }
  ]
};
