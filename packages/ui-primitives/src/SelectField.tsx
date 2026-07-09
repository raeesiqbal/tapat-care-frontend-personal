import type { ChangeEvent } from "react";
import type { TextFieldProps } from "./TextField";

export type FieldOption = {
  label: string;
  value: string;
  description?: string;
};

export type SelectFieldProps = Omit<TextFieldProps, "type" | "icon" | "onChange"> & {
  options: FieldOption[];
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export function SelectField({
  label,
  name,
  options,
  required = false,
  error,
  helperText,
  placeholder,
  autoComplete,
  defaultValue,
  value,
  className = "",
  onBlur,
  onChange,
}: SelectFieldProps) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-heading text-gray-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>

      <select
        name={name}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        defaultValue={defaultValue}
        value={value}
        onBlur={onBlur}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${name}-error` : helperText ? `${name}-helper` : undefined
        }
        className={`w-full rounded-[8px] border bg-white px-3 py-4 text-[16px] text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-violet-100 md:py-2.5 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-500">
          {error}
        </p>
      ) : null}
      {!error && helperText ? (
        <p id={`${name}-helper`} className="mt-2 text-sm text-gray-500">
          {helperText}
        </p>
      ) : null}
    </label>
  );
}
