import type { ChangeEvent, InputHTMLAttributes, ReactNode } from "react";

export type TextFieldProps = {
  label: ReactNode;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: InputHTMLAttributes<HTMLInputElement>["inputMode"];
  min?: InputHTMLAttributes<HTMLInputElement>["min"];
  step?: InputHTMLAttributes<HTMLInputElement>["step"];
  required?: boolean;
  defaultValue?: string;
  value?: string;
  error?: string;
  icon?: ReactNode;
  iconClassName?: string;
  inputClassName?: string;
  className?: string;
  helperText?: string;
  statusText?: string;
  readOnly?: boolean;
  onBlur?: () => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function TextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  inputMode,
  min,
  step,
  required,
  defaultValue,
  value,
  error,
  icon,
  iconClassName = "left-4 text-gray-400",
  inputClassName,
  className = "",
  helperText,
  statusText,
  readOnly,
  onBlur,
  onChange,
}: TextFieldProps) {
  const inputStateClassName = readOnly
    ? `${error ? "border-red-400" : "border-gray-200"} cursor-not-allowed bg-gray-100 text-gray-500 placeholder:text-gray-400 focus:border-gray-200 focus:ring-0`
    : `${error ? "border-red-400" : "border-gray-200"} bg-white text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-violet-100`;

  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-heading text-gray-900">
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </span>
      <span className="relative block">
        {icon ? (
          <span
            className={`pointer-events-none absolute top-1/2 flex h-4 w-7 -translate-y-1/2 items-center justify-center ${iconClassName}`}
          >
            {icon}
          </span>
        ) : null}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          step={step}
          aria-required={required || undefined}
          readOnly={readOnly}
          onBlur={onBlur}
          onChange={onChange}
          defaultValue={defaultValue}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-error` : undefined}
          aria-disabled={readOnly || undefined}
          className={`w-full rounded-[8px] border px-3 py-4 text-[16px] outline-none transition md:py-2.5 ${
            icon ? inputClassName || "pl-12" : inputClassName || ""
          } ${inputStateClassName}`}
        />
      </span>
      {error ? (
        <span id={`${name}-error`} className="mt-2 block text-sm text-red-600">
          {error}
        </span>
      ) : null}
      {!error && statusText ? (
        <span className="mt-2 block text-sm text-gray-500">{statusText}</span>
      ) : null}
      {!error && !statusText && helperText ? (
        <span className="mt-2 block text-sm text-gray-500">{helperText}</span>
      ) : null}
    </label>
  );
}
