/**
 * Configuración del mapa. Nada de esto es dato de catálogo: las coordenadas
 * de los puntos de salida vienen siempre del repositorio (src/lib/catalog).
 */
export const mapConfig = {
  // Estilo vectorial sin clave de API. Decisión D-7 pendiente: se puede
  // cambiar de proveedor con la variable de entorno, sin tocar código.
  styleUrl:
    process.env.NEXT_PUBLIC_MAP_STYLE_URL ?? "https://tiles.openfreemap.org/styles/positron",
  workerUrl: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/maplibre/maplibre-gl-worker.mjs`,
  // Límite de desplazamiento de la cámara: Cadaqués, Port Lligat y la costa
  // del Cap de Creus. [oeste, sur], [este, norte].
  viewLimit: [
    [3.05, 42.18],
    [3.45, 42.42],
  ] as [[number, number], [number, number]],
  minZoom: 10,
  fitMaxZoom: 15,
} as const;
