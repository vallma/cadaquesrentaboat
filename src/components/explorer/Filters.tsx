"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input, Select } from "@/components/ui/Field";
import { BOAT_TYPES, SKIPPER_MODES, type Filters } from "@/lib/catalog/filters";
import type { BoatType, DeparturePoint, SkipperMode } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";

/**
 * Controles de filtro. Sin estado propio: recibe los filtros y avisa de cada
 * cambio. Se usa en línea en escritorio y dentro del panel en móvil.
 */
export function FilterFields({
  filters,
  onChange,
  departurePoints,
  maxCapacity,
  price,
  className,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  departurePoints: DeparturePoint[];
  maxCapacity: number;
  price: { min: number; max: number };
  className?: string;
}) {
  const t = useTranslations("explorer");
  const tt = useTranslations("types");
  const locale = useLocale();
  const priceId = useId();
  const priceValue = filters.maxPrice ?? price.max;

  // La fecha mínima (hoy) se fija en el navegador, no al compilar la página.
  const setMinToday = (el: HTMLInputElement | null) => {
    if (!el) return;
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    el.min = d.toISOString().slice(0, 10);
  };

  return (
    <div className={cn("grid gap-x-4 gap-y-4 sm:grid-cols-2 xl:grid-cols-3", className)}>
      <Input
        label={t("date")}
        type="date"
        ref={setMinToday}
        value={filters.date ?? ""}
        onChange={(e) => onChange({ date: e.target.value || undefined })}
      />

      <Select
        label={t("people")}
        value={filters.people ?? ""}
        onChange={(e) => onChange({ people: Number(e.target.value) || undefined })}
      >
        <option value="">{t("anyPeople")}</option>
        {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {t("peopleOption", { count: n })}
          </option>
        ))}
      </Select>

      <Select
        label={t("type")}
        value={filters.type ?? ""}
        onChange={(e) => onChange({ type: (e.target.value || undefined) as BoatType | undefined })}
      >
        <option value="">{t("all")}</option>
        {BOAT_TYPES.map((type) => (
          <option key={type} value={type}>
            {tt(type)}
          </option>
        ))}
      </Select>

      <Select
        label={t("skipper")}
        value={filters.skipper ?? ""}
        onChange={(e) =>
          onChange({ skipper: (e.target.value || undefined) as SkipperMode | undefined })
        }
      >
        <option value="">{t("all")}</option>
        {SKIPPER_MODES.map((mode) => (
          <option key={mode} value={mode}>
            {t(mode === "none" ? "skipperNone" : "skipperOptional")}
          </option>
        ))}
      </Select>

      <Select
        label={t("departure")}
        value={filters.departurePointId ?? ""}
        onChange={(e) => onChange({ departurePointId: e.target.value || undefined })}
      >
        <option value="">{t("all")}</option>
        {departurePoints.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={priceId}
          className="flex items-baseline justify-between gap-2 text-[0.9375rem] font-medium text-ink"
        >
          {t("price")}
          <span className="font-semibold text-brand">
            {t("upTo", { price: formatPrice(priceValue, locale) })}
          </span>
        </label>
        <div className="flex min-h-12 items-center">
          <input
            id={priceId}
            type="range"
            min={price.min}
            max={price.max}
            step={10}
            value={priceValue}
            onChange={(e) => {
              const v = Number(e.target.value);
              onChange({ maxPrice: v >= price.max ? undefined : v });
            }}
            className="h-2 w-full cursor-pointer accent-brand"
          />
        </div>
      </div>
    </div>
  );
}
