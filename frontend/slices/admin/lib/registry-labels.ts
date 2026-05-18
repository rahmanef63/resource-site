/**
 * Admin slice — UI strings (i18n hook). All entries optional; missing
 * keys fall back to {@link DEFAULT_ADMIN_LABELS}.
 */

export type SliceAdminLabels = {
  /** Page heading (e.g. `"Admin"`). */
  title?: string;
  /** Sub-heading below the page title. */
  subtitle?: string;
  /** Card title when no slice surfaces panels. */
  emptyHeading?: string;
  /** Empty-state body text. */
  emptyBody?: string;
};

/**
 * Default UI strings. Generic — NO consumer-domain literals. Consumers
 * override via the `labels` prop to localise / rebrand.
 */
export const DEFAULT_ADMIN_LABELS: Required<SliceAdminLabels> = {
  title: "Admin",
  subtitle:
    "Workspace management surface. Wire panels via slice composition.",
  emptyHeading: "No panels mounted",
  emptyBody:
    "Consumer projects compose panels here. See `convex/features/admin/query.ts` for the admin probe + counts API.",
};

/**
 * Resolve labels — caller supplied keys win, missing keys default.
 */
export function resolveAdminLabels(
  labels?: SliceAdminLabels,
): Required<SliceAdminLabels> {
  return {
    title: labels?.title ?? DEFAULT_ADMIN_LABELS.title,
    subtitle: labels?.subtitle ?? DEFAULT_ADMIN_LABELS.subtitle,
    emptyHeading: labels?.emptyHeading ?? DEFAULT_ADMIN_LABELS.emptyHeading,
    emptyBody: labels?.emptyBody ?? DEFAULT_ADMIN_LABELS.emptyBody,
  };
}
