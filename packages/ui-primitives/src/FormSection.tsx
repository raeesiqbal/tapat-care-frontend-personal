import type { ReactNode } from "react";

export type FormSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <section className={className}>
      <div className="max-w-[680px]">
        <h2 className="text-[18px] font-semibold text-gray-950">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
