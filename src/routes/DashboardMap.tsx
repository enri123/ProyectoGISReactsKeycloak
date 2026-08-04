import { useEffect, useRef } from "react";

import { Map, View } from "ol";
import "ol/ol.css";

import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import TileWMS from "ol/source/TileWMS";

import { OSM, XYZ } from "ol/source";
import VectorSource from "ol/source/Vector";

import GeoJSON from "ol/format/GeoJSON";

import { fromLonLat } from "ol/proj";

import { Fill, Stroke, Style } from "ol/style";

import { useLayout } from "../layout/useLayoutContext";

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
   * Referencia a la instancia del mapa.
   * Gracias a esto podemos acceder al mapa desde cualquier useEffect
   * sin tener que volver a crearlo.
   */
  const mapRef = useRef<Map | null>(null);

  /**
   * Referencias a cada una de las capas base.
   */
  const osmLayerRef = useRef<TileLayer<OSM> | null>(null);
  const googleSatLayerRef = useRef<TileLayer<XYZ> | null>(null);
  const googleHybridLayerRef = useRef<TileLayer<XYZ> | null>(null);

  /**
   * Referencia a la capa vectorial.
   * Esta capa será la encargada de mostrar los GeoJSON.
   */
  const vectorLayerRef = useRef<VectorLayer<VectorSource> | null>(null);

  /**
   * Relación entre el nombre de la comunidad y su fichero GeoJSON.
   * import.meta.url genera automáticamente la ruta correcta tanto en desarrollo como en producción.
   */
  const geojsonUrls = {
    andalucia: new URL("../assets/andalucia.geojson", import.meta.url).href,
    galicia: new URL("../assets/galicia.geojson", import.meta.url).href,
    canarias: new URL("../assets/canarias.geojson", import.meta.url).href,
  } as const;

  /**
   * ===========================================================
   * CREACIÓN DEL MAPA
   * ===========================================================
   *
   * Este useEffect únicamente se ejecuta una vez al montar
   * el componente.
   *
   * Aquí se crean:
   *
   * - Las capas base.
   * - La capa vectorial.
   * - La instancia del mapa.
   */
  useEffect(() => {
    const capaOSM = new TileLayer({
      source: new OSM(),
      visible: fondo === "osm",
    });

    const capaGoogleSat = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      }),
      visible: fondo === "google-sat",
    });

    const capaGoogleHybrid = new TileLayer({
      source: new XYZ({
        url: "https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}",
      }),
      visible: fondo === "google-hyb",
    });

    /**
     * Guardamos las capas en referencias para poder acceder
     * a ellas desde otros useEffect.
     */
    osmLayerRef.current = capaOSM;
    googleSatLayerRef.current = capaGoogleSat;
    googleHybridLayerRef.current = capaGoogleHybrid;

    /**
     * Creamos una capa vectorial.
     *
     * Esta capa contendrá las geometrías del GeoJSON.
     */
    const styleNormal = new Style({
  fill: new Fill({
    color: "rgba(0,120,230,0.2)",
  }),
  stroke: new Stroke({
    color: "#0078e6",
    width: 1.5,
  }),
});

const styleSoloBorde = new Style({
  stroke: new Stroke({
    color: "#0078e6",
    width: 1.5,
  }),
});

const vectorLayer = new VectorLayer({
  style: () => {
    const zoom = mapRef.current?.getView().getZoom() ?? 0;
    return zoom >= 10 ? styleSoloBorde : styleNormal;
  },
});

    /**
     * Guardamos la referencia de la capa vectorial.
     */
    vectorLayerRef.current = vectorLayer;

    const catastroLayer = new TileLayer({
      source: new TileWMS({
        url: "https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx",
        params: {
          LAYERS: "Catastro",
          FORMAT: "image/png",
          TRANSPARENT: true,
          VERSION: "1.1.1",
        },
        crossOrigin: "anonymous",
      }),
      visible: true,
    });

    /**
     * Creamos el mapa.
     *
     * target -> div donde se dibuja.
     * layers -> todas las capas del mapa.
     * view -> vista inicial.
     */
    const map = new Map({
      target: mapDivRef.current!,
      layers: [
        capaOSM,
        capaGoogleSat,
        capaGoogleHybrid,
        catastroLayer,
        vectorLayer,
      ],

      view: new View({
        /**
         * Coordenadas iniciales.
         *
         * fromLonLat convierte las coordenadas geográficas
         * al sistema utilizado internamente por OpenLayers.
         */
        center: fromLonLat([-3.7038, 40.4168]),
        zoom: 6,
      }),
    });

    /**
     * Guardamos la referencia al mapa.
     */
    mapRef.current = map;

    /**
     * Limpieza.
     *
     * Cuando el componente desaparece eliminamos el mapa
     * para liberar memoria.
     */
    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
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
    /**
     * Si todavía no existe el mapa o la capa vectorial no hacemos nada.
     */
    if (!mapRef.current || !vectorLayerRef.current) return;

    /**
     * Creamos una nueva fuente de datos.
     *
     * url -> GeoJSON seleccionado.
     * format -> indica que el fichero es GeoJSON.
     */
    const source = new VectorSource({
      url: geojsonUrls[comunidad as keyof typeof geojsonUrls],
      format: new GeoJSON(),
    });

    /**
     * Sustituimos la fuente anterior.
     *
     * La capa se actualizará automáticamente.
     */
    vectorLayerRef.current.setSource(source);

    /**
     * Esperamos a que termine de cargar el GeoJSON.
     */
    source.once("change", () => {
      /**
       * Solo continuamos cuando la carga ha finalizado.
       */
      if (source.getState() !== "ready") return;

      /**
       * Calculamos la extensión (bounding box)
       * de todas las geometrías cargadas.
       */
      const extent = source.getExtent();

      if (!extent) return;

      /**
       * Ajustamos automáticamente la vista
       * para que toda la comunidad sea visible.
       */
      mapRef.current?.getView().fit(extent, {
        padding: [20, 20, 20, 20],

        /**
         * Evita acercar demasiado el mapa.
         */
        maxZoom: 10,

        /**
         * Animación del desplazamiento.
         */
        duration: 500,
      });
    });
  }, [comunidad]);

  /**
   * ===========================================================
   * CAMBIO DEL MAPA BASE
   * ===========================================================
   *
   * No recreamos las capas.
   *
   * Simplemente activamos la correspondiente y ocultamos
   * las demás.
   */
  useEffect(() => {
    osmLayerRef.current?.setVisible(fondo === "osm");
    googleSatLayerRef.current?.setVisible(fondo === "google-sat");
    googleHybridLayerRef.current?.setVisible(fondo === "google-hyb");
  }, [fondo]);

  /**
   * Contenedor donde OpenLayers renderiza el mapa.
   */
  return <div ref={mapDivRef} className="map" />;
}
