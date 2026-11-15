/**
 * Configuración provisional del sitio. Pasará a la tabla `settings`
 * (ARCHITECTURE.md §4.5) cuando exista la base de datos.
 */

/** Las imágenes se sirven desde el WordPress actual hasta migrarlas a Storage. */
export const MEDIA_BASE = "https://cadaquesrentaboat.com/wp-content/uploads";

/** Prefijo de ruta cuando la web se sirve en un subdirectorio (GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const IS_PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export const site = {
  name: "Cadaqués Rent a Boat",
  url: "https://cadaquesrentaboat.com",
  logo: {
    // Versión clara, para fondos azul marino. Pendiente: logo en vectorial.
    light: `${MEDIA_BASE}/2023/04/negreRecurso-2@2x.png`,
    width: 345,
    height: 170,
  },
  heroImage: `${MEDIA_BASE}/2025/03/WhatsApp-Image-2025-03-03-at-11.08.37-scaled.jpeg`,
  // PENDIENTE D-14: la web actual muestra dos números (648 869 034 y 620 288 126).
  // Se usa el de la cabecera hasta que el negocio confirme el oficial.
  whatsapp: "34648869034",
  phoneDisplay: "648 869 034",
  instagram: "https://www.instagram.com/cadaquesrentaboat/",
} as const;

export const mainNav = [
  { key: "boats", href: "/vaixells" },
  { key: "experiences", href: "/experiencies" },
  { key: "faq", href: "/preguntes-frequents" },
  { key: "contact", href: "/contacte" },
] as const;

export const legalNav = [
  { key: "privacy", href: "/legal/privacitat" },
  { key: "refunds", href: "/legal/devolucions" },
  { key: "terms", href: "/legal/termes" },
  { key: "cookies", href: "/legal/cookies" },
] as const;

export const whatsappUrl = `https://wa.me/${site.whatsapp}`;
