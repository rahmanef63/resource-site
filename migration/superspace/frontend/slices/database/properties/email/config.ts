/**
 * Email Property - Configuration
 */

import { Mail } from "lucide-react";
import type { PropertyConfig } from "../../registry/types";
import { EmailRenderer } from "./EmailRenderer";
import { EmailEditor } from "./EmailEditor";

export const emailPropertyConfig: PropertyConfig = {
  type: "email",
  label: "Email",
  description: "Email address with validation",
  icon: Mail,

  supportsOptions: false,
  supportsRequired: false,
  supportsUnique: true,
  supportsDefault: true,
  isAuto: false,
  isEditable: true,

  Renderer: EmailRenderer,
  Editor: EmailEditor,

  validate: (value) => {
    if (!value) return null;

    if (typeof value !== "string") {
      return "Email must be text";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email format";
    }

    return null;
  },

  format: (value) => {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  },

  category: "core",
  version: "2.0",
  tags: ["contact", "email"],
};

export default emailPropertyConfig;
