export type CheckboxCardProps = {
  label: string;
  checked: boolean;
  onChange: () => void;
};

export function CheckboxCard({
  label,
  checked,
  onChange,
}: CheckboxCardProps) {
  return (
    <label
      className={`flex cursor-pointer items-center rounded-[8px] border px-3 py-3 text-sm font-medium transition ${
        checked
          ? "border-primary bg-primary/10 text-primary"
          : "border-gray-200 bg-white text-gray-700 hover:border-primary/40"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        className="mr-2 h-4 w-4 rounded border-gray-300 accent-primary"
        onChange={onChange}
      />
      {label}
    </label>
  );
}
