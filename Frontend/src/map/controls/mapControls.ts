import Control from 'ol/control/Control';
import type Map from 'ol/Map';
import type VectorLayer from 'ol/layer/Vector';
import type VectorSource from 'ol/source/Vector';

/**
 * Crea el control que encuadra la vista en la comunidad cargada.
 */
export function createZoomCommunityControl(map: Map, vectorLayer: VectorLayer<VectorSource>) {
  const element = document.createElement('div');
  element.className = 'ol-control zoom-community-control';

  const button = document.createElement('button');
  button.type = 'button';
  button.innerHTML = 'Zoom';
  button.title = 'Zoom a la comunidad';
  button.addEventListener('click', () => {
    const source = vectorLayer.getSource();
    if (!source) return;

    // Una extensión infinita indica que todavía no hay geometrías válidas.
    const extent = source.getExtent();
    if (!extent || extent.every((value) => !isFinite(value))) return;

    // Ajusta la vista con animación y evita acercarse demasiado.
    map.getView().fit(extent, {
      padding: [20, 20, 20, 20],
      maxZoom: 10,
      duration: 500,
    });
  });

  element.appendChild(button);
  return new Control({ element });
}
