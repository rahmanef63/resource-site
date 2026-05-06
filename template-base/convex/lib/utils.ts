// Small shared utilities to keep modules DRY/KISS

export function normalizeSlug(s: string): string {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\s]/g, "") // Remove special chars except hyphens and spaces
    .replace(/\s+/g, "-") // Convert spaces to hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens to one
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}
