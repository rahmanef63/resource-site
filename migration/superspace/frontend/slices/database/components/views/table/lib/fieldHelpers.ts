import type { DatabaseField, DatabaseFeature } from "../../../../types";

export const getFieldKey = (field: DatabaseField | string | number) =>
  typeof field === "string" || typeof field === "number"
    ? String(field)
    : String(field._id);

export const getRowValue = (
  feature: DatabaseFeature,
  field: DatabaseField | string | number,
): unknown => {
  const key = getFieldKey(field);
  return feature.metadata?.[key];
};

export const EDITABLE_FIELD_TYPES = new Set<DatabaseField["type"]>([
  "text",
  "number",
  "select",
  "multiSelect",
  "date",
  "person",
  "checkbox",
  "url",
  "email",
  "phone",
]);

export const isEditableField = (field: DatabaseField) =>
  EDITABLE_FIELD_TYPES.has(field.type);
