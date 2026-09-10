import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';
import type Feature from 'ol/Feature';
import type { Geometry } from 'ol/geom';

import { createCommunityStyle } from '../styles/communityStyle';

/** Crea el mapa base OpenStreetMap y define si empieza visible. */
export function createOSMLayer(visible: boolean) {
  return new TileLayer({
    source: new OSM(),
    visible,
  });
}

/** Crea el mapa base de satélite de Google. */
export function createGoogleSatLayer(visible: boolean) {
  return new TileLayer({
    source: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    }),
    visible,
  });
}

/** Crea el mapa híbrido de Google, con satélite y etiquetas. */
export function createGoogleHybridLayer(visible: boolean) {
  return new TileLayer({
    source: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    }),
    visible,
  });
}

/**
 * Crea la capa vectorial de comunidades.
 */
export function createCommunityLayer(getZoom: () => number) {
  return new VectorLayer<VectorSource>({
    style: (feature) => createCommunityStyle(feature as Feature<Geometry>, getZoom),
  });
}
