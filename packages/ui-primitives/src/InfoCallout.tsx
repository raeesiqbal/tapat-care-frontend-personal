import type { ReactNode } from "react";
import { Info } from "lucide-react";

export type InfoCalloutProps = {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function InfoCallout({
  children,
  icon = <Info className="h-4 w-4" />,
  className = "",
}: InfoCalloutProps) {
  return (
    <div
      className={`flex gap-3 rounded-[12px] border border-violet-100 bg-violet-50 px-4 py-3 text-sm leading-6 text-gray-800 ${className}`}
    >
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
        {icon}
      </span>
      <p>{children}</p>
    </div>
  );
}
