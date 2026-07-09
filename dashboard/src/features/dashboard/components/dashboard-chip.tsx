import type { ReactNode } from "react";

type DashboardChipProps = {
  label: string;
  className?: string;
  icon?: ReactNode;
  variant?: "brand" | "muted";
};

export function DashboardChip({
  label,
  className = "",
  icon,
  variant = "muted",
}: DashboardChipProps) {
  const variantClassName =
    variant === "brand"
      ? "border border-violet-200 bg-violet-50 text-[var(--tapat-color-brand-purple-700)]"
      : "bg-gray-50 text-gray-600";

  return (
    <span
      className={`inline-flex max-w-full shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${variantClassName} ${className}`}
    >
      {icon ? <span className="mr-1 shrink-0">{icon}</span> : null}
      {label}
    </span>
  );
}
