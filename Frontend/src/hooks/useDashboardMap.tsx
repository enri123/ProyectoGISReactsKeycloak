import { useEffect, useRef, useState, type RefObject } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { OSM, XYZ } from 'ol/source';
import { fromLonLat } from 'ol/proj';

import { createCatastroLayer } from '../map/layers/catastroLayer';
import {
  createCommunityLayer,
  createGoogleHybridLayer,
  createGoogleSatLayer,
  createOSMLayer,
} from '../map/layers/mapLayers';
import { createZoomCommunityControl } from '../map/controls/mapControls';

/** Propiedades que se muestran en el popup tras seleccionar una entidad. */
type SelectedFeatureProperties = Record<string, unknown>;

type UseDashboardMapOptions = {
  mapDivRef: RefObject<HTMLDivElement | null>;
  token: string | null | undefined;
  /** Callback que conecta la selección del mapa con el estado de React. */
  onFeatureSelected: (properties: SelectedFeatureProperties) => void;
};

/**
 * Gestiona el ciclo de vida de la instancia de OpenLayers.
 *
 * Crea capas, vista, controles y listeners, y devuelve refs para que el
 * componente coordinador pueda cambiar capas sin reconstruir el mapa.
 */
export function useDashboardMap({ mapDivRef, token, onFeatureSelected }: UseDashboardMapOptions) {
  /** Instancia principal del mapa, estable durante toda su vida útil. */
  const mapRef = useRef<Map | null>(null);
  const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
  const googleSatLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const googleHybridLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  const [mapReady, setMapReady] = useState(false);

  /** Construye el mapa después de disponer del token y del nodo DOM. */
  useEffect(() => {
    if (!token || !mapDivRef.current) return;

    // Se crean una vez todas las capas base; solo OSM empieza visible.
    const osmLayer = createOSMLayer(true);
    const googleSatLayer = createGoogleSatLayer(false);
    const googleHybridLayer = createGoogleHybridLayer(false);

    // El estilo recibe el zoom para representar etiquetas y relleno.
    const vectorLayer = createCommunityLayer(() => mapRef.current?.getView().getZoom() ?? 0);
    const catastroLayer = createCatastroLayer(token);

    osmLayerRef.current = osmLayer;
    googleSatLayerRef.current = googleSatLayer;
    googleHybridLayerRef.current = googleHybridLayer;
    vectorLayerRef.current = vectorLayer;

    // La vista trabaja en EPSG:3857; fromLonLat transforma el centro geográfico.
    const map = new Map({
      target: mapDivRef.current,
      layers: [osmLayer, googleSatLayer, googleHybridLayer, catastroLayer, vectorLayer],
      view: new View({
        center: fromLonLat([-7.59, 43.66]),
        zoom: 6,
      }),
    });

    // Se guarda antes de registrar comportamientos que consultan el mapa.
    mapRef.current = map;
    setMapReady(true);
    map.addControl(createZoomCommunityControl(map, vectorLayer));

    /** Selecciona el primer feature encontrado bajo el píxel pulsado. */
    map.on('singleclick', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (candidate) => candidate);
      if (!feature) return;

      // Centra la vista en la geometría seleccionada.
      const geometry = feature.getGeometry();
      if (geometry) {
        map.getView().fit(geometry.getExtent(), { duration: 500 });
      }

      const municipality = feature.get('municipality');
      if (typeof municipality !== 'string' || municipality.length === 0) return;

      const properties = { ...feature.getProperties() };
      delete properties.geometry;
      onFeatureSelected(properties);
    });

    return () => {
      map.setTarget(undefined);
      setMapReady(false);
      mapRef.current = null;
      vectorLayerRef.current = null;
      osmLayerRef.current = null;
      googleSatLayerRef.current = null;
      googleHybridLayerRef.current = null;
    };
  }, [mapDivRef, onFeatureSelected, token]);

  return {
    mapRef,
    mapReady,
    vectorLayerRef,
    osmLayerRef,
    googleSatLayerRef,
    googleHybridLayerRef,
  };
}
