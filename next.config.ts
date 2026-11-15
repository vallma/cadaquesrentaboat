import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Compilación estática para la web de pruebas en GitHub Pages
 * (`npm run build:pages`). En producción no se usa: allí la app corre en un
 * servidor con rutas por idioma gestionadas por `src/proxy.ts`.
 */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? { output: "export" as const, trailingSlash: true, basePath }
    : // El prerenderizado parcial necesita servidor; no existe en la exportación estática.
      { cacheComponents: true, partialPrefetching: true }),
  images: {
    // Provisional: las fotos se sirven desde el WordPress actual hasta que se
    // migren a Supabase Storage (fase 2). Entonces se activa la optimización.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "cadaquesrentaboat.com", pathname: "/wp-content/uploads/**" },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
