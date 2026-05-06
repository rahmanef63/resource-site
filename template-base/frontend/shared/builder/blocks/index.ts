/**
 * Canonical reusable builder blocks surface.
 */

export * from "./shared";

export { ActivityBlock, type ActivityBlockProps, type ActivityItem, type ActivityType } from "./Activity";
export { AgentBlock, type AgentBlockProps } from "./Agent";
export { CalendarBlock, type CalendarBlockProps } from "./Calendar";
export { ChartBlock, type ChartBlockProps, type ChartDataPoint, type ChartType } from "./Chart";
export { CommentBlock, type CommentBlockProps, type CommentItem } from "./Comment";
export { EventsBlock, type EventsBlockProps, type EventItem, type EventUrgency } from "./Events";
export { FileBlock, type FileBlockProps, type FileItem } from "./File";
export { FilterBlock, type FilterBlockProps, type FilterField } from "./Filter";
export { FooterBlock, type FooterBlockProps, type FooterColumn } from "./Footer";
export { FormBlock, type FormBlockProps, type FormField } from "./Form";
export { KanbanBlock, type KanbanBlockProps, type KanbanColumn, type KanbanItem } from "./Kanban";
export { ListBlock, type ListBlockProps, type ListItem, type ListItemType } from "./List";
export { MediaBlock, type MediaBlockProps } from "./Media";
export { MetricCardBlock, type MetricCardBlockProps } from "./Metric";
export { NavbarBlock, type NavbarBlockProps, type NavbarLink } from "./Navbar";
export { PricingCardBlock, type PricingCardBlockProps } from "./PricingCard";
export { ProfileBlock, type ProfileBlockProps, type ProfileAction } from "./Profile";
export { RichTextBlock, type RichTextBlockProps } from "./RichText";
export { StatsBlock, type StatsBlockProps, type StatItem } from "./Stats";
export { TableBlock, type TableBlockProps } from "./Table";
export { TeamBlock, type TeamBlockProps } from "./Team";
export { TestimonialBlock, type TestimonialBlockProps } from "./Testimonial";
export { TimeRangeBlock, type TimeRangeBlockProps, type TimeRange } from "./TimeRange";

export * from "./registry";
export * from "./utils/blockFactory";
export { createBlock } from "./utils/blockFactory";

