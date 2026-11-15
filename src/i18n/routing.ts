import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ca", "es", "en", "fr"],
  defaultLocale: "ca",
  // Igual que la web actual: catalán sin prefijo; /es, /en, /fr.
  // En la web de pruebas estática (GitHub Pages) no hay servidor que resuelva
  // la raíz, así que todos los idiomas llevan prefijo: /ca, /es, /en, /fr.
  localePrefix: process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" ? "always" : "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
