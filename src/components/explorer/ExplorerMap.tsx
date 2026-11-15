"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { LocateFixed, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { mapConfig } from "@/config/map";
import type { Boat, DeparturePoint } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

type Status = "idle" | "loading" | "ready" | "error";

/**
 * Mapa del explorador.
 *
 * Hay UN marcador por punto de salida, situado en la coordenada que da el
 * repositorio. Las embarcaciones no tienen posición propia: se muestran como
 * píldoras de precio dentro del marcador de su punto. Así el mapa nunca
 * dibuja una posición que no exista en los datos.
 */
export function ExplorerMap({
  departurePoints,
  boats,
  activeSlug,
  onSelect,
  onHighlight,
  visible,
  className,
}: {
  departurePoints: DeparturePoint[];
  /** Embarcaciones ya filtradas. */
  boats: Boat[];
  /** Embarcación seleccionada o señalada desde el listado. */
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  onHighlight: (slug: string | null) => void;
  /** El mapa solo se crea cuando su contenedor es visible. */
  visible: boolean;
  className?: string;
}) {
  const t = useTranslations("explorer");
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Record<string, Marker>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [slots, setSlots] = useState<Record<string, HTMLElement>>({});

  const fitToPoints = useCallback(
    async (animate: boolean) => {
      const map = mapRef.current;
      if (!map || departurePoints.length === 0) return;
      const { LngLatBounds } = await import("maplibre-gl");
      const bounds = new LngLatBounds();
      departurePoints.forEach((p) => bounds.extend([p.lng, p.lat]));
      const narrow = map.getContainer().clientWidth < 640;
      map.fitBounds(bounds, {
        // Hueco para que quepan los marcadores, que crecen hacia arriba y hacia
        // los lados, y en móvil también los botones y la tarjeta inferior.
        padding: narrow
          ? { top: 250, bottom: 150, left: 160, right: 160 }
          : { top: 220, bottom: 60, left: 170, right: 170 },
        maxZoom: mapConfig.fitMaxZoom,
        animate,
      });
    },
    [departurePoints],
  );

  // Crea el mapa la primera vez que el contenedor es visible.
  useEffect(() => {
    if (!visible || mapRef.current || !containerRef.current) return;
    let cancelled = false;
    const container = containerRef.current;

    (async () => {
      setStatus("loading");
      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled) return;
        maplibre.setWorkerUrl(mapConfig.workerUrl);

        const map = new maplibre.Map({
          container,
          style: mapConfig.styleUrl,
          maxBounds: mapConfig.viewLimit,
          minZoom: mapConfig.minZoom,
          // Posición inicial provisional; se ajusta a los puntos al crear.
          center: [departurePoints[0].lng, departurePoints[0].lat],
          zoom: 13,
          dragRotate: false,
          pitchWithRotate: false,
          attributionControl: { compact: true },
        });
        mapRef.current = map;
        map.touchZoomRotate.disableRotation();
        map.addControl(new maplibre.NavigationControl({ showCompass: false }), "bottom-right");

        const nextSlots: Record<string, HTMLElement> = {};
        departurePoints.forEach((p) => {
          const el = document.createElement("div");
          nextSlots[p.id] = el;
          const side = sideOf(p, departurePoints);
          markersRef.current[p.id] = new maplibre.Marker({
            element: el,
            // El marcador se abre hacia el lado libre para no tapar al vecino.
            anchor: side === "left" ? "bottom-right" : side === "right" ? "bottom-left" : "bottom",
            // Centra la punta (14 px de ancho) sobre la coordenada.
            offset: [side === "left" ? 7 : side === "right" ? -7 : 0, 0],
          })
            .setLngLat([p.lng, p.lat])
            .addTo(map);
        });
        setSlots(nextSlots);
        fitToPoints(false);

        map.once("load", () => !cancelled && setStatus("ready"));
        map.on("error", (e) => {
          // Si falla el estilo antes de cargar, se avisa; los errores de
          // teselas sueltas posteriores no tumban el mapa.
          if (!map.isStyleLoaded() && !cancelled) {
            console.warn("[mapa]", e.error?.message);
            setStatus((s) => (s === "ready" ? s : "error"));
          }
        });
      } catch (err) {
        console.warn("[mapa]", err);
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, departurePoints, fitToPoints]);

  // Libera el mapa al desmontar.
  useEffect(
    () => () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = {};
    },
    [],
  );

  // Al mostrarse de nuevo (cambio lista ↔ mapa en móvil) recalcula el tamaño.
  useEffect(() => {
    if (!visible || !mapRef.current) return;
    mapRef.current.resize();
    fitToPoints(false);
  }, [visible, fitToPoints]);

  // El marcador del punto con la embarcación activa pasa al frente.
  const activePoint = boats.find((b) => b.slug === activeSlug)?.departurePointId;
  useEffect(() => {
    Object.entries(slots).forEach(([id, el]) => {
      el.style.zIndex = id === activePoint ? "2" : "1";
    });
  }, [slots, activePoint]);

  return (
    <div className={cn("relative isolate bg-tint-100", className)}>
      <div
        ref={containerRef}
        role="region"
        aria-label={t("mapLabel")}
        className="size-full"
      />

      {departurePoints.map(
        (point) =>
          slots[point.id] &&
          createPortal(
            <PointMarker
              point={point}
              side={sideOf(point, departurePoints)}
              boats={boats.filter((b) => b.departurePointId === point.id)}
              activeSlug={activeSlug}
              onSelect={onSelect}
              onHighlight={onHighlight}
            />,
            slots[point.id],
          ),
      )}

      {status === "ready" && (
        <button
          type="button"
          onClick={() => fitToPoints(true)}
          aria-label={t("resetView")}
          title={t("resetView")}
          className="absolute bottom-[5.75rem] right-2.5 z-10 inline-flex size-[29px] items-center justify-center rounded bg-white text-ink shadow-[0_0_0_2px_rgb(0_0_0/0.1)] hover:bg-surface"
        >
          <LocateFixed className="size-4" aria-hidden />
        </button>
      )}

      {(status === "loading" || status === "idle") && (
        <p className="pointer-events-none absolute inset-x-0 top-4 mx-auto w-fit rounded-full bg-white/90 px-4 py-2 text-sm text-ink-2 shadow-float">
          {t("mapLoading")}
        </p>
      )}
      {status === "error" && (
        <p
          role="status"
          className="absolute inset-x-4 top-4 mx-auto max-w-sm rounded-control border border-warn/40 bg-warn-bg px-4 py-3 text-sm text-ink shadow-float"
        >
          {t("mapError")}
        </p>
      )}
    </div>
  );
}

type Side = "left" | "right" | "center";

/**
 * Hacia qué lado se abre el marcador: los puntos al oeste de la media se
 * abren a la izquierda y los del este, a la derecha. Solo afecta al dibujo;
 * la punta del marcador sigue señalando la coordenada del registro.
 */
function sideOf(point: DeparturePoint, all: DeparturePoint[]): Side {
  if (all.length < 2) return "center";
  const mean = all.reduce((sum, p) => sum + p.lng, 0) / all.length;
  if (point.lng === mean) return "center";
  return point.lng < mean ? "left" : "right";
}

/** Marcador de un punto de salida con las embarcaciones que salen de él. */
function PointMarker({
  point,
  side,
  boats,
  activeSlug,
  onSelect,
  onHighlight,
}: {
  point: DeparturePoint;
  side: Side;
  boats: Boat[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  onHighlight: (slug: string | null) => void;
}) {
  const t = useTranslations("explorer");
  const locale = useLocale();
  const empty = boats.length === 0;
  const active = boats.find((b) => b.slug === activeSlug);

  return (
    <div
      className={cn(
        "flex flex-col font-sans",
        side === "left" ? "items-end" : side === "right" ? "items-start" : "items-center",
      )}
    >
      <div
        className={cn(
          "w-max max-w-[11.5rem] rounded-[12px] border bg-white p-2 shadow-float transition-opacity",
          empty ? "border-line opacity-80" : "border-brand/30",
        )}
      >
        <p className="flex items-center gap-1 px-0.5 text-[0.8125rem] font-semibold leading-tight text-navy">
          <MapPin className="size-3.5 shrink-0 text-brand" aria-hidden />
          {point.name}
          {point.isTestData && (
            <span className="rounded bg-warn-bg px-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink">
              {t("testTag")}
            </span>
          )}
        </p>
        <p className="px-0.5 text-xs text-ink-3">
          {empty ? t("noneHere") : (active?.name ?? t("pointCount", { count: boats.length }))}
        </p>

        {!empty && (
          <ul className="mt-1.5 grid grid-cols-2 gap-1">
            {boats.map((boat) => {
              const isActive = boat.slug === activeSlug;
              const price = formatPrice(boat.priceFrom, locale);
              return (
                <li key={boat.slug}>
                  <button
                    type="button"
                    data-marker={boat.slug}
                    aria-pressed={isActive}
                    aria-label={t("markerLabel", { name: boat.name, price })}
                    title={boat.name}
                    onClick={() => onSelect(boat.slug)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && onHighlight(boat.slug)}
                    onPointerLeave={(e) => e.pointerType === "mouse" && onHighlight(null)}
                    className={cn(
                      "min-h-8 w-full rounded-full border px-2.5 text-[0.8125rem] font-semibold leading-none transition-[background-color,color,transform] duration-150",
                      isActive
                        ? "scale-105 border-navy bg-navy text-white"
                        : "border-ink-3/40 bg-white text-navy hover:border-navy hover:bg-tint-50",
                    )}
                  >
                    {price}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {/* Punta y punto de anclaje: señalan la coordenada exacta del registro. */}
      <span aria-hidden className="flex w-[14px] flex-col items-center">
        <span className="-mt-px size-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-white drop-shadow-[0_2px_1px_rgb(1_40_64/0.2)]" />
        <span className="mt-0.5 size-2.5 rounded-full border-2 border-white bg-brand shadow" />
      </span>
    </div>
  );
}
