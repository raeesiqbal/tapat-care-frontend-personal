import { CheckboxCard } from "./CheckboxCard";
import { CheckboxGrid } from "./CheckboxGrid";
import { SelectField, type FieldOption } from "./SelectField";

type ExperienceSelectionItem = {
  id: number;
  name: string;
};

export type ExperienceSelectionFieldProps = {
  label: string;
  items: ExperienceSelectionItem[];
  values: Array<Record<string, string | number | undefined>>;
  selectOptions: FieldOption[];
  error?: string;
  selectedIdKey?: string;
  selectedValueKey?: string;
  selectLabelSuffix?: string;
  selectPlaceholder?: string;
  getSelectError?: (
    value: Record<string, string | number | undefined>,
  ) => string | undefined;
  onToggle: (itemId: number) => void;
  onValueChange: (itemId: number, selectedValue: string) => void;
};

export function ExperienceSelectionField({
  label,
  items,
  values,
  selectOptions,
  error,
  selectedIdKey = "item_id",
  selectedValueKey = "skill_level",
  selectLabelSuffix = "skill level",
  selectPlaceholder = "Select level",
  getSelectError,
  onToggle,
  onValueChange,
}: ExperienceSelectionFieldProps) {
  return (
    <div>
      <CheckboxGrid label={label} error={error} required={false}>
        {items.map((item) => (
          <CheckboxCard
            key={item.id}
            label={item.name}
            checked={values.some(
              (value) => Number(value[selectedIdKey]) === item.id,
            )}
            onChange={() => onToggle(item.id)}
          />
        ))}
      </CheckboxGrid>

      {values.length > 0 ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {values.map((value) => {
            const itemId = Number(value[selectedIdKey]);
            const item = items.find((option) => option.id === itemId);

            if (!item) {
              return null;
            }

            return (
              <SelectField
                key={itemId}
                label={`${item.name} ${selectLabelSuffix}`}
                name={`${label}.${itemId}.${selectedValueKey}`}
                required
                value={String(value[selectedValueKey] ?? "")}
                error={getSelectError?.(value)}
                placeholder={selectPlaceholder}
                options={selectOptions}
                onChange={(event) =>
                  onValueChange(itemId, event.target.value)
                }
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
