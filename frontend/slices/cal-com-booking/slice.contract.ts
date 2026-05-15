/**
 * Slice contract for `cal-com-booking` — Phase A.
 *
 * Embedded Cal.com booking widget (React embed) + Convex HTTP webhook
 * receiver that mirrors bookings into a workspace-scoped table. Webhook
 * handler at `convex/features/bookings/http.ts` verifies HMAC via
 * CALCOM_WEBHOOK_SECRET. The slice owns the `cal_com_booking_*` namespace
 * per the 2026-05-12 prefix decision; existing consumer `bookings` tables
 * migrate via the notes in `slice.manifest.json`.
 */
import { defineSliceContract } from "../../../packages/cli/lib/contract";

export const contract = defineSliceContract({
  id: "cal-com-booking",
  version: "0.1.0",
  requires: {
    auth: "convex",
    rbac: ["bookings.view", "bookings.cancel", "bookings.reschedule"],
    env: ["NEXT_PUBLIC_CALCOM_USERNAME", "CALCOM_WEBHOOK_SECRET"],
    convex: {
      prefix: "cal_com_booking_",
      tables: ["cal_com_booking_bookings"],
    },
    deps: ["convex-auth"],
  },
  provides: {
    tables: ["cal_com_booking_bookings"],
    events: ["booking.created", "booking.rescheduled", "booking.cancelled"],
  },
  bidir: {
    syncPolicy: "manual",
    generalization: {
      level: "portable",
    },
  },
});
