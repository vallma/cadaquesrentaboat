import type { Boat, BoatType, SkipperMode } from "./types";

export interface Filters {
  /** Fecha ISO (AAAA-MM-DD). Se conserva en la URL; no filtra hasta conectar la disponibilidad. */
  date?: string;
  people?: number;
  type?: BoatType;
  skipper?: SkipperMode;
  maxPrice?: number;
  departurePointId?: string;
}

export const BOAT_TYPES: BoatType[] = ["llanxa", "llaut", "semirrigida"];
export const SKIPPER_MODES: SkipperMode[] = ["none", "optional"];

/** Nombres de parámetro de la URL (ARCHITECTURE.md §5.2). */
const P = {
  date: "data",
  people: "persones",
  type: "tipus",
  skipper: "patro",
  maxPrice: "preu",
  departurePointId: "sortida",
} as const;

const positiveInt = (v: string | null) => {
  const n = Number(v);
  return v && Number.isInteger(n) && n > 0 ? n : undefined;
};

export function parseFilters(params: URLSearchParams): Filters {
  const date = params.get(P.date);
  const type = params.get(P.type);
  const skipper = params.get(P.skipper);
  return {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined,
    people: positiveInt(params.get(P.people)),
    type: BOAT_TYPES.includes(type as BoatType) ? (type as BoatType) : undefined,
    skipper: SKIPPER_MODES.includes(skipper as SkipperMode)
      ? (skipper as SkipperMode)
      : undefined,
    maxPrice: positiveInt(params.get(P.maxPrice)),
    departurePointId: params.get(P.departurePointId) || undefined,
  };
}

export function filtersToQuery(filters: Filters): string {
  const params = new URLSearchParams();
  (Object.keys(P) as (keyof Filters)[]).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== "") params.set(P[key], String(value));
  });
  return params.toString();
}

/** La fecha no cuenta: todavía no filtra. */
export function countActive(filters: Filters): number {
  return (Object.keys(filters) as (keyof Filters)[]).filter(
    (k) => k !== "date" && filters[k] !== undefined,
  ).length;
}

export function applyFilters(boats: Boat[], f: Filters): Boat[] {
  return boats.filter(
    (b) =>
      (f.people === undefined || b.capacity >= f.people) &&
      (f.type === undefined || b.type === f.type) &&
      (f.skipper === undefined || b.skipper === f.skipper) &&
      (f.maxPrice === undefined || b.priceFrom <= f.maxPrice) &&
      (f.departurePointId === undefined || b.departurePointId === f.departurePointId),
  );
}

export function priceBounds(boats: Boat[]) {
  const prices = boats.map((b) => b.priceFrom);
  return {
    min: Math.floor(Math.min(...prices) / 10) * 10,
    max: Math.ceil(Math.max(...prices) / 10) * 10,
  };
}
