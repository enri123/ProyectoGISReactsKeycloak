import { Map } from 'ol';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';

import TileWMS from 'ol/source/TileWMS';

import { Fill, Stroke, Style } from 'ol/style';
import type { RefObject } from 'react';

/**
 * ===========================================================
 * CAPAS BASE
 * ===========================================================
 */

export function createOSMLayer(fondo: string) {
  return new TileLayer({
    source: new OSM(),
    visible: fondo === 'osm',
  });
}

export function createGoogleSatLayer(fondo: string) {
  return new TileLayer({
    source: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    }),
    visible: fondo === 'google-sat',
  });
}

export function createGoogleHybridLayer(fondo: string) {
  return new TileLayer({
    source: new XYZ({
      url: 'https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',
    }),
    visible: fondo === 'google-hyb',
  });
}

/**
 * ===========================================================
 * CAPA DE CATASTRO
 * ===========================================================
 */
export function createCatastroLayer() {
  return new TileLayer({
    source: new TileWMS({
      url: 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx',
      params: {
        LAYERS: 'Catastro',
        FORMAT: 'image/png',
        TRANSPARENT: true,
        VERSION: '1.1.1',
      },
      crossOrigin: 'anonymous',
    }),
    visible: true,
  });
}

/**
 * ===========================================================
 * CAPA VECTORIAL
 * ===========================================================
 *
 * Esta capa será la encargada de mostrar los GeoJSON.
 */

export function createVectorLayer(mapRef: RefObject<Map | null>) {
  /**
   * Creamos los estilos utilizados para representar
   * las geometrías del GeoJSON.
   */
  const styleNormal = new Style({
    fill: new Fill({
      color: 'rgba(0,120,230,0.2)',
    }),
    stroke: new Stroke({
      color: '#0078e6',
      width: 1.5,
    }),
  });

  const styleSoloBorde = new Style({
    stroke: new Stroke({
      color: '#0078e6',
      width: 1.5,
    }),
  });

  /**
   * Creamos la capa vectorial.
   *
   * El estilo cambia dependiendo del nivel de zoom.
   */
  const vectorLayer = new VectorLayer<VectorSource>({
    style: () => {
      const zoom = mapRef.current?.getView().getZoom() ?? 0;

      return zoom >= 10 ? styleSoloBorde : styleNormal;
    },
  });

  return vectorLayer;
}
