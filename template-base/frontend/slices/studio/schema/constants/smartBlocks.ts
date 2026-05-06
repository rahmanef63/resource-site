/**
 * smartBlocks — canonical list of Smart Block widget types.
 *
 * Smart Blocks are data-connected widgets that render live from Convex.
 * They have these restrictions:
 *   - childPolicy: "none" (no child nodes allowed)
 *   - Cannot be nested inside another Smart Block
 *   - Show empty state without real workspace data
 */
export const SMART_BLOCK_TYPES = new Set([
  "chartBlock",
  "kanbanBlock",
  "tableBlock",
  "calendarBlock",
  "filterBlock",
  "formBlock",
  "listBlock",
  "statsBlock",
  "activityBlock",
  "eventsBlock",
  "profileBlock",
  "metricCardBlock",
  "agentBlock",
  "teamBlock",
  "timeRangeBlock",
  "fileBlock",
  "commentBlock",
  "richTextBlock",
  "mediaBlock",
] as const);

export type SmartBlockType = typeof SMART_BLOCK_TYPES extends Set<infer T> ? T : never;

export function isSmartBlock(type: string): boolean {
  return SMART_BLOCK_TYPES.has(type as SmartBlockType);
}

/**
 * Template/composite blocks — self-contained UI sections.
 * May have children (heroComposite) but are not data-connected.
 */
export const TEMPLATE_BLOCK_TYPES = new Set([
  "hero",
  "heroComposite",
  "navbarBlock",
  "pricingCardBlock",
  "testimonialBlock",
  "footerBlock",
] as const);

export function isTemplateBlock(type: string): boolean {
  return TEMPLATE_BLOCK_TYPES.has(type as never);
}

/** Any block type (smart or template). */
export function isBlock(type: string): boolean {
  return isSmartBlock(type) || isTemplateBlock(type);
}
