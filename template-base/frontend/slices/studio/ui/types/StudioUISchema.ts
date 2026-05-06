/**
 * StudioUISchema v0.5 — Formal TypeScript + Zod Contract
 *
 * SOURCE OF TRUTH for the Studio UI JSON document format.
 * All other artefacts (docs, AI prompts, renderer, importer, validator) MUST
 * be derived from or consistent with this file.
 *
 * Normative sections are marked [N]. Informative sections are marked [I].
 *
 * @version 0.5
 * @replaces docs/studio-json-template.md (which was descriptive, not normative)
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// [N] §1  Versioning
// ─────────────────────────────────────────────────────────────────────────────

export const UI_SCHEMA_VERSIONS = ["0.4", "0.5"] as const;
export type UISchemaVersion = (typeof UI_SCHEMA_VERSIONS)[number];

/** Current generation target. All new documents MUST emit this version. */
export const CURRENT_UI_SCHEMA_VERSION: UISchemaVersion = "0.5";

/** Legacy version. Accepted by importer but never emitted by generator. */
export const LEGACY_UI_SCHEMA_VERSION: UISchemaVersion = "0.4";

// ─────────────────────────────────────────────────────────────────────────────
// [N] §2  Node ID Contract
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Node IDs must match this regex.
 *
 * Rules:
 *   - kebab-case: lowercase letters, digits, and hyphens
 *   - Must start with a letter
 *   - 2–64 characters
 *   - No consecutive hyphens
 *   - No trailing hyphen
 *
 * Valid examples:   hero-section, metric-card-1, nav-bar, cta-btn
 * Invalid examples: Hero, hero_section, 1-hero, hero--section, hero-
 */
export const NODE_ID_REGEX = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
export const NODE_ID_MAX_LENGTH = 64;

export const NodeIdSchema = z
  .string()
  .min(2)
  .max(NODE_ID_MAX_LENGTH)
  .regex(NODE_ID_REGEX, "Node ID must be kebab-case, start with a letter, max 64 chars");

// ─────────────────────────────────────────────────────────────────────────────
// [N] §3  Canonical Prop Vocabulary
//
// These are the only accepted names for layout/style props.
// Aliases (e.g. "justify", "align", "direction") are REJECTED by the parser.
// If an alias appears in an imported document, the importer resolves it before
// handing the document to the renderer — see §9 (Alias Resolution Table).
// ─────────────────────────────────────────────────────────────────────────────

/** CSS display values the renderer supports. */
export const DisplayEnum = z.enum(["block", "flex", "grid", "inline-flex", "inline-block", "inline", "none"]);
export type Display = z.infer<typeof DisplayEnum>;

/** CSS flex-direction values. */
export const FlexDirectionEnum = z.enum(["row", "column", "row-reverse", "column-reverse"]);
export type FlexDirection = z.infer<typeof FlexDirectionEnum>;

/** CSS justify-content values. */
export const JustifyContentEnum = z.enum(["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"]);
export type JustifyContent = z.infer<typeof JustifyContentEnum>;

/** CSS align-items values. */
export const AlignItemsEnum = z.enum(["flex-start", "center", "flex-end", "stretch", "baseline"]);
export type AlignItems = z.infer<typeof AlignItemsEnum>;

/** CSS flex-wrap values. */
export const FlexWrapEnum = z.enum(["nowrap", "wrap", "wrap-reverse"]);
export type FlexWrap = z.infer<typeof FlexWrapEnum>;

/**
 * CSS length value for gap, width, height, padding, margin, etc.
 * Must include a CSS unit.
 * Valid:   "0.5rem", "1rem", "16px", "0", "100%", "auto"
 * Invalid: "4", "md", "large"  ← bare numbers and t-shirt sizes are INVALID
 */
export const CSSLengthSchema = z.string().regex(
  /^(0|auto|[0-9]+(\.[0-9]+)?(px|rem|em|%|vw|vh|vmin|vmax|dvh|dvw|ch|lh|fr))$/,
  'CSS length must include a unit (e.g. "1rem", "16px", "100%") or be "0" or "auto"',
);

/** Grid column count (2, 3, 4, 5, or 6). */
export const GridColumnsEnum = z.enum(["1", "2", "3", "4", "5", "6"]);
export type GridColumns = z.infer<typeof GridColumnsEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// [N] §4  Shared Prop Mixins
// ─────────────────────────────────────────────────────────────────────────────

/** Mixin: applicable to every widget. */
const BasePropsSchema = z.object({
  className: z.string().optional(),
  style: z.record(z.string(), z.string()).optional(),
  id: z.string().optional(),
  "data-testid": z.string().optional(),
});

/** Mixin: layout props for flex/grid containers. */
const LayoutPropsSchema = z.object({
  display: DisplayEnum.optional(),
  flexDirection: FlexDirectionEnum.optional(),
  justifyContent: JustifyContentEnum.optional(),
  alignItems: AlignItemsEnum.optional(),
  flexWrap: FlexWrapEnum.optional(),
  gap: CSSLengthSchema.optional(),
  columnGap: CSSLengthSchema.optional(),
  rowGap: CSSLengthSchema.optional(),
  width: z.union([CSSLengthSchema, z.literal("full"), z.literal("screen")]).optional(),
  minWidth: CSSLengthSchema.optional(),
  maxWidth: CSSLengthSchema.optional(),
  height: z.union([CSSLengthSchema, z.literal("full"), z.literal("screen")]).optional(),
  minHeight: CSSLengthSchema.optional(),
  maxHeight: CSSLengthSchema.optional(),
  padding: CSSLengthSchema.optional(),
  paddingX: CSSLengthSchema.optional(),
  paddingY: CSSLengthSchema.optional(),
  margin: CSSLengthSchema.optional(),
  marginX: CSSLengthSchema.optional(),
  marginY: CSSLengthSchema.optional(),
  overflow: z.enum(["visible", "hidden", "scroll", "auto", "clip"]).optional(),
  position: z.enum(["static", "relative", "absolute", "fixed", "sticky"]).optional(),
  zIndex: z.number().int().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  border: z.string().optional(),
  boxShadow: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// [N] §5  Widget Prop Schemas (per-widget discriminated union)
//
// Each widget has a closed prop schema. Unknown props are rejected by the
// validator unless the `unknownProps` policy is "ignore" (see §8).
// ─────────────────────────────────────────────────────────────────────────────

// ── Elements: Layout ──────────────────────────────────────────────────────────

const DivPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  tag: z.enum(["div", "section", "article", "aside", "header", "footer", "main", "nav"]).optional().default("div"),
  path: z.string().optional(), // routing: makes this node a page root
});

const SectionPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  path: z.string().optional(),
  title: z.string().optional(),
});

const GridPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  columns: GridColumnsEnum.optional().default("3"),
  gap: CSSLengthSchema.optional().default("1.5rem"),
  autoRows: z.string().optional(),
  templateAreas: z.string().optional(),
});

const FlexPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  flexDirection: FlexDirectionEnum.optional().default("row"),
  gap: CSSLengthSchema.optional().default("1rem"),
  alignItems: AlignItemsEnum.optional().default("stretch"),
  justifyContent: JustifyContentEnum.optional().default("flex-start"),
  flexWrap: FlexWrapEnum.optional().default("nowrap"),
});

const TwoColumnPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  leftWidth: z.string().optional().default("50%"),
  gap: CSSLengthSchema.optional().default("1.5rem"),
  resizable: z.boolean().optional().default(false),
});

const ThreeColumnPropsSchema = BasePropsSchema.merge(LayoutPropsSchema).extend({
  leftWidth: z.string().optional().default("25%"),
  rightWidth: z.string().optional().default("25%"),
  gap: CSSLengthSchema.optional().default("1.5rem"),
  resizable: z.boolean().optional().default(false),
});

// ── Elements: Content ─────────────────────────────────────────────────────────

const TextPropsSchema = BasePropsSchema.extend({
  tag: z.enum(["p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "div", "label", "strong", "em"]).optional().default("p"),
  content: z.string().default(""),
  fontSize: z.enum(["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl"]).optional(),
  fontWeight: z.enum(["100", "200", "300", "400", "500", "600", "700", "800", "900"]).optional(),
  textAlign: z.enum(["left", "center", "right", "justify"]).optional(),
  color: z.string().optional(),
  truncate: z.boolean().optional(),
  lineClamp: z.number().int().min(1).max(10).optional(),
});

const CardPropsSchema = BasePropsSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  footer: z.string().optional(),
  variant: z.enum(["default", "outline", "ghost"]).optional().default("default"),
});

const ImagePropsSchema = BasePropsSchema.extend({
  src: z.string().optional().default(""),
  alt: z.string().optional().default(""),
  objectFit: z.enum(["contain", "cover", "fill", "none", "scale-down"]).optional().default("cover"),
  width: z.union([CSSLengthSchema, z.literal("full"), z.literal("auto")]).optional(),
  height: z.union([CSSLengthSchema, z.literal("full"), z.literal("auto")]).optional(),
  loading: z.enum(["eager", "lazy"]).optional().default("lazy"),
});

// ── Elements: Action ─────────────────────────────────────────────────────────

const ButtonVariantEnum = z.enum(["default", "secondary", "outline", "ghost", "link", "destructive"]);
const ButtonSizeEnum = z.enum(["sm", "default", "lg", "icon"]);

const ButtonPropsSchema = BasePropsSchema.extend({
  text: z.string().optional().default("Button"),
  variant: ButtonVariantEnum.optional().default("default"),
  size: ButtonSizeEnum.optional().default("default"),
  href: z.string().optional(),
  target: z.enum(["_self", "_blank"]).optional(),
  disabled: z.boolean().optional().default(false),
  loading: z.boolean().optional().default(false),
  icon: z.string().optional(),
  iconPosition: z.enum(["left", "right"]).optional().default("left"),
  type: z.enum(["button", "submit", "reset"]).optional().default("button"),
});

const IconButtonPropsSchema = BasePropsSchema.extend({
  icon: z.string().default("Star"),
  variant: ButtonVariantEnum.optional().default("outline"),
  size: ButtonSizeEnum.optional().default("default"),
  label: z.string().optional(),
  href: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

const LinkPropsSchema = BasePropsSchema.extend({
  href: z.string().default("#"),
  label: z.string().optional().default("Link"),
  target: z.enum(["_self", "_blank"]).optional().default("_self"),
  variant: z.enum(["default", "muted", "underline"]).optional().default("default"),
});

// ── Elements: Form ────────────────────────────────────────────────────────────

const InputPropsSchema = BasePropsSchema.extend({
  placeholder: z.string().optional(),
  label: z.string().optional(),
  type: z.enum(["text", "email", "password", "number", "tel", "url", "search", "date", "time"]).optional().default("text"),
  name: z.string().optional(),
  defaultValue: z.string().optional(),
  disabled: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
  description: z.string().optional(),
});

const TextareaPropsSchema = BasePropsSchema.extend({
  placeholder: z.string().optional(),
  label: z.string().optional(),
  rows: z.number().int().min(1).max(20).optional().default(3),
  name: z.string().optional(),
  disabled: z.boolean().optional().default(false),
  required: z.boolean().optional().default(false),
});

const SelectPropsSchema = BasePropsSchema.extend({
  placeholder: z.string().optional().default("Select an option"),
  label: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional().default([]),
  name: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

const CheckboxPropsSchema = BasePropsSchema.extend({
  label: z.string().optional().default(""),
  checked: z.boolean().optional().default(false),
  name: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

const RadioGroupPropsSchema = BasePropsSchema.extend({
  label: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional().default([]),
  defaultValue: z.string().optional(),
  name: z.string().optional(),
  disabled: z.boolean().optional().default(false),
  orientation: z.enum(["horizontal", "vertical"]).optional().default("vertical"),
});

const SwitchPropsSchema = BasePropsSchema.extend({
  label: z.string().optional().default(""),
  checked: z.boolean().optional().default(false),
  name: z.string().optional(),
  disabled: z.boolean().optional().default(false),
});

const SliderPropsSchema = BasePropsSchema.extend({
  label: z.string().optional(),
  min: z.number().optional().default(0),
  max: z.number().optional().default(100),
  step: z.number().optional().default(1),
  defaultValue: z.number().optional().default(50),
  disabled: z.boolean().optional().default(false),
});

const LabelPropsSchema = BasePropsSchema.extend({
  text: z.string().optional().default("Label"),
  htmlFor: z.string().optional(),
  required: z.boolean().optional().default(false),
});

const TogglePropsSchema = BasePropsSchema.extend({
  label: z.string().optional(),
  pressed: z.boolean().optional().default(false),
  variant: z.enum(["default", "outline"]).optional().default("default"),
  size: z.enum(["sm", "default", "lg"]).optional().default("default"),
});

// ── Elements: Utility ─────────────────────────────────────────────────────────

const SeparatorPropsSchema = BasePropsSchema.extend({
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
  decorative: z.boolean().optional().default(true),
});

const SpacerPropsSchema = BasePropsSchema.extend({
  size: CSSLengthSchema.optional().default("1rem"),
  axis: z.enum(["horizontal", "vertical", "both"]).optional().default("vertical"),
});

// ── Components: shadcn/ui ─────────────────────────────────────────────────────

const AccordionPropsSchema = BasePropsSchema.extend({
  type: z.enum(["single", "multiple"]).optional().default("single"),
  collapsible: z.boolean().optional().default(true),
  items: z.array(z.object({
    value: z.string(),
    trigger: z.string(),
    content: z.string(),
  })).optional().default([]),
});

const AlertPropsSchema = BasePropsSchema.extend({
  title: z.string().optional(),
  description: z.string().optional(),
  variant: z.enum(["default", "destructive", "success", "warning"]).optional().default("default"),
  icon: z.string().optional(),
});

const AlertDialogPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Open"),
  title: z.string().optional().default("Are you sure?"),
  description: z.string().optional(),
  confirmLabel: z.string().optional().default("Continue"),
  cancelLabel: z.string().optional().default("Cancel"),
  variant: z.enum(["default", "destructive"]).optional().default("default"),
});

const AvatarPropsSchema = BasePropsSchema.extend({
  src: z.string().optional(),
  alt: z.string().optional(),
  fallback: z.string().optional().default("?"),
  size: z.enum(["sm", "default", "lg", "xl"]).optional().default("default"),
});

const BadgePropsSchema = BasePropsSchema.extend({
  label: z.string().optional().default("Badge"),
  variant: z.enum(["default", "secondary", "outline", "destructive", "success", "warning"]).optional().default("default"),
});

const BreadcrumbPropsSchema = BasePropsSchema.extend({
  items: z.array(z.object({ label: z.string(), href: z.string().optional() })).optional().default([]),
  separator: z.enum(["slash", "chevron"]).optional().default("slash"),
});

const ButtonGroupPropsSchema = BasePropsSchema.extend({
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
});

const CarouselPropsSchema = BasePropsSchema.extend({
  items: z.array(z.object({ src: z.string(), alt: z.string().optional() })).optional().default([]),
  autoPlay: z.boolean().optional().default(false),
  interval: z.number().optional().default(3000),
  showDots: z.boolean().optional().default(true),
});

const CollapsiblePropsSchema = BasePropsSchema.extend({
  trigger: z.string().optional().default("Toggle"),
  open: z.boolean().optional().default(false),
});

const DialogPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Open"),
  title: z.string().optional().default("Dialog Title"),
  description: z.string().optional(),
});

const DrawerPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Open"),
  title: z.string().optional().default("Drawer"),
  description: z.string().optional(),
  side: z.enum(["top", "right", "bottom", "left"]).optional().default("right"),
});

const DropdownMenuPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Menu"),
  items: z.array(z.object({ label: z.string(), href: z.string().optional(), disabled: z.boolean().optional() })).optional().default([]),
});

const FormGroupPropsSchema = BasePropsSchema.extend({
  label: z.string().optional(),
  description: z.string().optional(),
  error: z.string().optional(),
  required: z.boolean().optional().default(false),
});

const HoverCardPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Hover me"),
  content: z.string().optional().default("Hover card content"),
});

const IconButtonGroupPropsSchema = BasePropsSchema.extend({
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
});

const InputGroupPropsSchema = BasePropsSchema.extend({
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

const PopoverPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Open Popover"),
  content: z.string().optional().default("Popover content"),
  side: z.enum(["top", "right", "bottom", "left"]).optional().default("bottom"),
});

const ProgressPropsSchema = BasePropsSchema.extend({
  value: z.number().min(0).max(100).optional().default(0),
  max: z.number().optional().default(100),
  label: z.string().optional(),
  showValue: z.boolean().optional().default(false),
});

const ResizablePropsSchema = BasePropsSchema.extend({
  direction: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
});

const ScrollAreaPropsSchema = BasePropsSchema.extend({
  maxHeight: z.string().optional(),
  scrollbars: z.enum(["both", "horizontal", "vertical", "none"]).optional().default("vertical"),
});

const SheetPropsSchema = BasePropsSchema.extend({
  triggerLabel: z.string().optional().default("Open Sheet"),
  title: z.string().optional().default("Sheet Title"),
  description: z.string().optional(),
  side: z.enum(["top", "right", "bottom", "left"]).optional().default("right"),
});

const SkeletonPropsSchema = BasePropsSchema.extend({
  variant: z.enum(["text", "circular", "rectangular", "card"]).optional().default("text"),
  width: z.string().optional(),
  height: z.string().optional(),
  lines: z.number().int().min(1).max(10).optional().default(1),
});

const SonnerPropsSchema = BasePropsSchema.extend({
  position: z.enum(["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"]).optional().default("bottom-right"),
  richColors: z.boolean().optional().default(false),
});

const TablePropsSchema = BasePropsSchema.extend({
  columns: z.array(z.object({ key: z.string(), label: z.string() })).optional().default([]),
  rows: z.array(z.record(z.string(), z.any())).optional().default([]),
  striped: z.boolean().optional().default(false),
  hoverable: z.boolean().optional().default(true),
});

const TabsPropsSchema = BasePropsSchema.extend({
  items: z.array(z.object({ value: z.string(), label: z.string(), content: z.string().optional() })).optional().default([]),
  defaultValue: z.string().optional(),
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
});

const ToggleGroupPropsSchema = BasePropsSchema.extend({
  type: z.enum(["single", "multiple"]).optional().default("single"),
  items: z.array(z.object({ value: z.string(), label: z.string().optional(), icon: z.string().optional() })).optional().default([]),
  defaultValue: z.union([z.string(), z.array(z.string())]).optional(),
  variant: z.enum(["default", "outline"]).optional().default("default"),
});

const TooltipPropsSchema = BasePropsSchema.extend({
  content: z.string().optional().default("Tooltip"),
  side: z.enum(["top", "right", "bottom", "left"]).optional().default("top"),
  delayDuration: z.number().optional().default(400),
});

// ── Components: Navigation ────────────────────────────────────────────────────

const NavGroupPropsSchema = BasePropsSchema.extend({
  placement: z.enum(["sidebar", "header", "footer"]).optional().default("sidebar"),
  label: z.string().optional(),
  collapsible: z.boolean().optional().default(false),
});

const NavItemPropsSchema = BasePropsSchema.extend({
  label: z.string().optional().default("Item"),
  href: z.string().optional().default("#"),
  icon: z.string().optional(),
  active: z.boolean().optional().default(false),
  badge: z.string().optional(),
});

const SidebarNavPropsSchema = BasePropsSchema.extend({
  title: z.string().optional(),
  items: z.array(z.object({
    label: z.string(),
    href: z.string().optional(),
    icon: z.string().optional(),
    items: z.array(z.any()).optional(),
  })).optional().default([]),
  collapsible: z.boolean().optional().default(false),
});

// ── Blocks: Template sections ─────────────────────────────────────────────────

const HeroPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Hero Title"),
  subtitle: z.string().optional(),
  cta: z.string().optional(),
  ctaHref: z.string().optional(),
  ctaVariant: ButtonVariantEnum.optional().default("default"),
  align: z.enum(["left", "center", "right"]).optional().default("center"),
  backgroundImage: z.string().optional(),
  overlay: z.boolean().optional().default(false),
});

const HeroCompositePropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default(""),
  subtitle: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional().default("center"),
});

// ── Blocks: UI Composition ────────────────────────────────────────────────────

const NavbarBlockPropsSchema = BasePropsSchema.extend({
  brand: z.string().optional().default("Brand"),
  logoUrl: z.string().optional(),
  items: z.array(z.object({ label: z.string(), href: z.string().optional() })).optional().default([]),
  showCta: z.boolean().optional().default(true),
  ctaLabel: z.string().optional().default("Get Started"),
  sticky: z.boolean().optional().default(false),
});

const PricingCardBlockPropsSchema = BasePropsSchema.extend({
  plan: z.string().optional().default("Plan"),
  price: z.string().optional().default("$0"),
  period: z.enum(["month", "year", "one-time"]).optional().default("month"),
  features: z.array(z.string()).optional().default([]),
  ctaLabel: z.string().optional().default("Get Started"),
  highlight: z.boolean().optional().default(false),
});

const TestimonialBlockPropsSchema = BasePropsSchema.extend({
  quote: z.string().optional().default(""),
  author: z.string().optional().default(""),
  role: z.string().optional(),
  avatarUrl: z.string().optional(),
  rating: z.number().min(1).max(5).optional().default(5),
});

const FooterBlockPropsSchema = BasePropsSchema.extend({
  brand: z.string().optional().default("Brand"),
  tagline: z.string().optional(),
  links: z.array(z.object({ label: z.string(), href: z.string().optional() })).optional().default([]),
  copyright: z.string().optional(),
});

// ── Smart Blocks: Data-connected ─────────────────────────────────────────────

const ChartBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Chart"),
  type: z.enum(["bar", "line", "pie", "area", "scatter", "donut"]).optional().default("bar"),
  data: z.array(z.record(z.string(), z.any())).optional().default([]),
  dataKey: z.string().optional().default("value"),
  categoryKey: z.string().optional().default("name"),
  showLegend: z.boolean().optional().default(true),
  showGrid: z.boolean().optional().default(true),
});

const KanbanBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Kanban"),
  columns: z.array(z.object({ id: z.string(), label: z.string(), color: z.string().optional() })).optional().default([]),
});

const TableBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Table"),
  columns: z.array(z.object({ key: z.string(), label: z.string(), sortable: z.boolean().optional() })).optional().default([]),
  data: z.array(z.record(z.string(), z.any())).optional().default([]),
  paginated: z.boolean().optional().default(true),
  pageSize: z.number().int().min(5).max(100).optional().default(10),
  searchable: z.boolean().optional().default(false),
});

const CalendarBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Calendar"),
  events: z.array(z.object({ title: z.string(), date: z.string(), color: z.string().optional() })).optional().default([]),
  view: z.enum(["month", "week", "day", "agenda"]).optional().default("month"),
});

const FilterBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Filter"),
  fields: z.array(z.object({ key: z.string(), label: z.string(), type: z.string() })).optional().default([]),
});

const FormBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Form"),
  fields: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(["text", "email", "password", "number", "tel", "url", "date", "textarea", "select", "checkbox", "radio"]),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  })).optional().default([]),
  submitLabel: z.string().optional().default("Submit"),
  layout: z.enum(["stacked", "inline", "grid"]).optional().default("stacked"),
});

const ListBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("List"),
  items: z.array(z.object({ title: z.string(), description: z.string().optional(), icon: z.string().optional() })).optional().default([]),
  maxItems: z.number().int().min(1).max(100).optional().default(10),
  variant: z.enum(["default", "card", "compact"]).optional().default("default"),
});

const StatsBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Stats"),
  stats: z.array(z.object({ label: z.string(), value: z.string(), change: z.string().optional(), trend: z.enum(["up", "down", "neutral"]).optional() })).optional().default([]),
});

const ActivityBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Activity"),
  activities: z.array(z.object({ description: z.string(), timestamp: z.string().optional(), user: z.string().optional() })).optional().default([]),
  maxItems: z.number().int().min(1).max(50).optional().default(10),
});

const EventsBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Events"),
  events: z.array(z.object({ title: z.string(), date: z.string(), location: z.string().optional() })).optional().default([]),
});

const ProfileBlockPropsSchema = BasePropsSchema.extend({
  name: z.string().optional().default("User Name"),
  role: z.string().optional(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  stats: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
});

const MetricCardBlockPropsSchema = BasePropsSchema.extend({
  label: z.string().optional().default("Metric"),
  value: z.string().optional().default("0"),
  change: z.string().optional(),
  trend: z.enum(["up", "down", "neutral"]).optional().default("neutral"),
  icon: z.string().optional(),
  description: z.string().optional(),
  color: z.enum(["default", "green", "red", "blue", "yellow", "purple"]).optional().default("default"),
});

const AgentBlockPropsSchema = BasePropsSchema.extend({
  agentName: z.string().optional().default("AI Agent"),
  description: z.string().optional(),
  suggestions: z.array(z.string()).optional().default([]),
  avatarUrl: z.string().optional(),
});

const TeamBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Team"),
  roles: z.array(z.object({ name: z.string(), role: z.string(), avatar: z.string().optional() })).optional().default([]),
});

const TimeRangeBlockPropsSchema = BasePropsSchema.extend({
  value: z.enum(["7d", "14d", "30d", "90d", "1y", "custom"]).optional().default("30d"),
  options: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
});

const FileBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Files"),
  files: z.array(z.object({ name: z.string(), size: z.string().optional(), type: z.string().optional() })).optional().default([]),
  allowUpload: z.boolean().optional().default(false),
  acceptedTypes: z.array(z.string()).optional(),
});

const CommentBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Comments"),
  comments: z.array(z.object({ author: z.string(), content: z.string(), createdAt: z.string().optional() })).optional().default([]),
  allowReply: z.boolean().optional().default(false),
});

const RichTextBlockPropsSchema = BasePropsSchema.extend({
  content: z.string().optional().default(""),
  editable: z.boolean().optional().default(false),
});

const MediaBlockPropsSchema = BasePropsSchema.extend({
  title: z.string().optional().default("Media"),
  items: z.array(z.object({ src: z.string(), alt: z.string().optional(), type: z.enum(["image", "video"]).optional() })).optional().default([]),
  layout: z.enum(["grid", "list", "masonry"]).optional().default("grid"),
});

// ── Deprecated (hidden) widgets ───────────────────────────────────────────────
// These remain renderable for backward compat but MUST NOT be emitted by generators.

const HeadingPropsSchema = BasePropsSchema.extend({
  level: z.enum(["1", "2", "3", "4", "5", "6"]).optional().default("2"),
  content: z.string().optional().default(""),
});

const DividerPropsSchema = BasePropsSchema.extend({
  orientation: z.enum(["horizontal", "vertical"]).optional().default("horizontal"),
});

// Legacy layout aliases — DEPRECATED. Renderer resolves these to `div`.
const LegacyContainerPropsSchema = BasePropsSchema.merge(LayoutPropsSchema);

// ─────────────────────────────────────────────────────────────────────────────
// [N] §6  Widget Registry
//
// The SINGLE source of truth for all known widget types.
// The validator and renderer MUST use this list.
// The AI generator MUST NOT emit widget types not listed here.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Complete widget registry mapping type key → Zod prop schema.
 *
 * Child policy per widget:
 *   "none"     → children MUST be []
 *   "any"      → children may reference any widget type
 *   "layout"   → children SHOULD be layout or leaf nodes (no nested smart blocks)
 *   "slot"     → named slot children (see `slots` in WidgetConfig)
 *
 * Layout default per widget (what display the renderer uses when not specified):
 *   layout containers → "flex"
 *   leaf nodes        → not applicable (no children)
 *   section/div       → "flex" (NORMATIVE: never defaults to "block")
 */
export const WIDGET_REGISTRY = {
  // ── Elements: Layout ──────────────────────────────────────────────────────
  div:          { schema: DivPropsSchema,           childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  section:      { schema: SectionPropsSchema,       childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  grid:         { schema: GridPropsSchema,          childPolicy: "any" as const,    layoutDefault: "grid",  deprecated: false },
  flex:         { schema: FlexPropsSchema,          childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  twoColumn:    { schema: TwoColumnPropsSchema,     childPolicy: "slot" as const,   layoutDefault: "flex",  deprecated: false },
  threeColumn:  { schema: ThreeColumnPropsSchema,   childPolicy: "slot" as const,   layoutDefault: "flex",  deprecated: false },

  // ── Elements: Content ─────────────────────────────────────────────────────
  text:         { schema: TextPropsSchema,          childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  card:         { schema: CardPropsSchema,          childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  image:        { schema: ImagePropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },

  // ── Elements: Action ──────────────────────────────────────────────────────
  button:       { schema: ButtonPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  iconButton:   { schema: IconButtonPropsSchema,    childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  link:         { schema: LinkPropsSchema,          childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },

  // ── Elements: Form ────────────────────────────────────────────────────────
  input:        { schema: InputPropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  textarea:     { schema: TextareaPropsSchema,      childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  select:       { schema: SelectPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  checkbox:     { schema: CheckboxPropsSchema,      childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  radioGroup:   { schema: RadioGroupPropsSchema,    childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  switch:       { schema: SwitchPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  label:        { schema: LabelPropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  slider:       { schema: SliderPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  toggle:       { schema: TogglePropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },

  // ── Elements: Utility ─────────────────────────────────────────────────────
  separator:    { schema: SeparatorPropsSchema,     childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  spacer:       { schema: SpacerPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },

  // ── Components: shadcn/ui ─────────────────────────────────────────────────
  accordion:    { schema: AccordionPropsSchema,     childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  alert:        { schema: AlertPropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  alertDialog:  { schema: AlertDialogPropsSchema,   childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  aspectRatio:  { schema: BasePropsSchema,          childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  avatar:       { schema: AvatarPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  badge:        { schema: BadgePropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  breadcrumb:   { schema: BreadcrumbPropsSchema,    childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  buttonGroup:  { schema: ButtonGroupPropsSchema,   childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  carousel:     { schema: CarouselPropsSchema,      childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  collapsible:  { schema: CollapsiblePropsSchema,   childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  command:      { schema: BasePropsSchema,          childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  contextMenu:  { schema: BasePropsSchema,          childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  dialog:       { schema: DialogPropsSchema,        childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  drawer:       { schema: DrawerPropsSchema,        childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  dropdownMenu: { schema: DropdownMenuPropsSchema,  childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  formGroup:    { schema: FormGroupPropsSchema,     childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  hoverCard:    { schema: HoverCardPropsSchema,     childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  inputGroup:   { schema: InputGroupPropsSchema,    childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  popover:      { schema: PopoverPropsSchema,       childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  progress:     { schema: ProgressPropsSchema,      childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  resizable:    { schema: ResizablePropsSchema,     childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  scrollArea:   { schema: ScrollAreaPropsSchema,    childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  sheet:        { schema: SheetPropsSchema,         childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  skeleton:     { schema: SkeletonPropsSchema,      childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  sonner:       { schema: SonnerPropsSchema,        childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  table:        { schema: TablePropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  tabs:         { schema: TabsPropsSchema,          childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },
  toggleGroup:  { schema: ToggleGroupPropsSchema,   childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  tooltip:      { schema: TooltipPropsSchema,       childPolicy: "any" as const,    layoutDefault: null,    deprecated: false },

  // ── Components: Navigation ────────────────────────────────────────────────
  navGroup:     { schema: NavGroupPropsSchema,      childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: false },
  navItem:      { schema: NavItemPropsSchema,       childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },
  sidebarNav:   { schema: SidebarNavPropsSchema,    childPolicy: "none" as const,   layoutDefault: null,    deprecated: false },

  // ── Blocks: Template sections ─────────────────────────────────────────────
  hero:              { schema: HeroPropsSchema,              childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  heroComposite:     { schema: HeroCompositePropsSchema,     childPolicy: "any" as const,  layoutDefault: null, deprecated: false },

  // ── Blocks: UI Composition ────────────────────────────────────────────────
  navbarBlock:       { schema: NavbarBlockPropsSchema,       childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  pricingCardBlock:  { schema: PricingCardBlockPropsSchema,  childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  testimonialBlock:  { schema: TestimonialBlockPropsSchema,  childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  footerBlock:       { schema: FooterBlockPropsSchema,       childPolicy: "none" as const, layoutDefault: null, deprecated: false },

  // ── Smart Blocks: Data-connected ──────────────────────────────────────────
  chartBlock:        { schema: ChartBlockPropsSchema,        childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  kanbanBlock:       { schema: KanbanBlockPropsSchema,       childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  tableBlock:        { schema: TableBlockPropsSchema,        childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  calendarBlock:     { schema: CalendarBlockPropsSchema,     childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  filterBlock:       { schema: FilterBlockPropsSchema,       childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  formBlock:         { schema: FormBlockPropsSchema,         childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  listBlock:         { schema: ListBlockPropsSchema,         childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  statsBlock:        { schema: StatsBlockPropsSchema,        childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  activityBlock:     { schema: ActivityBlockPropsSchema,     childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  eventsBlock:       { schema: EventsBlockPropsSchema,       childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  profileBlock:      { schema: ProfileBlockPropsSchema,      childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  metricCardBlock:   { schema: MetricCardBlockPropsSchema,   childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  agentBlock:        { schema: AgentBlockPropsSchema,        childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  teamBlock:         { schema: TeamBlockPropsSchema,         childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  timeRangeBlock:    { schema: TimeRangeBlockPropsSchema,    childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  fileBlock:         { schema: FileBlockPropsSchema,         childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  commentBlock:      { schema: CommentBlockPropsSchema,      childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  richTextBlock:     { schema: RichTextBlockPropsSchema,     childPolicy: "none" as const, layoutDefault: null, deprecated: false },
  mediaBlock:        { schema: MediaBlockPropsSchema,        childPolicy: "none" as const, layoutDefault: null, deprecated: false },

  // ── Deprecated: still renderable, never generated ─────────────────────────
  heading:    { schema: HeadingPropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: true },
  divider:    { schema: DividerPropsSchema,         childPolicy: "none" as const,   layoutDefault: null,    deprecated: true },
  // Legacy layout aliases — all resolve to `div`
  row:        { schema: LegacyContainerPropsSchema, childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: true },
  column:     { schema: LegacyContainerPropsSchema, childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: true },
  container:  { schema: LegacyContainerPropsSchema, childPolicy: "any" as const,    layoutDefault: "flex",  deprecated: true },
} as const;

export type WidgetType = keyof typeof WIDGET_REGISTRY;
export const KNOWN_WIDGET_TYPES = new Set(Object.keys(WIDGET_REGISTRY) as WidgetType[]);
export const DEPRECATED_WIDGET_TYPES = new Set(
  (Object.entries(WIDGET_REGISTRY) as [WidgetType, { deprecated: boolean }][])
    .filter(([, v]) => v.deprecated)
    .map(([k]) => k)
);
export const ACTIVE_WIDGET_TYPES = new Set(
  (Object.entries(WIDGET_REGISTRY) as [WidgetType, { deprecated: boolean }][])
    .filter(([, v]) => !v.deprecated)
    .map(([k]) => k)
);

// ─────────────────────────────────────────────────────────────────────────────
// [N] §7  SchemaNode
// ─────────────────────────────────────────────────────────────────────────────

export const SchemaNodeSchema = z.object({
  /** Widget type. Must be a key in WIDGET_REGISTRY. */
  type: z.string(),
  /**
   * Props object. Keys and value types depend on the widget type.
   * Only include props that differ from the widget's defaults.
   * Unknown props are ignored by the renderer (logged as warnings).
   */
  props: z.record(z.string(), z.unknown()).optional().default({}),
  /**
   * Ordered list of child node IDs.
   * Must be [] for leaf nodes (childPolicy: "none").
   * All IDs must exist in the document's nodes map.
   * IDs must be unique within this array.
   * A node ID may appear in at most ONE parent's children array.
   */
  children: z.array(NodeIdSchema).default([]),
});

export type SchemaNode = z.infer<typeof SchemaNodeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// [N] §8  StudioUISchema — Top-level document
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional document metadata block.
 * Present in v0.5 documents. Absent from v0.4 documents (both are valid).
 */
const UIDocumentMetadataSchema = z.object({
  /** Stable UUID for this document. */
  id: z.string().uuid().optional(),
  /** Human-readable document name. */
  name: z.string().max(200).optional(),
  /** Short description of the UI. */
  description: z.string().max(1000).optional(),
  /** Author name or user ID. */
  author: z.string().optional(),
  /** Searchable tags. */
  tags: z.array(z.string().max(50)).max(20).optional(),
  /** SemVer document version (independent of schema version). */
  version: z.string().optional(),
  /** ISO 8601 creation timestamp. */
  createdAt: z.string().datetime().optional(),
  /** ISO 8601 last-updated timestamp. */
  updatedAt: z.string().datetime().optional(),
  /** Convex workspace ID this document belongs to. */
  workspaceId: z.string().optional(),
  /** Convex project ID this document is part of. */
  projectId: z.string().optional(),
  /** Whether this is a template document. */
  isTemplate: z.boolean().optional(),
  /** Agent that generated this document (for audit/train-mode tracing). */
  generatedBy: z.string().optional(),
  /** Schema spec URL for external validators. */
  $schema: z.string().url().optional(),
});

export type UIDocumentMetadata = z.infer<typeof UIDocumentMetadataSchema>;

/**
 * StudioUISchema — the complete UI document format.
 *
 * [N] Invariants enforced by the validator (validateStudioUISchema):
 *   1.  `version` must be one of UI_SCHEMA_VERSIONS.
 *   2.  `root` must be a non-empty array.
 *   3.  All IDs in `root` must be unique.
 *   4.  All IDs in `root` must exist in `nodes`.
 *   5.  All IDs in any `children` array must exist in `nodes`.
 *   6.  `children` arrays must contain unique IDs (no duplicate children).
 *   7.  A node ID may appear in at most one parent's `children` array (single-parent invariant).
 *   8.  The document must be a rooted tree — no general graph.
 *   9.  Cycle references are invalid.
 *   10. All root nodes must be reachable (no orphan nodes in root).
 *   11. All nodes must be reachable from root (no orphan nodes in `nodes`).
 *   12. `nodes` must not be empty.
 *   13. Node IDs must match NODE_ID_REGEX.
 */
export const StudioUISchemaZod = z.object({
  /** Schema version. Must be "0.5" for new documents; "0.4" for legacy. */
  version: z.enum(UI_SCHEMA_VERSIONS),
  /**
   * Ordered list of top-level node IDs.
   * These are the "page roots" — nodes with no parent.
   * Must be non-empty and contain unique IDs.
   * For multi-page schemas: one root entry per page (section with `path`).
   */
  root: z.array(NodeIdSchema).min(1),
  /** All nodes keyed by stable node ID. Must not be empty. */
  nodes: z.record(NodeIdSchema, SchemaNodeSchema).refine(
    (nodes) => Object.keys(nodes).length > 0,
    "nodes must not be empty"
  ),
  /** Optional metadata block (required for v0.5 exports, optional for v0.4 compat). */
  metadata: UIDocumentMetadataSchema.optional(),
});

export type StudioUISchema = z.infer<typeof StudioUISchemaZod>;

// ─────────────────────────────────────────────────────────────────────────────
// [N] §9  Alias Resolution Table
//
// These aliases are accepted by the IMPORTER ONLY (not the generator).
// The importer normalises these to canonical prop names before passing
// the document to the validator and renderer.
// ─────────────────────────────────────────────────────────────────────────────

export const PROP_ALIAS_MAP: Record<string, string> = {
  // flex widget aliases (deprecated)
  direction:   "flexDirection",
  align:       "alignItems",
  justify:     "justifyContent",
  wrap:        "flexWrap",
  // color aliases
  background:  "backgroundColor",
  bg:          "backgroundColor",
  // gap aliases (t-shirt sizes — normalized to rem)
  // These are handled by TSHIRT_GAP_MAP, not here
};

/** T-shirt size gap values resolved by importer for the `grid` widget. */
export const TSHIRT_GAP_MAP: Record<string, string> = {
  none: "0",
  xs:   "0.25rem",
  sm:   "0.5rem",
  md:   "1rem",
  lg:   "1.5rem",
  xl:   "2rem",
  "2xl":"3rem",
};

// ─────────────────────────────────────────────────────────────────────────────
// [N] §10  Layout Defaults (Normative)
//
// When a layout container node is rendered without an explicit `display` prop,
// the renderer MUST apply the layoutDefault from WIDGET_REGISTRY — NOT "block".
// Applying "block" as the default for layout containers is a BUG.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fallback layout defaults applied by the renderer when layout props are absent.
 * These defaults are normative. The renderer MUST NOT use browser defaults.
 */
export const LAYOUT_FALLBACK_DEFAULTS = {
  /** Applied to: div, section, flex, card, formGroup, buttonGroup, navGroup */
  mainContainer: {
    display: "flex" as const,
    flexDirection: "column" as const,
    gap: "1rem",
  },
  /** Applied to: action rows (flex-row button groups) */
  actionRow: {
    display: "flex" as const,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: "0.5rem",
  },
  /** Applied to: grid, list of cards/blocks */
  cardCollection: {
    display: "grid" as const,
    gap: "1.5rem",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// [I] §11  Placeholder Rules (Informative)
//
// Generators MUST use contextual placeholders. Generic placeholders are INVALID.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Examples of VALID contextual placeholders.
 * [I] Informative — not validated by runtime.
 */
export const PLACEHOLDER_EXAMPLES = {
  agentName:         "Masukkan nama agent",
  customInstruction: "Tulis instruksi khusus untuk agent ini",
  exportFileName:    "Masukkan nama file export",
  imageReference:    "Upload gambar referensi untuk validasi visual",
  searchBar:         "Cari berdasarkan nama, kategori, atau tag...",
  emailField:        "nama@perusahaan.com",
  passwordField:     "Minimal 8 karakter",
  taskTitle:         "Masukkan judul tugas",
  projectName:       "Masukkan nama proyek",
} as const;

/**
 * INVALID generic placeholders — MUST NOT be emitted by generators.
 * [I] Informative.
 */
export const INVALID_PLACEHOLDERS = [
  "Enter here",
  "Type something",
  "Input",
  "Enter text",
  "Placeholder",
  "...",
] as const;
