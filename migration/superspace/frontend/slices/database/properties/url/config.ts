/**
 * URL Property - Configuration
 */

import { Link2 } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { UrlRenderer } from "./UrlRenderer";
import { UrlEditor } from "./UrlEditor";

export const urlPropertyConfig: PropertyConfig = {
  type: "url",
  label: "URL",
  description: "Web link with validation",
  icon: Link2,

  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: false,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  Renderer: UrlRenderer,
  Editor: UrlEditor,

  validate: (value) => {
    if (!value) return null;

    if (typeof value !== "string") {
      return "URL must be text";
    }

    try {
      new URL(value);
      return null;
    } catch {
      return "Invalid URL format";
    }
  },

  format: (value) => {
    return typeof value === "string" ? value.trim() : "";
  },

  category: "core",
  version: "2.0",
  tags: ["link", "web"],
};

export default urlPropertyConfig;
