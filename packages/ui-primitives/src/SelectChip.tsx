export type SelectChipProps = {
  label: string;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function SelectChip({
  label,
  active = false,
  onClick,
  className = "",
}: SelectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-full border px-4 py-2 text-sm font-medium transition
        ${
          active
            ? "border-primary bg-primary text-white"
            : "border-primary/70 bg-primary/10 text-primary hover:bg-primary/20"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
}
