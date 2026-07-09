"use client";

import { useState } from "react";
import type { FieldErrors } from "../validation/form-validation";

type ValidationContext = {
  hasSubmitted: boolean;
};

type UseValidatedFormOptions<
  TValues extends Record<string, string>,
  TField extends keyof TValues & string,
> = {
  initialValues: TValues;
  validateField: (
    field: TField,
    values: TValues,
  ) => string | null | undefined;
  getFieldsToValidateOnChange?: (
    field: TField,
    values: TValues,
    context: ValidationContext,
  ) => TField[];
  shouldValidateOnBlur?: (
    field: TField,
    values: TValues,
    context: ValidationContext,
  ) => boolean;
};

export function useValidatedForm<
  TValues extends Record<string, string>,
  TField extends keyof TValues & string = keyof TValues & string,
>({
  initialValues,
  validateField,
  getFieldsToValidateOnChange,
  shouldValidateOnBlur,
}: UseValidatedFormOptions<TValues, TField>) {
  const [values, setValues] = useState<TValues>(initialValues);
  const [clientErrors, setClientErrors] = useState<FieldErrors<TField>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  function validateFields(nextValues: TValues, fields: TField[]) {
    if (fields.length === 0) {
      return;
    }

    setClientErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      fields.forEach((field) => {
        const error = validateField(field, nextValues);

        if (error) {
          nextErrors[field] = error;
        } else {
          delete nextErrors[field];
        }
      });

      return nextErrors;
    });
  }

  function handleFieldChange(field: TField, value: string) {
    const nextValues = {
      ...values,
      [field]: value,
    };
    const context = { hasSubmitted };
    const fieldsToValidate = getFieldsToValidateOnChange
      ? getFieldsToValidateOnChange(field, nextValues, context)
      : [field];

    setValues(nextValues);
    validateFields(nextValues, fieldsToValidate);
  }

  function handleFieldBlur(field: TField) {
    const context = { hasSubmitted };

    if (
      shouldValidateOnBlur &&
      !shouldValidateOnBlur(field, values, context)
    ) {
      return;
    }

    validateFields(values, [field]);
  }

  return {
    values,
    setValues,
    clientErrors,
    setClientErrors,
    hasSubmitted,
    setHasSubmitted,
    validateFields,
    handleFieldChange,
    handleFieldBlur,
  };
}
