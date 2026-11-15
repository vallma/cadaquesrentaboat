import type { ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const alertTones = {
  info: { box: "bg-tint-50 text-navy border-tint-200", Icon: Info },
  success: { box: "bg-success-bg text-success border-success/25", Icon: CircleCheck },
  warn: { box: "bg-warn-bg text-ink border-warn/40", Icon: TriangleAlert },
  danger: { box: "bg-danger-bg text-danger border-danger/25", Icon: CircleAlert },
};

export function Alert({
  tone = "info",
  title,
  children,
  className,
}: {
  tone?: keyof typeof alertTones;
  title?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { box, Icon } = alertTones[tone];
  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={cn("flex gap-3 rounded-control border p-4 text-[0.9375rem]", box, className)}
    >
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "text-ink")}>{children}</div>}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("animate-pulse rounded-md bg-tint-200/70", className)} />
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-card border border-dashed border-ink-3/50 bg-white px-6 py-10 text-center">
      {icon && <div className="text-accent [&>svg]:size-10">{icon}</div>}
      <p className="font-display text-lg font-medium text-navy">{title}</p>
      {children && <p className="text-[0.9375rem] text-ink-2">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
