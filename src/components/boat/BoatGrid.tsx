import type { Boat, DeparturePoint } from "@/lib/catalog/types";
import { BoatCard } from "./BoatCard";

/**
 * Listado de tarjetas de la portada.
 *  - Móvil: carrusel horizontal con ajuste al deslizar (sin reproducción
 *    automática), con la siguiente tarjeta asomando.
 *  - Tableta: rejilla de 2 columnas. Escritorio: 3 columnas, como la actual.
 */
export function BoatGrid({
  boats,
  departurePoints,
}: {
  boats: Boat[];
  departurePoints: DeparturePoint[];
}) {
  const names = new Map(departurePoints.map((p) => [p.id, p.name]));
  return (
    <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-3">
      {boats.map((boat, i) => (
        <li key={boat.slug} className="w-[82%] max-w-sm shrink-0 snap-start md:w-auto md:max-w-none">
          <BoatCard
            boat={boat}
            departureName={names.get(boat.departurePointId) ?? ""}
            priority={i < 3}
          />
        </li>
      ))}
    </ul>
  );
}
