export { default as Booking } from "./components/Booking.svelte";
export {
  bookingApi,
  configureBooking,
  type BookingAdapter,
  type BookingApi,
  type BookingRequest,
  type BookingRow,
  type BookingStatus,
} from "./lib/host";
export {
  isBookingDraftValid,
  normalizeBookingRequest,
  type BookingDraft,
} from "./lib/request";
export { bookingConfig } from "./config";
export type { BookingConfig } from "./config";

export type BookingAppDescriptor = {
  id: string;
  title: string;
  icon: "calendar-check";
  gradient: string;
  load: () => Promise<{ default: unknown }>;
  defaultSize: { w: number; h: number };
};

export const bookingApp: BookingAppDescriptor = {
  id: "booking",
  title: "Booking",
  icon: "calendar-check",
  gradient: "linear-gradient(160deg,#6366f1,#8b5cf6)",
  load: () => import("./components/Booking.svelte"),
  defaultSize: { w: 460, h: 600 },
};
