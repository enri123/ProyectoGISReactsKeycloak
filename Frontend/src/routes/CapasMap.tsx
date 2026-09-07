import { Map } from 'ol';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';

import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';

//import TileWMS from 'ol/source/TileWMS';

import { Fill, Stroke, Style, Text } from 'ol/style';
import type { RefObject } from 'react';
import GeoJSON from 'ol/format/GeoJSON';

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
/*
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
}*/
export function createCatastroLayer() {
  const buildingsSource = new VectorSource();

  fetch('http://localhost:3000/api/catastro/buildings')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return response.json();
    })
    .then((geojson) => {
      if (!geojson || !geojson.features) {
        console.warn('GeoJSON vacío recibido');
        return;
      }
      const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      buildingsSource.addFeatures(features);
      console.log(`${features.length} edificios cargados`);
    })
    .catch((error) => {
      console.error('Error cargando edificios:', error);
      console.warn('Los edificios del catastro no se pudieron cargar');
    });

  const buildingsLayer = new VectorLayer({
    source: buildingsSource,
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.35)',
      }),
      stroke: new Stroke({
        color: '#ffff00',
        width: 1,
      }),
    }),
  });

  return buildingsLayer;
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
   * Creamos la capa vectorial.
   *
   * El estilo cambia dependiendo del nivel de zoom.
   */
  const vectorLayer = new VectorLayer<VectorSource>({
    style: (feature) => {
      const zoom = mapRef.current?.getView().getZoom() ?? 0;
      const nombreMunicipio = feature.get('NAMEUNIT');

      return new Style({
        fill:
          zoom >= 10
            ? undefined
            : new Fill({
                color: 'rgba(0,120,230,0.2)',
              }),
        stroke: new Stroke({
          color: '#ff0000',
          width: 1.5,
        }),
        text:
          zoom <= 11
            ? undefined
            : new Text({
                text: typeof nombreMunicipio === 'string' ? nombreMunicipio : '',
                font: '14px sans-serif',
                fill: new Fill({ color: '#1f2937' }),
                stroke: new Stroke({
                  color: '#ffffff',
                  width: 3,
                }),
                overflow: true,
              }),
      });
    },
  });

  return vectorLayer;
}
