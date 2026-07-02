export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string;
}

export const required = (message = "This field is required"): ValidationRule => ({
  validate: (value: any) => {
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined;
  },
  message,
});

export const minLength = (min: number, message?: string): ValidationRule => ({
  validate: (value: string) => !value || value.length >= min,
  message: message || `Minimum ${min} characters required`,
});

export const maxLength = (max: number, message?: string): ValidationRule => ({
  validate: (value: string) => !value || value.length <= max,
  message: message || `Maximum ${max} characters allowed`,
});

export const email = (message = "Invalid email address"): ValidationRule => ({
  validate: (value: string) => {
    if (!value) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  message,
});

export const url = (message = "Invalid URL"): ValidationRule => ({
  validate: (value: string) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  message,
});

export const slug = (message = "Invalid slug (use lowercase letters, numbers, and hyphens)"): ValidationRule => ({
  validate: (value: string) => {
    if (!value) return true;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
  },
  message,
});

export const min = (minValue: number, message?: string): ValidationRule => ({
  validate: (value: number) => value === null || value === undefined || value >= minValue,
  message: message || `Minimum value is ${minValue}`,
});

export const max = (maxValue: number, message?: string): ValidationRule => ({
  validate: (value: number) => value === null || value === undefined || value <= maxValue,
  message: message || `Maximum value is ${maxValue}`,
});

export const pattern = (regex: RegExp, message = "Invalid format"): ValidationRule => ({
  validate: (value: string) => {
    if (!value) return true;
    return regex.test(value);
  },
  message,
});

export function validateForm(data: any, rules: ValidationRules): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = data[field];

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  }

  return errors;
}

export function isFormValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
