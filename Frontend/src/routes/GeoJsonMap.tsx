/**
 * ===========================================================
 * GEOJSON DE LAS COMUNIDADES
 * ===========================================================
 *
 * import.meta.url genera automáticamente la ruta correcta
 * tanto en desarrollo como en producción.
 */

export const communityGeoJsonUrls = {
  andalucia: new URL('../assets/andalucia.geojson', import.meta.url).href,

  galicia: new URL('../assets/galicia.geojson', import.meta.url).href,

  canarias: new URL('../assets/canarias.geojson', import.meta.url).href,
} as const;

/**
 * Tipo que representa las comunidades disponibles.
 *
 * Se genera automáticamente a partir de las claves
 * del objeto anterior.
 */
export type Community = keyof typeof communityGeoJsonUrls;
