import type { DatabaseField, FieldMapping } from "../types";
import {
  DATE_FIELD_TYPES,
  FIELD_KEYWORDS,
  PERSON_FIELD_TYPES,
  SELECT_FIELD_TYPES,
} from "../config/mappings";

const normalize = (value: string | undefined | null) =>
  value?.toLowerCase().replaceAll(/[_\-]/g, " ").trim() ?? "";

const keywordMatches = (fieldName: string, keywords: readonly string[]) => {
  if (!fieldName) return false;

  return keywords.some((keyword) => {
    if (!keyword) return false;
    if (fieldName === keyword) return true;
    if (fieldName.startsWith(`${keyword} `)) return true;
    if (fieldName.endsWith(` ${keyword}`)) return true;
    return fieldName.includes(` ${keyword} `);
  });
};

export function inferFieldMapping(fields: DatabaseField[]): FieldMapping {
  const mapping: FieldMapping = {};

  const candidates = fields.map((field) => ({
    field,
    name: normalize(field.name),
  }));

  // Determine title field: prefer explicit primary flag, otherwise first text field.
  const primaryField = candidates.find(
    ({ field }) => field.isPrimary || field.type === "text",
  );
  if (primaryField) {
    mapping.titleField = String(primaryField.field._id);
  }

  const assignIfUnset = (
    key: keyof FieldMapping,
    predicate: (candidate: (typeof candidates)[number]) => boolean,
  ) => {
    if (mapping[key]) {
      return;
    }

    const candidate = candidates.find(predicate);
    if (candidate) {
      mapping[key] = String(candidate.field._id);
    }
  };

  assignIfUnset("statusField", ({ field, name }) => {
    if (!SELECT_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.status);
  });

  assignIfUnset("ownerField", ({ field, name }) => {
    if (PERSON_FIELD_TYPES.has(field.type as any)) return true;
    if (SELECT_FIELD_TYPES.has(field.type as any)) {
      return keywordMatches(name, FIELD_KEYWORDS.owner);
    }
    return false;
  });

  assignIfUnset("groupField", ({ field, name }) => {
    if (!SELECT_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.group);
  });

  assignIfUnset("productField", ({ field, name }) => {
    if (!SELECT_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.product);
  });

  assignIfUnset("initiativeField", ({ field, name }) => {
    if (!SELECT_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.initiative);
  });

  assignIfUnset("releaseField", ({ field, name }) => {
    if (!SELECT_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.release);
  });

  assignIfUnset("startDateField", ({ field, name }) => {
    if (!DATE_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.start);
  });

  assignIfUnset("endDateField", ({ field, name }) => {
    if (!DATE_FIELD_TYPES.has(field.type as any)) return false;
    return keywordMatches(name, FIELD_KEYWORDS.end);
  });

  return mapping;
}
