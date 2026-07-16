import type { ReactNode } from "react";

export type ReviewSectionRow = {
  label: string;
  value: ReactNode;
};

export type ReviewSectionProps = {
  title: string;
  action?: ReactNode;
  rows: ReadonlyArray<ReviewSectionRow>;
  className?: string;
};

export function ReviewSection({
  title,
  action,
  rows,
  className = "",
}: ReviewSectionProps) {
  return (
    <section
      className={`rounded-[20px] border border-gray-100 bg-white shadow-card ${className}`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 sm:px-8">
        <h2 className="text-heading-5 text-gray-950">{title}</h2>
        {action}
      </div>
      <div className="px-6 sm:px-8">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border-b border-gray-100 py-5 sm:grid-cols-[220px_1fr] sm:gap-6"
          >
            <p className="text-[15px] font-semibold text-gray-700">
              {row.label}
            </p>
            <div className="text-[16px] text-gray-950">{row.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
