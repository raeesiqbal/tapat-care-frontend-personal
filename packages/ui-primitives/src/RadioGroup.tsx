export type RadioGroupOption = {
  label: string;
  value: string;
};

export type RadioGroupProps = {
  label: string;
  name: string;
  value: string;
  options: readonly RadioGroupOption[];
  error?: string;
  required?: boolean;
  onChange: (value: string) => void;
};

export function RadioGroup({
  label,
  name,
  value,
  options,
  error,
  required,
  onChange,
}: RadioGroupProps) {
  return (
    <fieldset>
      <legend className="mb-2 block text-sm font-medium text-heading text-gray-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center rounded-[8px] border px-3 py-3 text-sm font-medium transition ${
                active
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-white text-gray-700 hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={active}
                className="mr-2 h-4 w-4 accent-primary"
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </fieldset>
  );
}
