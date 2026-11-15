import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  // Chips de la ficha actual (plazas, potencia, eslora).
  tint: "bg-tint-200 text-brand",
  neutral: "bg-surface text-ink-2",
  navy: "bg-navy text-white",
  success: "bg-success-bg text-success",
  warn: "bg-warn-bg text-ink",
  danger: "bg-danger-bg text-danger",
};

export function Chip({
  tone = "tint",
  icon,
  children,
  className,
}: {
  tone?: keyof typeof tones;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium leading-none",
        "[&>svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
