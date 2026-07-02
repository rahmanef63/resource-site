import type { LucideIcon } from "lucide-react";
import {
  AtSign,
  Calendar,
  CheckSquare,
  FunctionSquare,
  GitBranch,
  Hash,
  Layers,
  Link,
  ListChecks,
  ListFilter,
  Paperclip,
  Phone,
  Type,
  UserRound,
} from "lucide-react";
import type { DatabaseFieldType } from "../types";

export interface DatabaseFieldDefinition {
  type: DatabaseFieldType;
  label: string;
  description: string;
  icon: LucideIcon;
  supportsOptions?: boolean;
  isMultiValue?: boolean;
}

export const DATABASE_FIELD_DEFINITIONS: Record<
  DatabaseFieldType,
  DatabaseFieldDefinition
> = {
  text: {
    type: "text",
    label: "Text (Legacy)",
    description: "⚠️ Deprecated: Use Rich Text instead. Kept for backward compatibility.",
    icon: Type,
  },
  number: {
    type: "number",
    label: "Number",
    description: "Numeric values with optional formatting.",
    icon: Hash,
  },
  select: {
    type: "select",
    label: "Select",
    description: "Single-choice options for status or categories.",
    icon: ListFilter,
    supportsOptions: true,
  },
  multiSelect: {
    type: "multiSelect",
    label: "Multi-select",
    description: "Tag items with multiple options.",
    icon: ListChecks,
    supportsOptions: true,
    isMultiValue: true,
  },
  date: {
    type: "date",
    label: "Date",
    description: "Track important timelines with dates.",
    icon: Calendar,
  },
  person: {
    type: "person",
    label: "Person",
    description: "Assign owners or collaborators.",
    icon: UserRound,
    isMultiValue: true,
  },
  files: {
    type: "files",
    label: "Files",
    description: "Attach documents, images, or other files.",
    icon: Paperclip,
    isMultiValue: true,
  },
  checkbox: {
    type: "checkbox",
    label: "Checkbox",
    description: "Track completion with a simple checkbox.",
    icon: CheckSquare,
  },
  url: {
    type: "url",
    label: "URL",
    description: "Store links to external resources.",
    icon: Link,
  },
  email: {
    type: "email",
    label: "Email",
    description: "Contact details for stakeholders.",
    icon: AtSign,
  },
  phone: {
    type: "phone",
    label: "Phone",
    description: "Telephone numbers or extensions.",
    icon: Phone,
  },
  formula: {
    type: "formula",
    label: "Formula",
    description: "Calculated values based on other fields.",
    icon: FunctionSquare,
  },
  relation: {
    type: "relation",
    label: "Relation",
    description: "Link to records in other tables.",
    icon: GitBranch,
    isMultiValue: true,
  },
  rollup: {
    type: "rollup",
    label: "Rollup",
    description: "Aggregate values from related records.",
    icon: Layers,
  },
};

export const MULTI_VALUE_FIELD_TYPES = new Set<DatabaseFieldType>([
  "multiSelect",
  "person",
  "files",
  "relation",
]);

export const OPTION_BASED_FIELD_TYPES = new Set<DatabaseFieldType>([
  "select",
  "multiSelect",
]);
