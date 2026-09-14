"use client";

import { CalEmbed } from "@/features/cal-com-booking";
import {
  FlowDiagram,
  PreviewSection,
  SlicePreviewLayout,
} from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Cal.com Booking"
      kind="full"
      description="Real Cal embed contract + signed Convex webhook mirror. The public preview stays unconfigured so it never impersonates an account or creates a booking."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/cal-com-booking"
    >
      <PreviewSection title="Embed — explicit unconfigured state">
        <CalEmbed />
      </PreviewSection>

      <PreviewSection title="Runtime flow">
        <FlowDiagram
          steps={[
            { title: "Host passes calLink", detail: "team/event-type + optional calOrigin" },
            { title: "Cal embed mounts", detail: "React package or native Svelte vanilla loader" },
            { title: "Booking happens in Cal", detail: "Cal owns availability + attendee flow" },
            { title: "Signed webhook arrives", detail: "Convex HTTP action verifies the delivery" },
            { title: "Mirror upserts", detail: "Real Convex table: bookings" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Tool boundary">
        <Card className="p-4 text-sm text-muted-foreground">
          The bundled backend mirrors webhook events only. Agent tools for list, cancel, and reschedule are
          adapter contracts: bind them to your own authorized Cal API or server actions before exposing them.
        </Card>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
