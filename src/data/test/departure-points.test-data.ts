import type { DeparturePoint } from "@/lib/catalog/types";

/**
 * ⚠️ DATOS DE PRUEBA — NO USAR EN PRODUCCIÓN.
 *
 * Los dos puntos de salida existen (la web actual los nombra: Cadaqués y
 * Port Lligat), pero las coordenadas son una REFERENCIA APROXIMADA de cada
 * localidad, no el punto de embarque autorizado. El negocio debe facilitar
 * la coordenada exacta de cada punto; entonces se cargan en la tabla
 * `departure_points` y este archivo se elimina.
 */
export const TEST_DEPARTURE_POINTS: DeparturePoint[] = [
  {
    id: "cadaques",
    name: "Cadaqués",
    lng: 3.2779,
    lat: 42.2886,
    isTestData: true,
    coordinatesVerified: false,
    note: "Referencia aproximada de la bahía de Cadaqués. Punto de embarque sin confirmar.",
  },
  {
    id: "port-lligat",
    name: "Port Lligat",
    lng: 3.2857,
    lat: 42.2934,
    isTestData: true,
    coordinatesVerified: false,
    note: "Referencia aproximada de la bahía de Port Lligat. Punto de embarque sin confirmar.",
  },
];
