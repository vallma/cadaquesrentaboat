import type { ComponentProps, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "onDark";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-sans font-semibold " +
  "transition-colors duration-150 select-none whitespace-nowrap " +
  "disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  // Botón «Buscar» actual: azul marino sólido.
  primary: "bg-navy text-surface hover:bg-brand active:bg-brand-strong",
  // Botones de ficha actuales («Trucar», «WhatsApp»): tinte claro y texto primario.
  secondary: "bg-tint-50 text-brand hover:bg-tint-100 active:bg-tint-200",
  outline:
    "border border-brand text-brand bg-transparent hover:bg-tint-50 active:bg-tint-100",
  ghost: "text-brand hover:bg-tint-50 active:bg-tint-100",
  // Para cabecera y pie (fondo azul marino).
  onDark: "on-dark bg-white/10 text-white hover:bg-white/20 active:bg-white/25",
};

const sizes: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 text-sm",
  md: "min-h-11 px-5 text-base", // 44 px: objetivo táctil mínimo
  lg: "min-h-13 px-7 text-lg",
};

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: StyleProps = {}) {
  return cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);
}

type ButtonProps = StyleProps &
  Omit<ComponentProps<"button">, "className"> & {
    loading?: boolean;
    icon?: ReactNode;
  };

export function Button({
  variant,
  size,
  fullWidth,
  className,
  loading,
  icon,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-[1.1em] animate-spin" aria-hidden />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}

type ButtonLinkProps = StyleProps &
  Omit<ComponentProps<typeof Link>, "className"> & { icon?: ReactNode };

/** Enlace interno con aspecto de botón. */
export function ButtonLink({
  variant,
  size,
  fullWidth,
  className,
  icon,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {icon}
      {children}
    </Link>
  );
}

type ExternalButtonProps = StyleProps &
  Omit<ComponentProps<"a">, "className"> & { icon?: ReactNode };

/** Enlace externo (WhatsApp, teléfono) con aspecto de botón. */
export function ExternalButton({
  variant,
  size,
  fullWidth,
  className,
  icon,
  children,
  ...props
}: ExternalButtonProps) {
  return (
    <a className={buttonClasses({ variant, size, fullWidth, className })} {...props}>
      {icon}
      {children}
    </a>
  );
}
