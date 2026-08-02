/**
 * View Options Types
 *
 * Type definitions for configuring different view layouts in the Universal Database.
 * Each view type has specific options that control its behavior and display.
 *
 * @module frontend/shared/foundation/types/view-options
 */

/**
 * Table view configuration
 *
 * Controls the display and behavior of table views.
 *
 * @example
 * ```typescript
 * const tableOptions: TableOptions = {
 *   showRowNumbers: true,
 *   rowHeight: "compact",
 *   wrapCells: false,
 *   showCalculations: true,
 *   columnWidths: { name: 200, status: 120 },
 *   frozenColumns: 1,
 * };
 * ```
 */
export interface TableOptions {
  /** Display row numbers in the first column */
  showRowNumbers?: boolean;

  /** Height of table rows */
  rowHeight?: "compact" | "default" | "tall";

  /** Wrap long text content in cells */
  wrapCells?: boolean;

  /** Show calculation row at the bottom (sum, count, etc.) */
  showCalculations?: boolean;

  /** Custom column widths (property key to width in pixels) */
  columnWidths?: Record<string, number>;

  /** Number of columns to freeze from the left */
  frozenColumns?: number;
}

/**
 * Board view configuration
 *
 * Controls the display and behavior of kanban board views.
 *
 * @example
 * ```typescript
 * const boardOptions: BoardOptions = {
 *   cardCoverProperty: "thumbnail",
 *   cardPreviewProperties: ["assignee", "dueDate"],
 *   showEmptyGroups: true,
 *   groupByProperty: "status",
 *   subGroupByProperty: "priority",
 * };
 * ```
 */
export interface BoardOptions {
  /** Property to use as card cover image */
  cardCoverProperty?: string;

  /** Properties to preview on cards */
  cardPreviewProperties?: string[];

  /** Show empty groups/columns */
  showEmptyGroups?: boolean;

  /** Property to group cards by (typically status) */
  groupByProperty?: string;

  /** Property to sub-group cards by */
  subGroupByProperty?: string;
}

/**
 * List view configuration
 *
 * Controls the display and behavior of list views.
 *
 * @example
 * ```typescript
 * const listOptions: ListOptions = {
 *   showIcon: true,
 *   previewProperties: ["status", "assignee", "dueDate"],
 *   compact: false,
 *   groupByProperty: "category",
 * };
 * ```
 */
export interface ListOptions {
  /** Display icon for each item */
  showIcon?: boolean;

  /** Properties to preview in list items */
  previewProperties?: string[];

  /** Use compact display mode */
  compact?: boolean;

  /** Property to group list items by */
  groupByProperty?: string;
}

/**
 * Timeline view configuration
 *
 * Controls the display and behavior of timeline/Gantt views.
 *
 * @example
 * ```typescript
 * const timelineOptions: TimelineOptions = {
 *   startDateProperty: "startDate",
 *   endDateProperty: "endDate",
 *   titleProperty: "name",
 *   statusProperty: "status",
 *   showWeekends: false,
 *   zoom: "week",
 *   showTodayLine: true,
 * };
 * ```
 */
export interface TimelineOptions {
  /** Property containing the start date */
  startDateProperty: string;

  /** Property containing the end date (optional, defaults to start date) */
  endDateProperty?: string;

  /** Property to use as item title */
  titleProperty?: string;

  /** Property to use for status-based coloring */
  statusProperty?: string;

  /** Show weekends in the timeline */
  showWeekends?: boolean;

  /** Timeline zoom level */
  zoom?: "day" | "week" | "month" | "quarter" | "year";

  /** Show a line indicating today's date */
  showTodayLine?: boolean;
}

/**
 * Calendar view configuration
 *
 * Controls the display and behavior of calendar views.
 *
 * @example
 * ```typescript
 * const calendarOptions: CalendarOptions = {
 *   dateProperty: "eventDate",
 *   defaultView: "month",
 *   showWeekends: true,
 *   firstDayOfWeek: 1, // Monday
 *   showWeekNumbers: true,
 * };
 * ```
 */
export interface CalendarOptions {
  /** Property containing the date to display */
  dateProperty: string;

  /** Default calendar view mode */
  defaultView?: "month" | "week" | "day";

  /** Show weekends in the calendar */
  showWeekends?: boolean;

  /** First day of the week (0=Sunday, 1=Monday, 6=Saturday) */
  firstDayOfWeek?: 0 | 1 | 6;

  /** Show week numbers in the calendar */
  showWeekNumbers?: boolean;
}

/**
 * Gallery card configuration
 *
 * Controls how cards are displayed in gallery view.
 *
 * @example
 * ```typescript
 * const galleryCard: GalleryCard = {
 *   coverProperty: "image",
 *   coverFit: "cover",
 *   coverAspectRatio: "16:9",
 *   properties: ["title", "description", "tags"],
 * };
 * ```
 */
export interface GalleryCard {
  /** Property to use as card cover image */
  coverProperty?: string;

  /** How to fit the cover image */
  coverFit?: "cover" | "contain";

  /** Aspect ratio for the cover image */
  coverAspectRatio?: "1:1" | "4:3" | "16:9";

  /** Properties to display on the card */
  properties?: string[];
}

/**
 * Gallery view configuration
 *
 * Controls the display and behavior of gallery views.
 *
 * @example
 * ```typescript
 * const galleryOptions: GalleryOptions = {
 *   card: {
 *     coverProperty: "photo",
 *     coverFit: "cover",
 *     coverAspectRatio: "4:3",
 *     properties: ["name", "category"],
 *   },
 *   cardsPerRow: 4,
 *   cardSize: "medium",
 * };
 * ```
 */
export interface GalleryOptions {
  /** Card display configuration */
  card: GalleryCard;

  /** Number of cards to display per row */
  cardsPerRow?: number;

  /** Size of gallery cards */
  cardSize?: "small" | "medium" | "large";
}

/**
 * Map marker configuration
 *
 * Controls how markers are displayed on the map.
 *
 * @example
 * ```typescript
 * const mapMarker: MapMarker = {
 *   titleProperty: "name",
 *   colorProperty: "status",
 *   iconProperty: "category",
 *   showPopup: true,
 *   popupProperties: ["address", "phone", "hours"],
 * };
 * ```
 */
export interface MapMarker {
  /** Property to use as marker title */
  titleProperty?: string;

  /** Property to determine marker color */
  colorProperty?: string;

  /** Property to determine marker icon */
  iconProperty?: string;

  /** Show popup when marker is clicked */
  showPopup?: boolean;

  /** Properties to display in popup */
  popupProperties?: string[];
}

/**
 * Map view configuration
 *
 * Controls the display and behavior of map views.
 *
 * @example
 * ```typescript
 * const mapOptions: MapOptions = {
 *   locationProperty: "address",
 *   marker: {
 *     titleProperty: "name",
 *     showPopup: true,
 *     popupProperties: ["description", "phone"],
 *   },
 *   defaultCenter: { lat: 40.7128, lng: -74.0060 },
 *   defaultZoom: 12,
 *   clusterMarkers: true,
 * };
 * ```
 */
export interface MapOptions {
  /** Property containing location data (place type) */
  locationProperty: string;

  /** Marker display configuration */
  marker: MapMarker;

  /** Default map center coordinates */
  defaultCenter?: {
    /** Latitude */
    lat: number;
    /** Longitude */
    lng: number;
  };

  /** Default zoom level (1-20) */
  defaultZoom?: number;

  /** Group nearby markers into clusters */
  clusterMarkers?: boolean;
}

/**
 * Chart view configuration
 *
 * Controls the display and behavior of chart views.
 *
 * @example
 * ```typescript
 * const chartOptions: ChartOptions = {
 *   type: "bar",
 *   xAxisProperty: "month",
 *   yAxisProperty: "revenue",
 *   aggregation: "sum",
 *   groupByProperty: "category",
 *   showLegend: true,
 *   showGrid: true,
 * };
 * ```
 */
export interface ChartOptions {
  /** Type of chart to display */
  type: "bar" | "line" | "pie" | "donut" | "area" | "scatter";

  /** Property to use for X-axis */
  xAxisProperty: string;

  /** Property to use for Y-axis */
  yAxisProperty: string;

  /** Aggregation function for Y-axis values */
  aggregation?: "count" | "sum" | "average" | "min" | "max";

  /** Property to group data by */
  groupByProperty?: string;

  /** Show chart legend */
  showLegend?: boolean;

  /** Show grid lines */
  showGrid?: boolean;
}

/**
 * Feed card configuration
 *
 * Controls how cards are displayed in feed view.
 *
 * @example
 * ```typescript
 * const feedCard: FeedCard = {
 *   showAvatar: true,
 *   avatarProperty: "author",
 *   titleProperty: "subject",
 *   contentProperty: "body",
 *   dateProperty: "publishedAt",
 *   showReactions: true,
 * };
 * ```
 */
export interface FeedCard {
  /** Show avatar for each item */
  showAvatar?: boolean;

  /** Property to use for avatar (people type) */
  avatarProperty?: string;

  /** Property to use as card title */
  titleProperty?: string;

  /** Property to use as card content */
  contentProperty?: string;

  /** Property to use as card date */
  dateProperty?: string;

  /** Show reactions/likes on cards */
  showReactions?: boolean;
}

/**
 * Feed view configuration
 *
 * Controls the display and behavior of feed/activity views.
 *
 * @example
 * ```typescript
 * const feedOptions: FeedOptions = {
 *   card: {
 *     showAvatar: true,
 *     avatarProperty: "user",
 *     titleProperty: "title",
 *     contentProperty: "description",
 *     dateProperty: "createdAt",
 *   },
 *   sortByProperty: "createdAt",
 *   sortDirection: "descending",
 * };
 * ```
 */
export interface FeedOptions {
  /** Card display configuration */
  card: FeedCard;

  /** Property to sort items by (typically date) */
  sortByProperty: string;

  /** Sort direction */
  sortDirection: "ascending" | "descending";
}

/**
 * Form field configuration
 *
 * Controls how individual fields are displayed in the form.
 *
 * @example
 * ```typescript
 * const formField: FormField = {
 *   propertyKey: "email",
 *   label: "Email Address",
 *   description: "Your primary email for notifications",
 *   width: 6,
 *   required: true,
 *   placeholder: "user@example.com",
 * };
 * ```
 */
export interface FormField {
  /** Property key this field represents */
  propertyKey: string;

  /** Custom label (overrides property name) */
  label?: string;

  /** Help text for the field */
  description?: string;

  /** Field width in 12-column grid (1-12) */
  width?: number;

  /** Whether the field is required */
  required?: boolean;

  /** Placeholder text for the field */
  placeholder?: string;
}

/**
 * Form section configuration
 *
 * Groups related fields together in the form.
 *
 * @example
 * ```typescript
 * const formSection: FormSection = {
 *   title: "Contact Information",
 *   description: "How can we reach you?",
 *   fields: [
 *     { propertyKey: "email", required: true },
 *     { propertyKey: "phone" },
 *   ],
 * };
 * ```
 */
export interface FormSection {
  /** Section title */
  title: string;

  /** Section description */
  description?: string;

  /** Fields in this section */
  fields: FormField[];
}

/**
 * Form view configuration
 *
 * Controls the display and behavior of form views.
 *
 * @example
 * ```typescript
 * const formOptions: FormOptions = {
 *   title: "Contact Us",
 *   description: "Fill out this form to get in touch",
 *   sections: [
 *     {
 *       title: "Personal Info",
 *       fields: [
 *         { propertyKey: "name", required: true },
 *         { propertyKey: "email", required: true },
 *       ],
 *     },
 *   ],
 *   submitButtonText: "Send Message",
 *   successMessage: "Thank you! We'll be in touch soon.",
 *   redirectAfterSubmit: "/thank-you",
 * };
 * ```
 */
export interface FormOptions {
  /** Form title */
  title: string;

  /** Form description */
  description?: string;

  /** Form sections containing fields */
  sections: FormSection[];

  /** Custom text for submit button */
  submitButtonText?: string;

  /** Message to show after successful submission */
  successMessage?: string;

  /** URL to redirect to after submission */
  redirectAfterSubmit?: string;
}

/**
 * Union of all view options
 *
 * Type-safe union representing any valid view option configuration.
 * Use this type when working with generic view configurations.
 *
 * @example
 * ```typescript
 * function configureView(options: ViewOptions) {
 *   // Handle any view option type
 * }
 * ```
 */
export type ViewOptions =
  | TableOptions
  | BoardOptions
  | ListOptions
  | TimelineOptions
  | CalendarOptions
  | GalleryOptions
  | MapOptions
  | ChartOptions
  | FeedOptions
  | FormOptions
  | Record<string, any>;
