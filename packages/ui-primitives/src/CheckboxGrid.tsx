import type { ReactNode } from "react";

export type CheckboxGridProps = {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function CheckboxGrid({
  label,
  error,
  required = true,
  children,
}: CheckboxGridProps) {
  return (
    <fieldset>
      <legend className="mb-3 block text-sm font-medium text-heading text-gray-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </fieldset>
  );
}
