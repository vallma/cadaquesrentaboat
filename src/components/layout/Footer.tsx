import { ChevronRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { legalNav, mainNav, site, whatsappUrl } from "@/config/site";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";

const footerLink =
  "group inline-flex min-h-9 items-center gap-2 text-[0.9375rem] text-white/85 transition-colors hover:text-white";

const socialButton =
  "inline-flex size-12 items-center justify-center rounded-md bg-white/10 text-white transition-colors hover:bg-white/20";

/**
 * Pie azul marino con barra inferior más oscura, como el actual.
 * Se añade el menú principal, que hoy no está en el pie.
 */
export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("common");
  // El año se fija en compilación; la página es estática.
  const year = 2026;

  return (
    <footer className="on-dark bg-navy text-white">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:gap-12">
        <div>
          <Logo className="w-[140px]" />
          <p className="mt-4 max-w-xs text-[0.9375rem] text-white/75">{t("tagline")}</p>
        </div>

        <nav aria-label={t("explore")}>
          <h2 className="mb-2 font-display text-base font-medium text-white">{t("explore")}</h2>
          <ul>
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={footerLink}>
                  <ChevronRight className="size-4 text-accent" aria-hidden />
                  {tn(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("legal")}>
          <h2 className="mb-2 font-display text-base font-medium text-white">{t("legal")}</h2>
          <ul>
            {legalNav.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={footerLink}>
                  <ChevronRight className="size-4 text-accent" aria-hidden />
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 font-display text-base font-medium text-white">{t("contact")}</h2>
          <div className="flex gap-2">
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={tc("instagram")}
              className={socialButton}
            >
              <BrandIcon name="instagram" className="size-6" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${tc("whatsapp")} ${site.phoneDisplay}`}
              className={socialButton}
            >
              <BrandIcon name="whatsapp" className="size-6" />
            </a>
          </div>
          <p className="mt-3 text-[0.9375rem] text-white/85">{site.phoneDisplay}</p>
        </div>
      </Container>

      <div className="bg-navy-deep">
        <Container className="py-4 text-center text-sm text-white/80">
          {site.name} © {year}. {t("rights")}.
        </Container>
      </div>
    </footer>
  );
}
