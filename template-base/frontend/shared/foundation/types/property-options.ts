/**
 * Property Options Types
 *
 * Type definitions for configuring different property types in the Universal Database.
 * Each property type has specific options that control its behavior and display.
 *
 * @module frontend/shared/foundation/types/property-options
 */

/**
 * Number property configuration
 *
 * Controls how numeric values are displayed and validated.
 *
 * @example
 * ```typescript
 * const priceOptions: NumberOptions = {
 *   format: "currency",
 *   currency: "USD",
 *   decimals: 2,
 *   min: 0,
 * };
 * ```
 */
export interface NumberOptions {
  /** Display format for the number */
  format: "number" | "percent" | "currency";

  /** Currency code (required when format is "currency") */
  currency?: "USD" | "EUR" | "IDR" | "SGD" | "GBP" | "JPY" | "CNY";

  /** Number of decimal places to display (0-10) */
  decimals?: number;

  /** Minimum allowed value */
  min?: number;

  /** Maximum allowed value */
  max?: number;
}

/**
 * Select/Multi-select choice
 *
 * Represents a single option in a select or multi-select property.
 *
 * @example
 * ```typescript
 * const choice: SelectChoice = {
 *   id: "priority-high",
 *   name: "High",
 *   color: "#ff0000",
 *   icon: "🔥",
 * };
 * ```
 */
export interface SelectChoice {
  /** Unique identifier for the choice */
  id?: string;

  /** Display name shown to users */
  name: string;

  /** Color for the choice (hex code or preset) */
  color?: string;

  /** Icon for the choice (emoji) */
  icon?: string;
}

/**
 * Select property configuration
 *
 * Controls behavior of select and multi-select properties.
 *
 * @example
 * ```typescript
 * const selectOptions: SelectOptions = {
 *   choices: [
 *     { name: "Option 1", color: "#blue" },
 *     { name: "Option 2", color: "#red" },
 *   ],
 *   allowCreate: true,
 * };
 * ```
 */
export interface SelectOptions {
  /** Available choices for selection */
  choices: SelectChoice[];

  /** Allow users to create new choices */
  allowCreate?: boolean;
}

/**
 * Status group (for kanban-style grouping)
 *
 * Groups status choices together for organization (e.g., "To Do", "In Progress", "Done").
 *
 * @example
 * ```typescript
 * const group: StatusGroup = {
 *   id: "in-progress",
 *   name: "In Progress",
 *   color: "#yellow",
 * };
 * ```
 */
export interface StatusGroup {
  /** Unique identifier for the group */
  id: string;

  /** Display name for the group */
  name: string;

  /** Color for the group */
  color?: string;
}

/**
 * Status choice
 *
 * Represents a single status option within a status property.
 *
 * @example
 * ```typescript
 * const status: StatusChoice = {
 *   id: "status-wip",
 *   name: "Work in Progress",
 *   color: "#ffaa00",
 *   groupId: "in-progress",
 * };
 * ```
 */
export interface StatusChoice {
  /** Unique identifier for the status */
  id: string;

  /** Display name for the status */
  name: string;

  /** Color for the status */
  color?: string;

  /** ID of the parent group */
  groupId?: string;
}

/**
 * Status property configuration
 *
 * Controls behavior of status properties with support for grouping.
 *
 * @example
 * ```typescript
 * const statusOptions: StatusOptions = {
 *   groups: [
 *     { id: "todo", name: "To Do" },
 *     { id: "done", name: "Done" },
 *   ],
 *   choices: [
 *     { id: "new", name: "New", groupId: "todo" },
 *     { id: "completed", name: "Completed", groupId: "done" },
 *   ],
 *   defaultStatusId: "new",
 * };
 * ```
 */
export interface StatusOptions {
  /** Status groups for organization */
  groups: StatusGroup[];

  /** Available status choices */
  choices: StatusChoice[];

  /** Default status ID for new items */
  defaultStatusId?: string;
}

/**
 * Date property configuration
 *
 * Controls how dates are displayed and validated.
 *
 * @example
 * ```typescript
 * const dateOptions: DateOptions = {
 *   format: "month_day_year",
 *   includeTime: true,
 *   timeFormat: "12h",
 *   supportRange: false,
 *   defaultToday: true,
 * };
 * ```
 */
export interface DateOptions {
  /** Display format for the date */
  format: "relative" | "full" | "month_day_year" | "day_month_year" | "year_month_day";

  /** Include time component in the date */
  includeTime?: boolean;

  /** Time format (12-hour or 24-hour) */
  timeFormat?: "12h" | "24h";

  /** Support date ranges (start and end dates) */
  supportRange?: boolean;

  /** Default to today's date when creating new items */
  defaultToday?: boolean;
}

/**
 * People property configuration
 *
 * Controls behavior of people/user assignment properties.
 *
 * @example
 * ```typescript
 * const peopleOptions: PeopleOptions = {
 *   allowMultiple: true,
 *   restrictToRoles: ["admin", "editor"],
 *   showAvatars: true,
 *   notifyOnAssign: true,
 * };
 * ```
 */
export interface PeopleOptions {
  /** Allow selecting multiple users */
  allowMultiple?: boolean;

  /** Restrict selection to users with specific roles */
  restrictToRoles?: string[];

  /** Display user avatars */
  showAvatars?: boolean;

  /** Send notification when user is assigned */
  notifyOnAssign?: boolean;
}

/**
 * Files property configuration
 *
 * Controls file upload behavior and validation.
 *
 * @example
 * ```typescript
 * const filesOptions: FilesOptions = {
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   allowedTypes: ["image/png", "image/jpeg", "application/pdf"],
 *   maxFiles: 5,
 *   showThumbnails: true,
 * };
 * ```
 */
export interface FilesOptions {
  /** Maximum file size in bytes */
  maxSize?: number;

  /** Allowed MIME types for uploads */
  allowedTypes?: string[];

  /** Maximum number of files that can be uploaded */
  maxFiles?: number;

  /** Display thumbnails for image files */
  showThumbnails?: boolean;
}

/**
 * Relation property configuration
 *
 * Controls how items relate to other database items.
 *
 * @example
 * ```typescript
 * const relationOptions: RelationOptions = {
 *   targetDatabaseId: "db_projects",
 *   displayProperty: "title",
 *   allowMultiple: true,
 *   bidirectional: true,
 *   reversePropertyKey: "tasks",
 * };
 * ```
 */
export interface RelationOptions {
  /** ID of the target database */
  targetDatabaseId: string;

  /** Property key to display for related items */
  displayProperty?: string;

  /** Allow multiple related items */
  allowMultiple?: boolean;

  /** Create bidirectional relation */
  bidirectional?: boolean;

  /** Property key for the reverse relation (if bidirectional) */
  reversePropertyKey?: string;
}

/**
 * Rollup property configuration
 *
 * Controls how data from related items is aggregated.
 *
 * @example
 * ```typescript
 * const rollupOptions: RollupOptions = {
 *   relationPropertyKey: "tasks",
 *   targetPropertyKey: "progress",
 *   function: "average",
 *   asPercent: true,
 * };
 * ```
 */
export interface RollupOptions {
  /** Source relation property key to aggregate from */
  relationPropertyKey: string;

  /** Target property key to aggregate */
  targetPropertyKey: string;

  /** Aggregation function to apply */
  function: "count" | "sum" | "average" | "min" | "max" | "range" | "unique" | "show_original";

  /** Display result as percentage */
  asPercent?: boolean;
}

/**
 * Button property configuration
 *
 * Controls button behavior and appearance.
 *
 * @example
 * ```typescript
 * const buttonOptions: ButtonOptions = {
 *   label: "Submit Form",
 *   action: "create",
 *   message: "Form submitted successfully!",
 *   color: "#0066ff",
 *   icon: "✓",
 * };
 * ```
 */
export interface ButtonOptions {
  /** Button label text */
  label: string;

  /** Action to perform when clicked */
  action: "create" | "update" | "redirect";

  /** Redirect URL (required when action is "redirect") */
  redirect?: string;

  /** Success message to display after action */
  message?: string;

  /** Button color (hex code or preset) */
  color?: string;

  /** Button icon (emoji) */
  icon?: string;
}

/**
 * Place property configuration
 *
 * Controls location/place property behavior.
 *
 * @example
 * ```typescript
 * const placeOptions: PlaceOptions = {
 *   defaultZoom: 12,
 *   showFullAddress: true,
 *   provider: "google",
 * };
 * ```
 */
export interface PlaceOptions {
  /** Default zoom level for maps (1-20) */
  defaultZoom?: number;

  /** Display full address including postal code */
  showFullAddress?: boolean;

  /** Map provider to use */
  provider?: "google" | "openstreetmap" | "mapbox";
}

/**
 * Formula property configuration
 *
 * Controls computed formula properties.
 *
 * @example
 * ```typescript
 * const formulaOptions: FormulaOptions = {
 *   expression: "prop('price') * prop('quantity')",
 *   returnType: "number",
 *   numberFormat: {
 *     format: "currency",
 *     currency: "USD",
 *     decimals: 2,
 *   },
 * };
 * ```
 */
export interface FormulaOptions {
  /** Formula expression to evaluate */
  expression: string;

  /** Expected return type of the formula */
  returnType: "text" | "number" | "boolean" | "date";

  /** Format for number results (when returnType is "number") */
  numberFormat?: NumberOptions;

  /** Format for date results (when returnType is "date") */
  dateFormat?: DateOptions;
}

/**
 * Union of all property options
 *
 * Type-safe union representing any valid property option configuration.
 * Use this type when working with generic property configurations.
 *
 * @example
 * ```typescript
 * function configureProperty(options: PropertyOptions) {
 *   // Handle any property option type
 * }
 * ```
 */
export type PropertyOptions =
  | NumberOptions
  | SelectOptions
  | StatusOptions
  | DateOptions
  | PeopleOptions
  | FilesOptions
  | RelationOptions
  | RollupOptions
  | ButtonOptions
  | PlaceOptions
  | FormulaOptions
  | Record<string, any>;
