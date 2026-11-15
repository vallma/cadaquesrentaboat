import type { ReactNode } from "react";
import Image from "next/image";
import { Gauge, MapPin, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Chip } from "@/components/ui/Chip";
import { Skeleton } from "@/components/ui/Feedback";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import type { Boat } from "@/lib/catalog/types";

/**
 * Tarjeta de embarcación. Reproduce la tarjeta de la portada actual:
 * foto, nombre, precio en azul primario, ubicación, separador y datos.
 * Toda la tarjeta es un único enlace. Sirve en servidor y en cliente.
 */
export function BoatCard({
  boat,
  departureName,
  priority = false,
  active = false,
  note,
  action,
  sizes = "(min-width: 1024px) 384px, (min-width: 768px) 50vw, 82vw",
  onHighlight,
}: {
  boat: Boat;
  departureName: string;
  priority?: boolean;
  /** Resaltada por estar seleccionada o señalada en el mapa. */
  active?: boolean;
  /** Aviso bajo el precio (p. ej. disponibilidad por confirmar). */
  note?: string;
  /** Acción secundaria, por encima del enlace de la tarjeta. */
  action?: ReactNode;
  sizes?: string;
  onHighlight?: (slug: string | null) => void;
}) {
  const t = useTranslations("boats");
  const locale = useLocale();
  const price = formatPrice(boat.priceFrom, locale);

  return (
    <article
      data-boat={boat.slug}
      onPointerEnter={onHighlight && (() => onHighlight(boat.slug))}
      onPointerLeave={onHighlight && (() => onHighlight(null))}
      onFocus={onHighlight && (() => onHighlight(boat.slug))}
      onBlur={onHighlight && (() => onHighlight(null))}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-card border bg-white transition-[box-shadow,border-color] duration-200",
        "hover:shadow-card-hover focus-within:shadow-card-hover",
        active ? "border-brand shadow-card-hover ring-2 ring-brand" : "border-line",
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-tint-200">
        <Image
          src={boat.image}
          alt={t("photoOf", { name: boat.name })}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {boat.licenseFree && (
          <Chip tone="navy" className="absolute left-3 top-3">
            {t("licenseFree")}
          </Chip>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-5">
        <h3 className="font-display text-card-title font-normal text-navy">
          <Link
            href={`/vaixells/${boat.slug}`}
            className="after:absolute after:inset-0 after:rounded-card focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-brand"
          >
            {boat.name}
          </Link>
        </h3>
        <p className="font-display font-semibold text-brand">
          {t("from", { price })}
          <span className="font-sans text-sm font-normal text-ink-3"> · {t("halfDay")}</span>
        </p>
        {note && <p className="mt-1 text-sm text-ink-3">{note}</p>}

        <p className="mt-4 flex items-center gap-1.5 border-b border-line pb-3 text-[0.9375rem] font-medium text-ink-3">
          <MapPin className="size-4 shrink-0" aria-hidden />
          {departureName}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.9375rem] text-ink-2">
            <li className="flex items-center gap-1.5">
              <Users className="size-4 shrink-0" aria-hidden />
              {t("people", { count: boat.capacity })}
            </li>
            <li className="flex items-center gap-1.5">
              <Gauge className="size-4 shrink-0" aria-hidden />
              {t("power", { hp: boat.horsepower })}
            </li>
          </ul>
          {action && <div className="relative z-10 shrink-0">{action}</div>}
        </div>
      </div>
    </article>
  );
}

/** Estado de carga con la misma geometría que la tarjeta. */
export function BoatCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-white" aria-hidden>
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="px-5 pb-4 pt-5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="mt-2 h-5 w-1/3" />
        <Skeleton className="mt-5 h-4 w-1/2" />
        <div className="mt-3 border-t border-line pt-3">
          <Skeleton className="h-4 w-2/5" />
        </div>
      </div>
    </div>
  );
}
