import { useCallback, useEffect, useRef } from 'react';
import 'ol/ol.css';

import { useLayout } from '../hooks/useLayoutContext';
import { useAuth } from '../auth/useAuth';
import { useCommunityLayer } from '../hooks/useCommunityLayer';
import { useDashboardMap } from '../hooks/useDashboardMap';

export default function DashboardMap() {
  /**
   * Obtenemos del contexto de la aplicación:
   * - fondo: mapa base seleccionado por el usuario
   * - comunidad: comunidad autónoma seleccionada en el sidebar.
   * - el popup cuando el usuario selecciona un municipio.
   */
  const { fondo, comunidad, setPopupOpen, setSelectedFeatureProperties } = useLayout();

  const { token } = useAuth();

  /**
   * Referencia al div donde OpenLayers dibujará el mapa.
   * useRef mantiene siempre la misma referencia entre renders.
   */
  const mapDivRef = useRef<HTMLDivElement>(null);

  /**
   * Traduce una selección de OpenLayers al estado de React. Al ser estable,
   * evita reconstruir innecesariamente el listener del mapa.
   */
  const handleFeatureSelected = useCallback(
    (properties: Record<string, unknown>) => {
      setSelectedFeatureProperties(properties);
      setPopupOpen(true);
    },
    [setPopupOpen, setSelectedFeatureProperties]
  );

  const { mapRef, mapReady, vectorLayerRef, osmLayerRef, googleSatLayerRef, googleHybridLayerRef } =
    useDashboardMap({
      mapDivRef,
      token,
      // Callback ejecutado cuando se selecciona una entidad válida.
      onFeatureSelected: handleFeatureSelected,
    });

  // Carga el GeoJSON.
  useCommunityLayer(mapRef, vectorLayerRef, comunidad, mapReady);

  /**
   * CAMBIO DEL MAPA BASE
   */
  useEffect(() => {
    osmLayerRef.current?.setVisible(fondo === 'osm');
    googleSatLayerRef.current?.setVisible(fondo === 'google-sat');
    googleHybridLayerRef.current?.setVisible(fondo === 'google-hyb');
  }, [fondo, googleHybridLayerRef, googleSatLayerRef, osmLayerRef]);

  //Contenedor donde OpenLayers carga el mapa.
  return <div ref={mapDivRef} className="map" />;
}
