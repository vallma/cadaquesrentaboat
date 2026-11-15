"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Anchor, List, Map as MapIcon, MapPin, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { BoatCard } from "@/components/boat/BoatCard";
import { Button } from "@/components/ui/Button";
import { Alert, EmptyState } from "@/components/ui/Feedback";
import {
  applyFilters,
  countActive,
  filtersToQuery,
  parseFilters,
  priceBounds,
  type Filters,
} from "@/lib/catalog/filters";
import type { Boat, Catalog } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { ExplorerMap } from "./ExplorerMap";
import { FilterFields } from "./Filters";

/**
 * Explorador de embarcaciones: filtros, listado y mapa sincronizados.
 *
 *  - Escritorio (≥1024 px): listado a la izquierda y mapa fijo a la derecha.
 *  - Móvil y tableta: listado o mapa a pantalla completa, con un botón para
 *    alternar; los filtros se abren en un panel.
 *
 * Los filtros viven en la URL, así que una búsqueda se puede compartir.
 */
export function BoatExplorer({ catalog }: { catalog: Catalog }) {
  const t = useTranslations("explorer");
  const { boats, departurePoints, meta } = catalog;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams), [searchParams]);
  const results = useMemo(() => applyFilters(boats, filters), [boats, filters]);
  const price = useMemo(() => priceBounds(boats), [boats]);
  const maxCapacity = useMemo(() => Math.max(...boats.map((b) => b.capacity)), [boats]);
  const pointName = useMemo(
    () => new Map(departurePoints.map((p) => [p.id, p.name])),
    [departurePoints],
  );
  const activeCount = countActive(filters);

  const setFilters = useCallback(
    (next: Filters) => {
      const query = filtersToQuery(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [router, pathname],
  );
  const patchFilters = (patch: Partial<Filters>) => setFilters({ ...filters, ...patch });
  const clearFilters = () => setFilters({ date: filters.date });

  // Sincronización mapa ↔ listado.
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const candidate = hovered ?? selected;
  const activeSlug = results.some((b) => b.slug === candidate) ? candidate : null;
  const selectedBoat = results.find((b) => b.slug === selected) ?? null;

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [view, setView] = useState<"list" | "map">("list");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const mapVisible = isDesktop || view === "map";

  const selectFromMap = (slug: string) => {
    setSelected(slug);
    if (isDesktop) {
      document
        .querySelector(`[data-boat="${slug}"]`)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  };

  const showOnMap = (slug: string) => {
    setSelected(slug);
    setView("map");
  };

  // Con el mapa o el panel de filtros a pantalla completa, la página no se desplaza.
  const lockScroll = !isDesktop && (view === "map" || filtersOpen);
  useEffect(() => {
    if (!lockScroll) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [lockScroll]);

  const fields = (
    <FilterFields
      filters={filters}
      onChange={patchFilters}
      departurePoints={departurePoints}
      maxCapacity={maxCapacity}
      price={price}
    />
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)]">
      {/* Listado */}
      <div className={cn("px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-12", view === "map" && "hidden lg:block")}>
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h1 className="font-display text-title font-medium text-navy">{t("title")}</h1>
          <p aria-live="polite" className="text-[0.9375rem] font-medium text-ink-2">
            {t("results", { count: results.length })}
          </p>
        </div>

        {meta.isTestData && (
          <Alert tone="warn" title={t("testTitle")} className="mt-4">
            {t("testBody")}
          </Alert>
        )}

        {/* Filtros en línea (escritorio) */}
        <div className="mt-5 hidden rounded-card bg-surface p-5 lg:block">
          {fields}
          {activeCount > 0 && (
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t("clear")}
              </Button>
            </div>
          )}
        </div>

        {/* Botón de filtros (móvil y tableta) */}
        <div className="mt-4 lg:hidden">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setFiltersOpen(true)}
            icon={<SlidersHorizontal className="size-[1.1em]" aria-hidden />}
          >
            {t("filters")}
            {activeCount > 0 && (
              <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-brand px-1.5 text-sm text-white">
                {activeCount}
              </span>
            )}
          </Button>
        </div>

        {filters.date && !meta.availabilityConnected && (
          <Alert tone="info" className="mt-4">
            {t("dateNotice")}
          </Alert>
        )}

        {results.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={<Anchor aria-hidden />}
              title={t("emptyTitle")}
              action={
                <Button variant="outline" onClick={clearFilters}>
                  {t("clear")}
                </Button>
              }
            >
              {t("emptyBody")}
            </EmptyState>
          </div>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {results.map((boat, i) => (
              <li key={boat.slug}>
                <BoatCard
                  boat={boat}
                  departureName={pointName.get(boat.departurePointId) ?? ""}
                  priority={i < 2}
                  active={boat.slug === activeSlug}
                  onHighlight={setHovered}
                  sizes="(min-width: 1024px) 28vw, (min-width: 640px) 50vw, 100vw"
                  note={
                    filters.date && !meta.availabilityConnected
                      ? t("availabilityUnknown")
                      : undefined
                  }
                  action={
                    <button
                      type="button"
                      onClick={() => showOnMap(boat.slug)}
                      aria-label={`${t("viewOnMap")}: ${boat.name}`}
                      className="inline-flex size-11 items-center justify-center rounded-control bg-tint-50 text-brand hover:bg-tint-100 lg:hidden"
                    >
                      <MapIcon className="size-5" aria-hidden />
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mapa */}
      <div
        className={cn(
          "lg:sticky lg:top-header-lg lg:block lg:h-[calc(100dvh-var(--spacing-header-lg))]",
          view === "map" ? "fixed inset-x-0 bottom-0 top-header z-30" : "hidden",
        )}
      >
        <ExplorerMap
          className="size-full"
          departurePoints={departurePoints}
          boats={results}
          activeSlug={activeSlug}
          onSelect={selectFromMap}
          onHighlight={setHovered}
          visible={mapVisible}
        />

        {/* Controles del mapa en móvil */}
        <div className="absolute inset-x-0 top-3 z-10 flex justify-center gap-2 px-4 lg:hidden">
          <Button
            size="sm"
            className="shadow-float"
            onClick={() => setView("list")}
            icon={<List className="size-[1.1em]" aria-hidden />}
          >
            {t("showList")} · {results.length}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white shadow-float"
            onClick={() => setFiltersOpen(true)}
            icon={<SlidersHorizontal className="size-[1.1em]" aria-hidden />}
          >
            {t("filters")}
            {activeCount > 0 && ` · ${activeCount}`}
          </Button>
        </div>

        {selectedBoat && (
          <div className="absolute inset-x-3 bottom-3 z-10 lg:hidden">
            <BoatPreview
              boat={selectedBoat}
              departureName={pointName.get(selectedBoat.departurePointId) ?? ""}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>

      {/* Botón flotante lista → mapa (móvil y tableta) */}
      {view === "list" && !filtersOpen && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-30 flex justify-center lg:hidden">
          <Button
            className="pointer-events-auto rounded-full px-6 shadow-float"
            onClick={() => setView("map")}
            icon={<MapIcon className="size-[1.1em]" aria-hidden />}
          >
            {t("showMap")}
          </Button>
        </div>
      )}

      {/* Panel de filtros (móvil y tableta) */}
      {filtersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("filters")}
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-2">
            <h2 className="font-display text-lg font-medium text-navy">{t("filters")}</h2>
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              aria-label={t("close")}
              className="inline-flex size-11 items-center justify-center rounded-control text-navy hover:bg-tint-50"
            >
              <X className="size-6" aria-hidden />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5">{fields}</div>
          <div className="flex items-center gap-3 border-t border-line px-4 py-3">
            <Button variant="ghost" onClick={clearFilters} disabled={activeCount === 0}>
              {t("clear")}
            </Button>
            <Button className="flex-1" onClick={() => setFiltersOpen(false)}>
              {results.length === 0
                ? t("results", { count: 0 })
                : t("apply", { count: results.length })}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Tarjeta compacta de la embarcación seleccionada en el mapa (móvil). */
function BoatPreview({
  boat,
  departureName,
  onClose,
}: {
  boat: Boat;
  departureName: string;
  onClose: () => void;
}) {
  const t = useTranslations("explorer");
  const tb = useTranslations("boats");
  const locale = useLocale();

  return (
    <article className="relative flex overflow-hidden rounded-card border border-line bg-white shadow-float">
      <div className="relative w-28 shrink-0 bg-tint-200">
        <Image
          src={boat.image}
          alt={tb("photoOf", { name: boat.name })}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0 flex-1 py-3 pl-3 pr-12">
        <h3 className="truncate font-display text-card-title text-navy">
          <Link
            href={`/vaixells/${boat.slug}`}
            aria-label={`${t("viewBoat")}: ${boat.name}`}
            className="after:absolute after:inset-0"
          >
            {boat.name}
          </Link>
        </h3>
        <p className="font-display font-semibold text-brand">
          {tb("from", { price: formatPrice(boat.priceFrom, locale) })}
        </p>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-3">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">
            {departureName} · {tb("people", { count: boat.capacity })}
          </span>
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={t("close")}
        className="absolute right-1 top-1 z-10 inline-flex size-10 items-center justify-center rounded-full text-ink-2 hover:bg-surface"
      >
        <X className="size-5" aria-hidden />
      </button>
    </article>
  );
}
