import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/** Ancho de página y márgenes laterales: 16 px en móvil, 24 px en tableta, 32 px en escritorio. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
