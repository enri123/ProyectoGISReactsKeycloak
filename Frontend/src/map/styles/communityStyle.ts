import type Feature from 'ol/Feature';
import type { Geometry } from 'ol/geom';
import { Fill, Stroke, Style, Text } from 'ol/style';

export function createCommunityStyle(feature: Feature<Geometry>, getZoom: () => number) {
  const zoom = getZoom();
  const municipalityName = feature.get('NAMEUNIT');

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
      zoom <= 10.5
        ? undefined
        : new Text({
            text: typeof municipalityName === 'string' ? municipalityName : '',
            font: '14px sans-serif',
            fill: new Fill({ color: '#1f2937' }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 3,
            }),
            overflow: true,
          }),
  });
}
