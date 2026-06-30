// audit-allow-hex: the dock-icon gradient is the app's brand mark (appshell
// AppDescriptor contract), not themable chrome.
import { CalendarCheck } from "lucide-react";
import type { AppDescriptor } from "./lib/host";

// Public barrel — consumers import ONLY from here.
//   1. <Booking /> — mount directly; unwired it runs on an in-memory mock store
//      so the form + owner inbox are interactive with zero backend.
//   2. `bookingApp` — appshell-style descriptor (lazy `load`) for hosts that
//      mount apps via a dock/launcher manifest.
export { default as Booking } from "./app";

export const bookingApp: AppDescriptor = {
  id: "booking",
  title: "Booking",
  icon: CalendarCheck,
  gradient: "linear-gradient(160deg,#6366f1,#8b5cf6)",
  load: () => import("./app"),
  defaultSize: { w: 460, h: 600 },
};

// Host wiring seam (real backend: submit + owner inbox).
export { configureBooking } from "./lib/host";
export type {
  BookingAdapter,
  BookingRequest,
  BookingRow,
  BookingStatus,
  AppDescriptor,
} from "./lib/host";

export { bookingConfig } from "./config";
export type { BookingConfig } from "./config";
