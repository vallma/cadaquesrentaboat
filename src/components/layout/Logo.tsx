import Image from "next/image";
import { site } from "@/config/site";
import { cn } from "@/lib/cn";

/** Logo en versión clara. Solo se usa sobre fondo azul marino. */
export function Logo({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src={site.logo.light}
      alt={site.name}
      width={site.logo.width}
      height={site.logo.height}
      priority={priority}
      className={cn("h-auto font-display text-sm font-semibold text-white", className)}
    />
  );
}
