/**
 * Checkbox Property - Configuration
 *
 * @module frontend/slices/database/properties/checkbox
 */

import { CheckSquare } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { CheckboxRenderer } from "./CheckboxRenderer";
import { CheckboxEditor } from "./CheckboxEditor";

export const checkboxPropertyConfig: PropertyConfig = {
  type: "checkbox",
  label: "Checkbox",
  description: "Boolean value (true/false)",
  icon: CheckSquare,

  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  Renderer: CheckboxRenderer,
  Editor: CheckboxEditor,

  validate: (value) => {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value !== "boolean") {
      return "Checkbox value must be true or false";
    }
    return null;
  },

  format: (value) => {
    return value ? "Yes" : "No";
  },

  parse: (value) => {
    const lower = value.toLowerCase().trim();
    return lower === "true" || lower === "yes" || lower === "1";
  },

  category: "core",
  version: "2.0",
  tags: ["boolean", "toggle"],
};

export default checkboxPropertyConfig;
