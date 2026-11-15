import { TEST_BOATS } from "@/data/test/boats.test-data";
import { TEST_DEPARTURE_POINTS } from "@/data/test/departure-points.test-data";
import type { Catalog } from "./types";

/**
 * Único punto de acceso al catálogo. Las páginas y componentes NO importan
 * los fixtures directamente: llaman a esta función.
 *
 * Hoy devuelve datos de prueba. Cuando exista la base de datos
 * (ARCHITECTURE.md §4.1) solo cambia este archivo: leerá `boats` y
 * `departure_points` de Supabase y devolverá `source: "database"`.
 */
export async function getCatalog(): Promise<Catalog> {
  const departurePoints = TEST_DEPARTURE_POINTS;
  const ids = new Set(departurePoints.map((p) => p.id));

  // Un barco sin punto de salida conocido no se publica: no hay dónde situarlo.
  const boats = TEST_BOATS.filter((b) => ids.has(b.departurePointId));

  return {
    boats,
    departurePoints,
    meta: {
      source: "test-fixtures",
      isTestData: true,
      availabilityConnected: false,
    },
  };
}
