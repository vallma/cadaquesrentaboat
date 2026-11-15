import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container } from "./Container";

const tones = {
  white: "bg-white",
  tint: "bg-tint-50", // fondo de «Embarcacions» en la portada actual
  surface: "bg-surface", // fondo del listado actual
};

export function Section({
  title,
  tone = "white",
  id,
  children,
  className,
}: {
  title?: string;
  tone?: keyof typeof tones;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={cn("py-14 sm:py-20", tones[tone], className)}
    >
      <Container>
        {title && (
          <h2
            id={headingId}
            className="mb-8 text-center font-display text-display font-normal text-brand sm:mb-10"
          >
            {title}
          </h2>
        )}
        {children}
      </Container>
    </section>
  );
}
