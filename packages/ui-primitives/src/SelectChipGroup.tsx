import type { ReactNode } from "react";

export type SelectChipGroupProps = {
  children: ReactNode;
  error?: string;
};

export function SelectChipGroup({ children, error }: SelectChipGroupProps) {
  return (
    <div>
      <div className="mt-3 flex flex-wrap gap-3">{children}</div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
