"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { mainNav, site, whatsappUrl } from "@/config/site";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { ExternalButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { LanguageSwitcher, languageNames } from "./LanguageSwitcher";
import { Logo } from "./Logo";

const iconLink =
  "on-dark inline-flex size-11 items-center justify-center rounded-control text-white transition-colors hover:bg-white/10";

/**
 * Cabecera fija, azul marino como la actual.
 *  - Escritorio (≥1024 px): logo, menú, idioma, WhatsApp e Instagram.
 *  - Móvil y tableta: logo, WhatsApp y botón de menú, que abre un panel
 *    a pantalla completa.
 */
export function Header() {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Bloquea el desplazamiento de la página y permite cerrar con Escape.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="on-dark sticky top-0 z-40 bg-navy text-white">
      <div className="mx-auto flex h-header max-w-page items-center justify-between gap-4 px-4 sm:px-6 lg:h-header-lg lg:px-8">
        <Link
          href="/"
          aria-label={`${site.name} — ${t("home")}`}
          onClick={() => setOpen(false)}
          className="shrink-0"
        >
          <Logo priority className="w-[104px] lg:w-[158px]" />
        </Link>

        {/* Escritorio */}
        <div className="hidden items-center gap-6 lg:flex">
          <LanguageSwitcher />
          <nav aria-label={t("main")}>
            <ul className="flex items-center">
              {mainNav.map((item, i) => (
                <li
                  key={item.key}
                  className={cn("flex items-center", i > 0 && "border-l border-white/25")}
                >
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className="px-3 py-2 font-display text-lg text-white underline-offset-8 decoration-accent decoration-2 hover:underline aria-[current=page]:underline"
                  >
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tc("whatsapp")}
              className={iconLink}
            >
              <BrandIcon name="whatsapp" className="size-6" />
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tc("instagram")}
              className={iconLink}
            >
              <BrandIcon name="instagram" className="size-6" />
            </a>
          </div>
        </div>

        {/* Móvil y tableta */}
        <div className="flex items-center gap-1 lg:hidden">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tc("whatsapp")}
            className={iconLink}
          >
            <BrandIcon name="whatsapp" className="size-6" />
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpen((v) => !v)}
            className={iconLink}
          >
            {open ? <X className="size-7" aria-hidden /> : <Menu className="size-7" aria-hidden />}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-header z-40 overflow-y-auto bg-navy lg:hidden"
        >
          <div className="mx-auto flex min-h-full max-w-page flex-col px-4 pb-8 pt-2 sm:px-6">
            <nav aria-label={t("main")}>
              <ul>
                {mainNav.map((item) => (
                  <li key={item.key} className="border-b border-white/15">
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex min-h-14 items-center font-display text-xl text-white aria-[current=page]:text-tint-200"
                    >
                      {t(item.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-accent">{t("language")}</p>
              <ul className="grid grid-cols-2 gap-2">
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
                        "flex min-h-11 items-center justify-center rounded-control text-[0.9375rem] font-semibold transition-colors",
                        l === locale
                          ? "bg-white text-navy"
                          : "bg-white/10 text-white hover:bg-white/20",
                      )}
                    >
                      {languageNames[l]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-10">
              <ExternalButton
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="lg"
                fullWidth
                icon={<BrandIcon name="whatsapp" className="size-5" />}
              >
                {tc("whatsapp")} · {site.phoneDisplay}
              </ExternalButton>
              <ExternalButton
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                variant="onDark"
                size="lg"
                fullWidth
                icon={<BrandIcon name="instagram" className="size-5" />}
              >
                {tc("instagram")}
              </ExternalButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
