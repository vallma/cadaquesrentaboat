export type BoatType = "llanxa" | "llaut" | "semirrigida";

/** Modo de patrón, según las etiquetas de la web actual. */
export type SkipperMode = "none" | "optional";

/**
 * Punto autorizado de salida o recogida. Es la ÚNICA fuente de coordenadas
 * del mapa: las embarcaciones no tienen posición propia, se muestran en el
 * punto del que salen.
 */
export interface DeparturePoint {
  id: string;
  name: string;
  lng: number;
  lat: number;
  /** true mientras el registro no proceda de la base de datos real. */
  isTestData: boolean;
  /** true solo cuando el negocio haya confirmado la coordenada exacta. */
  coordinatesVerified: boolean;
  note?: string;
}

export interface Boat {
  slug: string;
  name: string;
  type: BoatType;
  /** Id de un DeparturePoint. */
  departurePointId: string;
  capacity: number;
  horsepower: number;
  /** Precio mínimo en euros (media jornada). */
  priceFrom: number;
  skipper: SkipperMode;
  /** Solo donde la propia web lo anuncia en el nombre del barco. */
  licenseFree: boolean;
  image: string;
  isTestData: boolean;
}

export interface Catalog {
  boats: Boat[];
  departurePoints: DeparturePoint[];
  meta: {
    /** Origen de los datos: fixtures de prueba o base de datos. */
    source: "test-fixtures" | "database";
    isTestData: boolean;
    /**
     * false mientras no exista el motor de reservas. Con false, la fecha
     * elegida NO filtra ni marca barcos como libres u ocupados.
     */
    availabilityConnected: boolean;
  };
}
