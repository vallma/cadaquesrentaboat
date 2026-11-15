import { MEDIA_BASE } from "@/config/site";
import type { Boat } from "@/lib/catalog/types";

/**
 * ⚠️ DATOS DE PRUEBA — NO USAR EN PRODUCCIÓN.
 *
 * Copia de lo que publicaba la web el 14-11-2026, sin validar por el negocio.
 * Sustituye a la base de datos hasta la fase 1 del ROADMAP. Ver AUDIT.md §4.2:
 *  - C1/C2: precios «desde» tomados del listado /vaixells.
 *  - C4/C6/C7: el modo de patrón sale de las etiquetas del listado
 *    /embarcacions, que se contradicen con algunas fichas (Antares, Ray, Minola).
 *  - C5: punto de salida tomado del listado (Antares y Selva difieren en su ficha).
 *  - C13: nombres comerciales sin unificar.
 *  - El tipo de Antares y Talaia es una suposición (no se pudo leer la taxonomía).
 */
const img = (path: string) => `${MEDIA_BASE}/${path}`;

export const TEST_BOATS: Boat[] = [
  {
    slug: "beneteau-antares",
    name: "Beneteau Antares 8",
    type: "llanxa",
    departurePointId: "cadaques",
    capacity: 8,
    horsepower: 150,
    priceFrom: 550,
    skipper: "none",
    licenseFree: false,
    image: img("2025/02/Ja-hi-tornem-13-1-scaled.jpg"),
    isTestData: true,
  },
  {
    slug: "chups-llaut-tradicional",
    name: "Chups Llaüt Tradicional",
    type: "llaut",
    departurePointId: "port-lligat",
    capacity: 6,
    horsepower: 33,
    priceFrom: 300,
    skipper: "optional",
    licenseFree: false,
    image: img("2025/07/Imagen-de-WhatsApp-2025-07-01-a-las-16.25.57_91256897-scaled.jpg"),
    isTestData: true,
  },
  {
    slug: "llaut-junquet",
    name: "Llaüt Junquet",
    type: "llaut",
    departurePointId: "port-lligat",
    capacity: 6,
    horsepower: 35,
    priceFrom: 350,
    skipper: "optional",
    licenseFree: false,
    image: img("2025/02/WhatsApp-Image-2025-02-13-at-18.34.11-1.jpeg"),
    isTestData: true,
  },
  {
    slug: "llaut-passanella",
    name: "Llaüt Passanella",
    type: "llaut",
    departurePointId: "port-lligat",
    capacity: 6,
    horsepower: 35,
    priceFrom: 350,
    skipper: "optional",
    licenseFree: false,
    image: img("2025/02/WhatsApp-Image-2025-02-13-at-18.32.34-1.jpeg"),
    isTestData: true,
  },
  {
    slug: "minola",
    name: "Minola",
    type: "semirrigida",
    departurePointId: "port-lligat",
    capacity: 8,
    horsepower: 40,
    priceFrom: 320,
    skipper: "optional",
    licenseFree: false,
    image: img("2025/05/image00007-scaled.jpeg"),
    isTestData: true,
  },
  {
    slug: "nurat-llaut-4m",
    name: "Nurat, llaüt 4m",
    type: "llaut",
    departurePointId: "cadaques",
    capacity: 4,
    horsepower: 9,
    priceFrom: 260,
    skipper: "none",
    licenseFree: false,
    image: img("2026/06/nurat1.jpeg"),
    isTestData: true,
  },
  {
    slug: "ray",
    name: "Ray",
    type: "semirrigida",
    departurePointId: "port-lligat",
    capacity: 7,
    horsepower: 15,
    priceFrom: 290,
    skipper: "none",
    licenseFree: true,
    image: img("2025/04/IMG_0922-scaled.jpeg"),
    isTestData: true,
  },
  {
    slug: "selva-470",
    name: "Selva 470 (Tascons)",
    type: "semirrigida",
    departurePointId: "cadaques",
    capacity: 7,
    horsepower: 40,
    priceFrom: 290,
    skipper: "optional",
    licenseFree: false,
    image: img("2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-12.54.01_49568c5c-1.jpg"),
    isTestData: true,
  },
  {
    slug: "talaia",
    name: "Talaia",
    type: "llanxa",
    departurePointId: "port-lligat",
    capacity: 5,
    horsepower: 15,
    priceFrom: 250,
    skipper: "none",
    licenseFree: true,
    image: img("2025/02/Imagen-de-WhatsApp-2024-06-26-a-las-15.32.44_451d2f04-1.jpg"),
    isTestData: true,
  },
];
