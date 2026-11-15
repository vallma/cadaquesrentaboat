import { useId, type ComponentProps, type ReactNode } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Controles de formulario. Altura de 48 px, texto de 16 px (evita el zoom
 * automático de iOS) y borde con contraste suficiente.
 */
const control =
  "block w-full min-h-12 rounded-control border border-ink-3 bg-white px-3.5 " +
  "font-sans text-base text-ink placeholder:text-ink-3 " +
  "transition-[border-color,box-shadow] duration-150 " +
  "hover:border-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-3 disabled:hover:border-ink-3 " +
  "aria-invalid:border-danger aria-invalid:focus:ring-danger/30";

interface FieldShellProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: FieldShellProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-ink">
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            {" *"}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-sm text-ink-3">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string) {
  return error ? `${id}-error` : hint ? `${id}-hint` : undefined;
}

type InputProps = FieldShellProps & Omit<ComponentProps<"input">, "className">;

export function Input({ label, hint, error, className, id, required, ...props }: InputProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell {...{ label, hint, error, required, className }} id={fieldId}>
      <input
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={control}
        {...props}
      />
    </FieldShell>
  );
}

type SelectProps = FieldShellProps & Omit<ComponentProps<"select">, "className">;

export function Select({
  label,
  hint,
  error,
  className,
  id,
  required,
  children,
  ...props
}: SelectProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell {...{ label, hint, error, required, className }} id={fieldId}>
      <div className="relative">
        <select
          id={fieldId}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(fieldId, hint, error)}
          className={cn(control, "appearance-none pr-10")}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-ink-2"
          aria-hidden
        />
      </div>
    </FieldShell>
  );
}

type TextareaProps = FieldShellProps & Omit<ComponentProps<"textarea">, "className">;

export function Textarea({
  label,
  hint,
  error,
  className,
  id,
  required,
  rows = 4,
  ...props
}: TextareaProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <FieldShell {...{ label, hint, error, required, className }} id={fieldId}>
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(fieldId, hint, error)}
        className={cn(control, "py-3")}
        {...props}
      />
    </FieldShell>
  );
}

export function Checkbox({
  label,
  className,
  id,
  ...props
}: { label: ReactNode } & Omit<ComponentProps<"input">, "type">) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={fieldId}
        type="checkbox"
        className="mt-0.5 size-5 shrink-0 rounded border-ink-3 accent-brand disabled:opacity-50"
        {...props}
      />
      <label htmlFor={fieldId} className="text-[0.9375rem] text-ink">
        {label}
      </label>
    </div>
  );
}
