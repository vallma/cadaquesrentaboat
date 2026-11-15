import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BoatCardSkeleton } from "@/components/boat/BoatCard";
import { BoatExplorer } from "@/components/explorer/BoatExplorer";
import { Skeleton } from "@/components/ui/Feedback";
import { routing } from "@/i18n/routing";
import { getCatalog } from "@/lib/catalog/repository";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/vaixells">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "explorer" });
  const path = (l: string) => (l === routing.defaultLocale ? "/vaixells" : `/${l}/vaixells`);
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path(locale),
      languages: {
        ...Object.fromEntries(routing.locales.map((l) => [l, path(l)])),
        "x-default": "/vaixells",
      },
    },
  };
}

export default async function BoatsPage({ params }: PageProps<"/[locale]/vaixells">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const catalog = await getCatalog();

  return (
    // Los filtros se leen de la URL en el navegador; mientras, se muestra el esqueleto.
    <Suspense fallback={<ExplorerSkeleton />}>
      <BoatExplorer catalog={catalog} />
    </Suspense>
  );
}

function ExplorerSkeleton() {
  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,42%)]">
      <div className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="mt-5 h-40 rounded-card" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <BoatCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <div className="hidden bg-tint-100 lg:block lg:h-[calc(100dvh-var(--spacing-header-lg))]" />
    </div>
  );
}
