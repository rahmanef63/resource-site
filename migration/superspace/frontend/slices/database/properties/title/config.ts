/**
 * Title Property - Configuration
 *
 * Property configuration for the title property type.
 * Primary text field for database records.
 *
 * @module frontend/slices/database/properties/title
 */

import { Text } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { TitleRenderer } from "./TitleRenderer";
import { TitleEditor } from "./TitleEditor";

/**
 * Title Property Configuration
 *
 * Defines metadata, components, and validation for title properties.
 */
export const titlePropertyConfig: PropertyConfig = {
  // Identification
  type: "title",
  label: "Title",
  description: "Primary text field for the record",
  icon: Text,

  // Capabilities
  supportsOptions: false,
  supportsRequired: true,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  // Components
  Renderer: TitleRenderer,
  Editor: TitleEditor,

  // Validation
  validate: (value) => {
    if (value === null || value === undefined) {
      return null; // Empty is valid
    }

    if (typeof value !== "string") {
      return "Title must be text";
    }

    if (value.length > 200) {
      return "Title must be 200 characters or less";
    }

    return null;
  },

  // Formatting
  format: (value) => {
    if (value === null || value === undefined) {
      return "";
    }
    return typeof value === "string" ? value.trim() : String(value);
  },

  // Metadata
  category: "core",
  version: "2.0",
  tags: ["text", "primary"],
};

export default titlePropertyConfig;
