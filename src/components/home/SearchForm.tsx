"use client";

import { Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BASE_PATH, IS_PREVIEW } from "@/config/site";
import { getPathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";

const boatTypes = ["llanxa", "llaut", "semirrigida"] as const;

/**
 * Buscador de la portada: fecha y tipo de barca, como el actual.
 * Es un formulario GET que lleva al listado con los filtros en la URL
 * (ARCHITECTURE.md §5.2). No consulta disponibilidad todavía.
 */
export function SearchForm() {
  const t = useTranslations("search");
  const tt = useTranslations("types");
  const locale = useLocale();

  // La fecha mínima (hoy) se fija en el navegador, no al compilar la página.
  const setMinToday = (el: HTMLInputElement | null) => {
    if (!el) return;
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    el.min = d.toISOString().slice(0, 10);
  };

  return (
    <form
      action={`${BASE_PATH}${getPathname({ locale, href: "/vaixells" })}${IS_PREVIEW ? "/" : ""}`}
      method="get"
      className="flex flex-col gap-4"
    >
      <Input label={t("date")} name="data" type="date" ref={setMinToday} />
      <Select label={t("type")} name="tipus" defaultValue="">
        <option value="">{t("all")}</option>
        {boatTypes.map((type) => (
          <option key={type} value={type}>
            {tt(type)}
          </option>
        ))}
      </Select>
      <Button
        type="submit"
        className="mt-1 w-full sm:w-auto sm:self-center sm:px-8"
        icon={<Search className="size-[1.1em]" aria-hidden />}
      >
        {t("submit")}
      </Button>
    </form>
  );
}
