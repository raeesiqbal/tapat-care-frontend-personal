export type FieldErrors<TField extends string = string> = Partial<
  Record<TField, string>
>;

export type FieldValidator<TValues extends Record<string, string>> = (
  value: string,
  values: TValues,
) => string | null | undefined;

export type FieldValidationConfig<TValues extends Record<string, string>> = {
  label: string;
  required?: boolean;
  validators?: FieldValidator<TValues>[];
};

export type FormValidationConfig<TValues extends Record<string, string>> = {
  [TField in keyof TValues]: FieldValidationConfig<TValues>;
};

export function validateField<TValues extends Record<string, string>>(
  field: keyof TValues & string,
  values: TValues,
  config: FormValidationConfig<TValues>,
) {
  const fieldConfig = config[field];
  const value = values[field]?.trim() ?? "";

  if (fieldConfig.required && !value) {
    return `${fieldConfig.label} is required.`;
  }

  if (!value) {
    return undefined;
  }

  for (const validator of fieldConfig.validators ?? []) {
    const message = validator(value, values);
    if (message) {
      return message;
    }
  }

  return undefined;
}

export function validateForm<TValues extends Record<string, string>>(
  values: TValues,
  config: FormValidationConfig<TValues>,
  fields?: ReadonlyArray<keyof TValues & string>,
) {
  const fieldsToValidate =
    fields ?? (Object.keys(config) as Array<keyof TValues & string>);

  return fieldsToValidate.reduce((errors, field) => {
    const error = validateField(field, values, config);

    if (error) {
      return {
        ...errors,
        [field]: error,
      };
    }

    return errors;
  }, {} as FieldErrors<keyof TValues & string>);
}

export function hasFieldErrors(errors: FieldErrors) {
  return Object.keys(errors).length > 0;
}
