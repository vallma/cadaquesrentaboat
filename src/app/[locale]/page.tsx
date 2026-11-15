import { ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCatalog } from "@/lib/catalog/repository";
import { BoatGrid } from "@/components/boat/BoatGrid";
import { Hero } from "@/components/home/Hero";
import { ButtonLink } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("boats");
  const { boats, departurePoints } = await getCatalog();

  return (
    <>
      <Hero />
      <Section id="embarcacions" title={t("title")} tone="tint">
        <BoatGrid boats={boats} departurePoints={departurePoints} />
        <div className="mt-8 flex justify-center sm:mt-10">
          <ButtonLink
            href="/vaixells"
            variant="outline"
            className="w-full bg-white sm:w-auto"
          >
            {t("viewAll")}
            <ArrowRight className="size-[1.1em]" aria-hidden />
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
