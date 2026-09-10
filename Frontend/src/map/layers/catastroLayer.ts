import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import { API_URL } from '../../const';

/**
 * Crea la capa de edificios del Catastro y comienza su carga autenticada.
 */
export function createCatastroLayer(token: string) {
  // El source mutable permite mostrar la capa mientras llega la respuesta.
  const buildingsSource = new VectorSource();
  const url = `${API_URL}/api/catastro/buildings`;
  const riskColors: Record<string, string> = {
    nulo: 'rgba(128, 128, 128, 0.5)',
    bajo: 'rgba(46, 204, 113, 0.5)',
    medio: 'rgba(241, 196, 15, 0.5)',
    alto: 'rgba(231, 76, 60, 0.5)',
  };

  const riskColorsBord: Record<string, string> = {
    nulo: 'rgba(0, 255, 255, 1)',
    bajo: 'rgba(77, 255, 0, 1)',
    medio: 'rgba(231, 76, 60, 1)',
    alto: 'rgba(0, 0, 0, 1)',
  };

  fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      console.log(`Respuesta del servidor: ${response.status} ${response.statusText}`);
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

      // Los datos vienen en coordenadas geográficas y el mapa usa Web Mercator.
      const features = new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      });

      buildingsSource.addFeatures(features);
      buildingsSource.changed();
    })
    .catch((error) => {
      console.error('Error cargando edificios:', error);
      console.error('Detalles:', error.message);
    });

  // El zIndex coloca los edificios por encima de las capas base.
  return new VectorLayer({
    source: buildingsSource,
    zIndex: 10,
    style: (feature) => {
      const riesgo = String(feature.get('riesgo') ?? 'nulo').toLowerCase();

      return new Style({
        fill: new Fill({
          color: riskColors[riesgo] ?? riskColors.nulo,
        }),
        stroke: new Stroke({
          color: riskColorsBord[riesgo] ?? riskColorsBord.nulo,
          width: 0.7,
        }),
      });
    },
  });
}
