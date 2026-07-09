export type PrimitiveSize = "sm" | "md" | "lg";
export type PrimitiveTone = "neutral" | "primary" | "success" | "warning" | "danger";

export { CheckboxCard, type CheckboxCardProps } from "./CheckboxCard";
export { CheckboxGrid, type CheckboxGridProps } from "./CheckboxGrid";
export {
  ExperienceSelectionField,
  type ExperienceSelectionFieldProps,
} from "./ExperienceSelectionField";
export { FormSection, type FormSectionProps } from "./FormSection";
export { Modal, type ModalProps } from "./Modal";
export { InfoCallout, type InfoCalloutProps } from "./InfoCallout";
export { RadioGroup, type RadioGroupOption, type RadioGroupProps } from "./RadioGroup";
export { ReviewSection, type ReviewSectionProps, type ReviewSectionRow } from "./ReviewSection";
export { SelectField, type FieldOption, type SelectFieldProps } from "./SelectField";
export { SelectChip, type SelectChipProps } from "./SelectChip";
export { SelectChipGroup, type SelectChipGroupProps } from "./SelectChipGroup";
export { TextField, type TextFieldProps } from "./TextField";
export {
  FORM_ERROR_TOAST_MESSAGE,
  ToastProvider,
  notifyFormErrors,
} from "./ToastProvider";

export function composeClassName(
  ...values: Array<string | false | null | undefined>
): string {
  return values.filter(Boolean).join(" ");
}
