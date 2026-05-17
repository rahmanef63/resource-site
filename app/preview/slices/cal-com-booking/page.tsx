"use client";

import * as React from "react";
import { CalendarDays, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock, FlowDiagram } from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SLOTS = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum"];

export default function Page() {
  const [selectedDay, setSelectedDay] = React.useState(2);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>("10:00");

  return (
    <SlicePreviewLayout
      title="Cal.com Booking"
      kind="full"
      description="Embedded Cal.com widget + webhook mirror ke Convex. Status update real-time saat booking baru masuk."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/cal-com-booking"
    >
      <PreviewSection title="Booking widget — mock">
        <Card className="mx-auto max-w-2xl overflow-hidden p-0">
          <div className="grid gap-0 md:grid-cols-[200px_1fr_180px]">
            <div className="border-r bg-muted/20 p-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-foreground" />
                <div>
                  <div className="text-xs font-medium">Rahman</div>
                  <div className="text-[10px] text-muted-foreground">Konsultan</div>
                </div>
              </div>
              <h3 className="mt-3 text-sm font-semibold">Diskusi 30 menit</h3>
              <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> 30 min</div>
                <div className="flex items-center gap-1.5"><CalendarDays className="h-3 w-3" /> Google Meet</div>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Diskusi awal untuk roadmap produk Anda. Free.
              </p>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <Button variant="ghost" size="icon" type="button" className="size-auto rounded p-1 hover:bg-accent">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs font-medium">Mei 2026</span>
                <Button variant="ghost" size="icon" type="button" className="size-auto rounded p-1 hover:bg-accent">
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {DAYS.map((d, i) => (
                  <Button
                    key={d}
                    variant="outline"
                    type="button"
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      "flex h-auto flex-col items-center rounded-md p-1.5 text-[10px]",
                      selectedDay === i ? "border-foreground bg-accent" : "hover:bg-accent/50",
                    )}
                  >
                    <span className="text-muted-foreground">{d}</span>
                    <span className="text-sm font-medium">{11 + i}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="border-l bg-muted/10 p-4">
              <div className="text-xs font-medium">Senin, 13 Mei</div>
              <div className="mt-2 space-y-1">
                {SLOTS.map((s) => (
                  <Button
                    key={s}
                    variant="outline"
                    type="button"
                    onClick={() => setSelectedSlot(s)}
                    className={cn(
                      "h-auto w-full rounded-md px-2 py-1 text-center text-[11px]",
                      selectedSlot === s ? "border-foreground bg-foreground text-background" : "hover:bg-accent",
                    )}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-2 text-xs">
            <span className="text-muted-foreground">
              Powered by <span className="font-mono">cal.com</span>
            </span>
            <Button size="sm" disabled={!selectedSlot}>
              {selectedSlot ? `Book ${selectedSlot}` : "Pick a time"}
            </Button>
          </div>
        </Card>
      </PreviewSection>

      <PreviewSection title="Webhook → Convex">
        <FlowDiagram
          steps={[
            { title: "User books", detail: "Cal.com widget submit" },
            { title: "Webhook POST", detail: "POST /webhooks/cal-com (Convex httpAction)" },
            { title: "Verify HMAC", detail: "X-Cal-Signature-256 vs CALCOM_WEBHOOK_SECRET" },
            { title: "Upsert booking", detail: "Convex db.insert + reactive UI refresh" },
          ]}
        />
      </PreviewSection>

      <PreviewSection title="Status table">
        <div className="grid gap-2 text-xs sm:grid-cols-3">
          <StatCard label="Total bookings" value="142" />
          <StatCard label="This week" value="8" />
          <StatCard label="No-shows (30d)" value="3" tone="warn" />
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// app/(public)/booking/page.tsx
import { getCalApi } from "@calcom/embed-react";
useEffect(() => {
  (async () => {
    const cal = await getCalApi();
    cal("ui", { theme: "light" });
  })();
}, []);
<Cal calLink={\`\${process.env.NEXT_PUBLIC_CALCOM_USERNAME}/diskusi-30m\`} />

// convex/features/bookings/webhook.ts
export const calComWebhook = httpAction(async (ctx, req) => {
  // verify X-Cal-Signature-256 with CALCOM_WEBHOOK_SECRET
  const { triggerEvent, payload } = await req.json();
  if (triggerEvent === "BOOKING_CREATED") {
    await ctx.runMutation(internal.features.bookings.mutations.create, payload);
  }
});`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warn";
}) {
  return (
    <Card className="p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-1 font-mono text-xl font-bold tabular-nums", tone === "warn" && "text-amber-600")}>
        {value}
      </div>
    </Card>
  );
}
