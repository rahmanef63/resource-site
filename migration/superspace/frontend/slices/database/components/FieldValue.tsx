"use client";

import { Fragment, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Link as LinkIcon,
  Paperclip,
  GitBranch,
  Layers,
} from "lucide-react";
import type {
  DatabaseField,
  DatabaseFieldType,
  DatabaseSelectOption,
} from "../types";
import { formatDate } from "../lib/format";
import { propertyRegistry } from "../registry";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";

const toStringValue = (value: unknown): string | null => {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.length ? toStringValue(value[0]) : null;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "name" in (value as Record<string, unknown>)
  ) {
    const name = (value as Record<string, unknown>).name;
    return typeof name === "string" ? name.trim() || null : null;
  }
  return null;
};

const toArray = (value: unknown): unknown[] => {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

const resolveSelectOptions = (
  field: DatabaseField,
  raw: unknown,
): DatabaseSelectOption[] => {
  const values = toArray(raw)
    .map((entry) => {
      if (entry == null) return null;
      if (typeof entry === "string") return entry;
      if (typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        if (typeof record.name === "string") {
          return record.name;
        }
      }
      return toStringValue(entry);
    })
    .filter((value): value is string => Boolean(value));

  const options = field.options?.selectOptions ?? [];
  return values.map((value) => {
    const match =
      options.find(
        (option) =>
          option.id === value ||
          option.name === value ||
          option.name?.toLowerCase() === value.toLowerCase(),
      ) ?? {
        id: value,
        name: value,
        color: undefined,
      };

    return match;
  });
};

const renderColorBadge = (
  option: DatabaseSelectOption,
  key: string | number,
) => (
  <Badge
    key={key}
    className={cn(
      "capitalize",
      !option.color && "bg-muted text-muted-foreground",
    )}
    style={
      option.color
        ? {
            backgroundColor: option.color,
            color: "var(--foreground)",
          }
        : undefined
    }
  >
    {option.name}
  </Badge>
);

const normalizePerson = (value: unknown) => {
  const entries = toArray(value).flatMap((item) => {
    if (!item) return [];
    if (typeof item === "string") {
      return [
        {
          id: item,
          label: item,
          avatarUrl: null,
        },
      ];
    }
    if (typeof item === "object") {
      const record = item as Record<string, unknown>;
      const id =
        (typeof record.id === "string" && record.id) ||
        (typeof record._id === "string" && record._id) ||
        (typeof record.userId === "string" && record.userId) ||
        null;
      const label =
        (typeof record.name === "string" && record.name) ||
        (typeof record.label === "string" && record.label) ||
        (typeof record.email === "string" && record.email) ||
        id ||
        "Person";
      return [
        {
          id: id ?? label,
          label,
          avatarUrl:
            typeof record.image === "string"
              ? record.image
              : typeof record.avatarUrl === "string"
                ? record.avatarUrl
                : null,
        },
      ];
    }
    return [];
  });

  const deduped = new Map<string, (typeof entries)[number]>();
  entries.forEach((entry) => {
    deduped.set(entry.id, entry);
  });
  return Array.from(deduped.values());
};

const renderUrl = (value: string) => {
  try {
    const url = new URL(value);
    const label = url.hostname.replace(/^www\./, "");
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        <LinkIcon className="h-3.5 w-3.5" />
        {label}
      </a>
    );
  } catch {
    return <span className="text-sm text-muted-foreground">{value}</span>;
  }
};

const renderEmail = (value: string) => (
  <a
    href={`mailto:${value}`}
    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
  >
    {value}
  </a>
);

const renderPhone = (value: string) => (
  <a
    href={`tel:${value}`}
    className="text-sm font-medium text-primary underline-offset-2 hover:underline"
  >
    {value}
  </a>
);

const renderFiles = (value: unknown) => {
  const files = toArray(value);
  if (!files.length) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-foreground">
      <Paperclip className="h-3.5 w-3.5" />
      {files.length === 1 ? "1 file" : `${files.length} files`}
    </div>
  );
};

const renderRelation = (value: unknown) => {
  const related = toArray(value);
  if (!related.length) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-1 text-sm text-foreground">
      <GitBranch className="h-3.5 w-3.5" />
      {related.length === 1 ? "1 linked record" : `${related.length} linked records`}
    </div>
  );
};

const renderPerson = (value: unknown) => {
  const people = normalizePerson(value);
  if (!people.length) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {people.map((person) => (
        <div key={person.id} className="flex items-center gap-2">
          <Avatar className="size-6">
            {person.avatarUrl ? (
              <AvatarImage src={person.avatarUrl} alt={person.label} />
            ) : null}
            <AvatarFallback>
              {person.label.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">
            {person.label}
          </span>
        </div>
      ))}
    </div>
  );
};

const renderCheckbox = (value: unknown) => {
  const checked =
    typeof value === "boolean"
      ? value
      : typeof value === "string"
        ? ["true", "1", "yes"].includes(value.toLowerCase())
        : Boolean(value);

  return (
    <Checkbox
      checked={checked}
      disabled
      className="pointer-events-none data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
    />
  );
};

const renderText = (value: unknown) => {
  const text = toStringValue(value);
  if (!text) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }
  return <span className="text-sm text-foreground">{text}</span>;
};

const renderNumber = (value: unknown, field: DatabaseField) => {
  if (typeof value === "number") {
    return (
      <span className="text-sm tabular-nums text-foreground">
        {value.toLocaleString(undefined, {
          style:
            field.options?.numberFormat === "currency"
              ? "currency"
              : "decimal",
          currency:
            field.options?.numberFormat === "currency"
              ? "USD"
              : undefined,
          maximumFractionDigits: 2,
        })}
      </span>
    );
  }

  const text = toStringValue(value);
  if (!text) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return <span className="text-sm text-foreground">{text}</span>;
};

const renderDate = (value: unknown) => {
  if (value == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (Array.isArray(value) && value.length === 2) {
    const [start, end] = value;
    const startDate =
      typeof start === "number" || start instanceof Date
        ? formatDate(start instanceof Date ? start : new Date(start))
        : toStringValue(start);
    const endDate =
      typeof end === "number" || end instanceof Date
        ? formatDate(end instanceof Date ? end : new Date(end))
        : toStringValue(end);

    return (
      <span className="text-sm text-foreground">
        {[startDate, endDate].filter(Boolean).join(" → ") || "—"}
      </span>
    );
  }

  if (value instanceof Date) {
    return <span className="text-sm text-foreground">{formatDate(value)}</span>;
  }

  if (typeof value === "number") {
    return (
      <span className="text-sm text-foreground">
        {formatDate(new Date(value))}
      </span>
    );
  }

  const text = toStringValue(value);
  if (!text) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return (
      <span className="text-sm text-foreground">
        {formatDate(parsed)}
      </span>
    );
  }

  return <span className="text-sm text-foreground">{text}</span>;
};

const renderFormula = (value: unknown) => {
  if (typeof value === "number") {
    return (
      <span className="text-sm tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    );
  }
  return renderText(value);
};

const renderRollup = (value: unknown) => {
  if (Array.isArray(value)) {
    const count = value.length;
    return (
      <Badge variant="outline">
        <Layers className="mr-1 h-3 w-3" />
        {count} item{count === 1 ? "" : "s"}
      </Badge>
    );
  }
  return renderText(value);
};

const renderSelect = (field: DatabaseField, value: unknown) => {
  const options = resolveSelectOptions(field, value);
  if (!options.length) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {options.map((option, index) =>
        renderColorBadge(option, `${option.id}-${index}`),
      )}
    </div>
  );
};

const renderGeneric = (value: unknown) => {
  if (value == null) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  if (typeof value === "object") {
    try {
      const json = JSON.stringify(value);
      return (
        <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
          {json}
        </code>
      );
    } catch {
      return <span className="text-sm text-muted-foreground">—</span>;
    }
  }

  return <span className="text-sm text-foreground">{String(value)}</span>;
};

const RENDERERS: Record<
  DatabaseFieldType,
  (field: DatabaseField, value: unknown) => ReactNode
> = {
  text: (field, value) => renderText(value),
  number: (field, value) => renderNumber(value, field),
  select: (field, value) => renderSelect(field, value),
  multiSelect: (field, value) => renderSelect(field, value),
  date: (field, value) => renderDate(value),
  person: (field, value) => renderPerson(value),
  files: (field, value) => renderFiles(value),
  checkbox: (field, value) => renderCheckbox(value),
  url: (field, value) => {
    const text = toStringValue(value);
    return text ? renderUrl(text) : renderText(value);
  },
  email: (field, value) => {
    const text = toStringValue(value);
    return text ? renderEmail(text) : renderText(value);
  },
  phone: (field, value) => {
    const text = toStringValue(value);
    return text ? renderPhone(text) : renderText(value);
  },
  formula: (field, value) => renderFormula(value),
  relation: (field, value) => renderRelation(value),
  rollup: (field, value) => renderRollup(value),
};

export interface FieldValueProps {
  field: DatabaseField | Property;
  value: unknown;
}

/**
 * Detect if field is V2 Universal Database Property
 */
const isV2Property = (field: DatabaseField | Property): field is Property => {
  // V2 properties have 'type' as PropertyType (21 types) instead of DatabaseFieldType (14 types)
  // V2 also has additional fields like 'key', 'required', etc.
  return 'key' in field && 'required' in field;
};

/**
 * Render using V2 Property Registry
 */
const renderV2Property = (property: Property, value: unknown): ReactNode => {
  const config = propertyRegistry.get(property.type);
  
  if (!config) {
    // Fallback if property type not registered
    return renderGeneric(value);
  }

  const { Renderer } = config;
  
  return (
    <Renderer
      value={value}
      property={property}
      readOnly={true}
    />
  );
};

export function FieldValue({ field, value }: FieldValueProps) {
  // V2 Universal Database: Use Property Registry
  if (isV2Property(field)) {
    return <Fragment>{renderV2Property(field, value)}</Fragment>;
  }

  // V1 Legacy Database: Use old RENDERERS
  const renderer = RENDERERS[field.type as DatabaseFieldType];
  if (!renderer) {
    return renderGeneric(value);
  }
  return <Fragment>{renderer(field, value)}</Fragment>;
}
