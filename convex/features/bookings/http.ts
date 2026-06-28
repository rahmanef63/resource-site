// Cal.com webhook handler — mirrors bookings into our `bookings` table.
//
// Signature spec (Cal.com Webhooks v1):
//   X-Cal-Signature-256: sha256=<hex>
//   payload = HMAC_SHA256(CALCOM_WEBHOOK_SECRET, request_body)
// Reference: https://cal.com/docs/core-features/webhooks
//
// Wire in convex/http.ts:
//   http.route({ path: "/webhooks/cal", method: "POST", handler: calWebhook });

import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { constantTimeEqual, hmacSha256Hex } from "../../_shared/crypto";

type CalEvent =
  | "BOOKING_CREATED"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "BOOKING_CONFIRMED";

type CalPayload = {
  triggerEvent: CalEvent;
  payload: {
    uid: string;
    title: string;
    startTime: string; // ISO
    endTime: string;
    attendees: Array<{ email: string; name?: string }>;
    status: string;
  };
};

export const calWebhook = httpAction(async (ctx, req) => {
  const secret = process.env.CALCOM_WEBHOOK_SECRET;
  if (!secret) return new Response("CALCOM_WEBHOOK_SECRET not configured", { status: 500 });

  const rawBody = await req.text();
  const signatureHeader = req.headers.get("x-cal-signature-256");
  if (!signatureHeader) return new Response("Missing signature header", { status: 401 });

  const provided = signatureHeader.startsWith("sha256=") ? signatureHeader.slice(7) : signatureHeader;
  const expected = await hmacSha256Hex(secret, rawBody);
  if (!constantTimeEqual(provided, expected)) {
    return new Response("Signature mismatch", { status: 401 });
  }

  let event: CalPayload;
  try {
    event = JSON.parse(rawBody) as CalPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const eventToStatus: Record<CalEvent, "confirmed" | "rescheduled" | "cancelled"> = {
    BOOKING_CREATED: "confirmed",
    BOOKING_CONFIRMED: "confirmed",
    BOOKING_RESCHEDULED: "rescheduled",
    BOOKING_CANCELLED: "cancelled",
  };
  const status = eventToStatus[event.triggerEvent] ?? "confirmed";
  const attendee = event.payload.attendees?.[0];

  await ctx.runMutation(internal.features.bookings.mutation.upsertFromWebhook, {
    calBookingId: event.payload.uid,
    title: event.payload.title,
    startsAt: new Date(event.payload.startTime).getTime(),
    endsAt: new Date(event.payload.endTime).getTime(),
    attendeeEmail: attendee?.email ?? "unknown@unknown",
    attendeeName: attendee?.name,
    status,
    rawPayload: event,
  });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
