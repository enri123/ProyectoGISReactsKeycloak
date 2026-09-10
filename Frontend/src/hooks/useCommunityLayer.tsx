import { useEffect, type RefObject } from 'react';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { communityGeoJsonUrls, type Community } from '../importGeoJson/GeoJsonMap';
import type Map from 'ol/Map';

/**
 * Carga el GeoJSON de la comunidad seleccionada y ajusta la vista a sus datos.
 */
export function useCommunityLayer(
  mapRef: RefObject<Map | null>,
  vectorLayerRef: RefObject<VectorLayer<VectorSource> | null>,
  community: string,
  mapReady: boolean
) {
  useEffect(() => {
    const map = mapRef.current;
    const vectorLayer = vectorLayerRef.current;
    if (!mapReady || !map || !vectorLayer) return;

    // VectorSource descarga el recurso y GeoJSON convierte sus features.
    const source = new VectorSource({
      url: communityGeoJsonUrls[community as Community],
      format: new GeoJSON(),
    });

    // Se mantiene la capa y se sustituyen únicamente sus datos.
    vectorLayer.setSource(source);
    source.once('change', () => {
      if (source.getState() !== 'ready') return;
      const extent = source.getExtent();
      if (!extent) return;

      // Cuando termina la carga, encuadra todas las geometrías de la comunidad.
      map.getView().fit(extent, {
        padding: [20, 20, 20, 20],
        maxZoom: 10,
        duration: 500,
      });
    });
  }, [community, mapReady, mapRef, vectorLayerRef]);
}
