import { notFound } from "next/navigation";

/** Cualquier ruta aún no construida muestra el «no encontrado» del idioma activo. */
export default function CatchAll() {
  notFound();
}
