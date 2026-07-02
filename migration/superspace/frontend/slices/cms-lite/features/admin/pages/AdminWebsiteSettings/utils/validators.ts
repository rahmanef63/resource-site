/**
 * Form Validation Utilities
 */

export function validateSubdomain(value: string): string | null {
  if (!value) return "Subdomain is required";
  if (value.length < 3) return "Subdomain must be at least 3 characters";
  if (value.length > 63) return "Subdomain must be less than 63 characters";
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
    return "Subdomain can only contain lowercase letters, numbers, and hyphens (cannot start/end with hyphen)";
  }
  return null;
}

export function validateUrl(url: string, fieldName: string): string | null {
  if (!url) return null; // Optional field
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return null;
  } catch {
    return `${fieldName} must be a valid URL`;
  }
}

export function validateGoogleAnalyticsId(id: string): string | null {
  if (!id) return null;
  if (!/^(G|UA|GT)-[A-Z0-9]+$/.test(id)) {
    return "Google Analytics ID format: G-XXXXXXXXXX or UA-XXXXXXXXX";
  }
  return null;
}

export function validateFacebookPixelId(id: string): string | null {
  if (!id) return null;
  if (!/^\d{15,16}$/.test(id)) {
    return "Facebook Pixel ID must be 15-16 digits";
  }
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateMaxLength(value: string, max: number, fieldName: string): string | null {
  if (value && value.length > max) {
    return `${fieldName} must be ${max} characters or less`;
  }
  return null;
}
