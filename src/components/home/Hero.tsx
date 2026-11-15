import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { SearchForm } from "./SearchForm";

/**
 * Hero de la portada: foto aérea a sangre, tarjeta de búsqueda a la izquierda
 * y borde inferior inclinado, como la web actual. En móvil la tarjeta ocupa
 * todo el ancho y la foto asoma por arriba.
 */
export async function Hero() {
  const t = await getTranslations("hero");

  return (
    <div className="bg-tint-50">
      <section className="clip-slant relative isolate bg-navy">
        <Image
          src={site.heroImage}
          alt={t("imageAlt")}
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <Container className="flex min-h-[34rem] items-end pb-[calc(2rem+3vw)] pt-40 sm:min-h-[38rem] sm:items-center sm:pb-[calc(4rem+3vw)] sm:pt-16 lg:min-h-[44rem]">
          <div className="w-full rounded-card bg-surface p-5 shadow-float sm:max-w-[34rem] sm:p-[30px]">
            <h1 className="font-display text-title font-medium text-navy">{t("title")}</h1>
            <p className="mb-5 mt-3 text-ink-2">{t("subtitle")}</p>
            <SearchForm />
          </div>
        </Container>
      </section>
    </div>
  );
}
