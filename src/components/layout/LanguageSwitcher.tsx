"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/cn";

export const languageNames: Record<string, string> = {
  ca: "Català",
  es: "Español",
  en: "English",
  fr: "Français",
};

/** Desplegable de idioma de la cabecera (escritorio). */
export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${t("language")}: ${languageNames[locale]}`}
        onClick={() => setOpen((v) => !v)}
        className="on-dark inline-flex min-h-11 items-center gap-1.5 rounded-control bg-white/10 px-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-white/20"
      >
        <Globe className="size-4" aria-hidden />
        {locale}
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </button>

      {open && (
        <ul className="absolute right-0 top-full z-50 mt-2 min-w-44 overflow-hidden rounded-control border border-line bg-white py-1 shadow-float">
          {routing.locales.map((l) => (
            <li key={l}>
              <Link
                href={pathname}
                locale={l}
                lang={l}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 px-4 text-[0.9375rem] text-ink hover:bg-tint-50",
                  l === locale && "font-semibold text-brand",
                )}
              >
                {languageNames[l]}
                {l === locale && <Check className="size-4" aria-hidden />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
