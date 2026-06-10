// Agentic tool collection. Ctx = injectable bindings over the consumer's
// booking queries/mutations (bookings.view / bookings.cancel /
// bookings.reschedule gated server-side; the Cal.com webhook secret never
// reaches this layer).

import { defineToolCollection, noArgs, obj, str } from "@/shared/agentic";

export type CalComBookingCtx = {
  list: () => Promise<string>;
  /** Server-gated (bookings.cancel). */
  cancel: (bookingId: string) => Promise<string>;
  /** Server-gated (bookings.reschedule). */
  reschedule: (bookingId: string, startIso: string) => Promise<string>;
};

export const calComBookingTools = defineToolCollection<CalComBookingCtx>({
  namespace: "cal-com-booking",
  tools: [
    {
      name: "list",
      description: "List mirrored Cal.com bookings (server-gated: bookings.view).",
      parameters: noArgs,
      run: (ctx) => ctx.list(),
    },
    {
      name: "cancel",
      description: "Cancel a booking (server-gated: bookings.cancel). Outward-facing — confirm with the user first.",
      parameters: obj({ "bookingId!": str("booking id") }),
      run: (ctx, a) => ctx.cancel(a.bookingId as string),
    },
    {
      name: "reschedule",
      description: "Reschedule a booking to a new ISO start time (server-gated: bookings.reschedule).",
      parameters: obj({ "bookingId!": str("booking id"), "start!": str("new start time, ISO 8601") }),
      run: (ctx, a) => ctx.reschedule(a.bookingId as string, a.start as string),
    },
  ],
});
