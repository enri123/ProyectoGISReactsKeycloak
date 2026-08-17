import { useEffect, useRef } from 'react';

import { Map, View } from 'ol';
import 'ol/ol.css';

import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import Control from 'ol/control/Control';

import { OSM, XYZ } from 'ol/source';
import VectorSource from 'ol/source/Vector';

import { fromLonLat } from 'ol/proj';

import { useLayout } from '../layout/useLayoutContext';
import GeoJSON from 'ol/format/GeoJSON';

import {
  createOSMLayer,
  createGoogleSatLayer,
  createGoogleHybridLayer,
  createCatastroLayer,
  createVectorLayer,
} from './CapasMap';

import { communityGeoJsonUrls, type Community } from './GeoJsonMap';

export default function DashboardMap() {
  /**
   * Obtenemos del contexto de la aplicación:
   * - fondo: mapa base seleccionado por el usuario
   * - comunidad: comunidad autónoma seleccionada en el sidebar.
   */
  const { fondo, comunidad } = useLayout();

  /**
   * Referencia al div donde OpenLayers dibujará el mapa.
   * useRef mantiene siempre la misma referencia entre renders.
   */
  const mapDivRef = useRef<HTMLDivElement>(null);

  /**
   * Referencia a la instancia del mapa y cada una de las capas.
   * Gracias a esto podemos acceder al mapa desde cualquier useEffect
   * sin tener que volver a crearlo.
   */
  const mapRef = useRef<Map | null>(null);

  const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
  const googleSatLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const googleHybridLayerRef = useRef<TileLayer<XYZ> | null>(null);

  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  /**
   * ===========================================================
   * CREACIÓN DEL MAPA
   * ===========================================================
   * Aquí se crean:
   *
   * - Las capas base.
   * - La capa vectorial.
   * - La capa de catastro.
   * - La instancia del mapa.
   */
  useEffect(() => {
    const capaOSM = createOSMLayer(fondo);
    const capaGoogleSat = createGoogleSatLayer(fondo);
    const capaGoogleHybrid = createGoogleHybridLayer(fondo);
    osmLayerRef.current = capaOSM;
    googleSatLayerRef.current = capaGoogleSat;
    googleHybridLayerRef.current = capaGoogleHybrid;

    const vectorLayer = createVectorLayer(mapRef);
    vectorLayerRef.current = vectorLayer;

    const catastroLayer = createCatastroLayer();

    /**
     * target -> div donde se dibuja.
     * layers -> todas las capas del mapa.
     * view -> vista inicial.
     *
     * fromLonLat convierte las coordenadas geográficas
     * al sistema utilizado por OpenLayers.
     */
    const map = new Map({
      target: mapDivRef.current!,
      layers: [capaOSM, capaGoogleSat, capaGoogleHybrid, catastroLayer, vectorLayer],

      view: new View({
        center: fromLonLat([-3.7038, 40.4168]),
        zoom: 6,
      }),
    });

    const zoomToCommunity = new Control({
      element: (() => {
        const element = document.createElement('div');
        element.className = 'ol-control zoom-community-control';

        const button = document.createElement('button');
        button.type = 'button';
        button.innerHTML = 'C';
        button.title = 'Zoom a la comunidad';

        button.addEventListener('click', () => {
          const source = vectorLayerRef.current?.getSource();

          if (!source) return;

          const extent = source.getExtent();

          if (!extent || extent.every((value) => !isFinite(value))) return;

          map.getView().fit(extent, {
            padding: [20, 20, 20, 20],
            maxZoom: 10,
            duration: 500,
          });
        });

        element.appendChild(button);

        return element;
      })(),
    });

    map.addControl(zoomToCommunity);
    map.on('singleclick', function (evt) {
      const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature; // Retorna la primera feature encontrada en el píxel
      });
      if (feature) {
        const extent = feature.getProperties().geometry.getExtent();
        map.getView().fit(extent, {
          duration: 500,
        });
        console.log('Propiedades:', feature.getProperties());
      }
    });

    mapRef.current = map;

    /**
     * Cuando el componente desaparece eliminamos el mapa
     * para liberar memoria.
     */
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
      vectorLayerRef.current = null;
      osmLayerRef.current = null;
      googleSatLayerRef.current = null;
      googleHybridLayerRef.current = null;
    };
  }, []);

  /**
   * ===========================================================
   * CAMBIO DE COMUNIDAD
   * ===========================================================
   *
   * Cada vez que cambia la comunidad:
   *
   * - Se carga un nuevo GeoJSON.
   * - Se asigna como Source de la capa vectorial.
   * - Cuando termina de cargarse se hace zoom automático.
   */
  useEffect(() => {
    if (!mapRef.current || !vectorLayerRef.current) return;

    const source = new VectorSource({
      url: communityGeoJsonUrls[comunidad as Community],
      format: new GeoJSON(),
    });

    vectorLayerRef.current.setSource(source);

    source.once('change', () => {
      if (source.getState() !== 'ready') return;

      /**
       * Calculamos la extensión
       * de todas las geometrías cargadas.
       */
      const extent = source.getExtent();

      if (!extent) return;

      // Ajustamos automáticamente la vista.
      mapRef.current?.getView().fit(extent, {
        padding: [20, 20, 20, 20],
        maxZoom: 10,
        duration: 500,
      });
    });
  }, [comunidad]);

  /**
   * ===========================================================
   * CAMBIO DEL MAPA BASE
   * ===========================================================
   */
  useEffect(() => {
    osmLayerRef.current?.setVisible(fondo === 'osm');
    googleSatLayerRef.current?.setVisible(fondo === 'google-sat');
    googleHybridLayerRef.current?.setVisible(fondo === 'google-hyb');
  }, [fondo]);

  //Contenedor donde OpenLayers renderiza el mapa.
  return <div ref={mapDivRef} className="map" />;
}
