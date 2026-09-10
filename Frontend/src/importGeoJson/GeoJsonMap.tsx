/**
 * ===========================================================
 * GEOJSON DE LAS COMUNIDADES
 * ===========================================================
 *
 * import.meta.url genera automáticamente la ruta correcta
 * tanto en desarrollo como en producción.
 * Las URLs se generan mediante import.meta.url para que Vite las resuelva
 * correctamente tanto durante el desarrollo como después del build.
 */

export const communityGeoJsonUrls = {
  // Cada clave coincide con el valor utilizado por el selector de comunidad.
  algeciras: new URL('../assets/geojson/algeciras.geojson', import.meta.url).href,
  torremolinos: new URL('../assets/geojson/torremolinos.geojson', import.meta.url).href,
  andalucia: new URL('../assets/geojson/andalucia.geojson', import.meta.url).href,
  galicia: new URL('../assets/geojson/galicia.geojson', import.meta.url).href,
  canarias: new URL('../assets/geojson/canarias.geojson', import.meta.url).href,
} as const;

/**
 * Tipo que representa las comunidades disponibles.
 *
 * Se genera automáticamente a partir de las claves
 * del objeto anterior.
 */
export type Community = keyof typeof communityGeoJsonUrls;
