import { DEFAULT_MARKER_CLASSES, STATUS_COLOR_FALLBACKS } from "../constants";
import type {
  DatabaseFeature,
  DatabaseField,
  DatabaseMarker,
  DatabaseRecord,
  DatabaseStatus,
  DatabaseViewModel,
  FieldMapping,
} from "../types";
import { inferFieldMapping } from "./mapping";

const toDate = (value: unknown): Date | null => {
  if (value == null) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const toStringValue = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? toStringValue(value[0]) : null;
  }
  if (typeof value === "object" && "name" in (value as Record<string, unknown>)) {
    const candidate = (value as Record<string, unknown>).name;
    return typeof candidate === "string" ? candidate.trim() || null : null;
  }
  return null;
};

const getFieldById = (
  fields: DatabaseField[],
  fieldId?: string,
): DatabaseField | undefined => {
  if (!fieldId) return undefined;
  return fields.find((field) => String(field._id) === String(fieldId));
};

const resolveSelectValue = (
  field: DatabaseField | undefined,
  raw: unknown,
): DatabaseStatus | string | null => {
  if (!field) {
    return toStringValue(raw);
  }

  const options = field.options?.selectOptions ?? [];

  const maybeResolve = (value: string | null): DatabaseStatus | string | null => {
    if (!value) return null;
    const match =
      options.find((option) => option.id === value || option.name === value) ??
      options.find((option) => option.name.toLowerCase() === value.toLowerCase());

    if (match) {
      return {
        id: match.id,
        name: match.name,
        color: match.color,
      };
    }

    return value;
  };

  if (Array.isArray(raw)) {
    const [first] = raw as unknown[];
    return maybeResolve(toStringValue(first));
  }

  return maybeResolve(toStringValue(raw));
};

const resolveStatusValue = (
  field: DatabaseField | undefined,
  raw: unknown,
): DatabaseStatus | null => {
  const result = resolveSelectValue(field, raw);
  if (!result) return null;

  if (typeof result === "string") {
    return {
      id: result,
      name: result,
    };
  }

  return result;
};

const resolveOwner = (raw: unknown) => {
  if (!raw) return null;

  if (typeof raw === "object" && raw !== null) {
    const record = raw as Record<string, unknown>;
    const id =
      typeof record.id === "string"
        ? record.id
        : typeof record._id === "string"
        ? record._id
        : typeof record.userId === "string"
        ? record.userId
        : undefined;
    const label =
      typeof record.name === "string"
        ? record.name
        : typeof record.label === "string"
        ? record.label
        : typeof record.email === "string"
        ? record.email
        : undefined;

    if (id || label) {
      return {
        id: id ?? label ?? "person",
        label: label ?? id ?? "Person",
        avatarUrl: typeof record.image === "string" ? record.image : null,
      };
    }
  }

  const value = toStringValue(raw);
  if (!value) return null;

  return {
    id: value,
    label: value,
  };
};

const assignStatusColors = (statuses: DatabaseStatus[]) => {
  return statuses.map((status, index) => ({
    ...status,
    color:
      status.color ??
      STATUS_COLOR_FALLBACKS[index % STATUS_COLOR_FALLBACKS.length],
  }));
};

const buildMarkers = (
  features: DatabaseFeature[],
): DatabaseMarker[] => {
  const markers = new Map<string, DatabaseMarker>();
  const sortedFeatures = features
    .filter((feature) => feature.release && feature.endAt)
    .sort((a, b) => {
      const aTime = a.endAt?.getTime() ?? 0;
      const bTime = b.endAt?.getTime() ?? 0;
      return aTime - bTime;
    });

  sortedFeatures.forEach((feature, index) => {
    if (!feature.release || !feature.endAt) return;
    if (markers.has(feature.release)) return;

    markers.set(feature.release, {
      id: feature.release,
      label: feature.release,
      date: feature.endAt,
      className: DEFAULT_MARKER_CLASSES[index % DEFAULT_MARKER_CLASSES.length],
    });
  });

  return Array.from(markers.values());
};

const buildGroups = (features: DatabaseFeature[], mapping: FieldMapping) => {
  if (!mapping.groupField) return [];
  const values = new Set<string>();
  features.forEach((feature) => {
    if (feature.group) {
      values.add(feature.group);
    }
  });
  return Array.from(values).sort();
};

export function buildDatabaseViewModel(record: DatabaseRecord): DatabaseViewModel {
  const mapping = inferFieldMapping(record.fields);
  const fieldById = new Map(
    record.fields.map((field) => [String(field._id), field]),
  );

  const features: DatabaseFeature[] = record.rows.map((row) => {
    const data = row.data ?? {};

    const resolveFieldValue = (fieldId?: string) => {
      if (!fieldId) return null;
      return data[fieldId] ?? data[String(fieldId)];
    };

    const name =
      toStringValue(resolveFieldValue(mapping.titleField)) ??
      `Untitled ${record.table.name}`;

    const statusField = getFieldById(record.fields, mapping.statusField);
    const rawStatus = resolveFieldValue(mapping.statusField);
    const status = resolveStatusValue(statusField, rawStatus);

    const owner = resolveOwner(resolveFieldValue(mapping.ownerField));
    const groupValue = resolveSelectValue(
      getFieldById(record.fields, mapping.groupField),
      resolveFieldValue(mapping.groupField),
    );
    const productValue = resolveSelectValue(
      getFieldById(record.fields, mapping.productField),
      resolveFieldValue(mapping.productField),
    );
    const initiativeValue = resolveSelectValue(
      getFieldById(record.fields, mapping.initiativeField),
      resolveFieldValue(mapping.initiativeField),
    );
    const releaseValue = resolveSelectValue(
      getFieldById(record.fields, mapping.releaseField),
      resolveFieldValue(mapping.releaseField),
    );

    const startAt = toDate(resolveFieldValue(mapping.startDateField));
    const endAt = toDate(resolveFieldValue(mapping.endDateField));

    return {
      id: row._id,
      docId: row.docId ?? null,
      name,
      status,
      owner,
      group: typeof groupValue === "string" ? groupValue : groupValue?.name ?? null,
      product:
        typeof productValue === "string" ? productValue : productValue?.name ?? null,
      initiative:
        typeof initiativeValue === "string"
          ? initiativeValue
          : initiativeValue?.name ?? null,
      release:
        typeof releaseValue === "string"
          ? releaseValue
          : releaseValue?.name ?? null,
      startAt,
      endAt,
      metadata: data,
    };
  });

  const statusesMap = new Map<string, DatabaseStatus>();
  features.forEach((feature) => {
    if (feature.status) {
      const id = feature.status.id ?? feature.status.name;
      if (!statusesMap.has(id)) {
        statusesMap.set(id, {
          id,
          name: feature.status.name ?? feature.status.id ?? id,
          color: feature.status.color,
        });
      }
    }
  });

  const statusesWithColor = assignStatusColors(Array.from(statusesMap.values()));

  // Update features with consistent status colors
  const statusLookup = new Map(
    statusesWithColor.map((status) => [
      status.id,
      status,
    ]),
  );

  const enrichedFeatures = features.map((feature) => {
    if (!feature.status) return feature;
    const id = feature.status.id ?? feature.status.name;
    const status = statusLookup.get(id);
    return {
      ...feature,
      status: status ?? feature.status,
    };
  });

  const markers = buildMarkers(enrichedFeatures);
  const groups = buildGroups(enrichedFeatures, mapping);

  return {
    features: enrichedFeatures,
    statuses: statusesWithColor,
    markers,
    groups,
  };
}
