"use client";

import * as React from "react";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Midtrans — Indonesia Payment"
      kind="full"
      description="Snap (hosted-modal) checkout. All channels in one popup. Webhook updates paymentOrders via signature_key."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/midtrans-payment"
    >
      <PreviewSection title="Snap modal demo" hint="Single click → Midtrans popup">
        <div className="rounded-md border bg-background p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Order</div>
              <div className="font-mono text-xs">ord_demo_1234</div>
            </div>
            <div className="text-xl font-bold tabular-nums">Rp 250.000</div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-xs text-muted-foreground">
              Snap.js loads from Midtrans CDN with your client key. Calls{" "}
              <code className="rounded bg-muted px-1 py-0.5">window.snap.pay(token)</code> to open the modal.
            </p>
            <Button className="gap-2">
              Bayar dengan Snap <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <ChannelCard label="QRIS" />
          <ChannelCard label="GoPay / OVO / Dana" />
          <ChannelCard label="BCA / Mandiri / BRI VA" />
        </div>
      </PreviewSection>

      <PreviewSection title="Backend trail" hint="paymentOrders + webhook signature">
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <Card className="p-3">
            <Badge variant="outline" className="font-mono text-[10px]">paymentOrders (pending)</Badge>
            <div className="mt-2 space-y-1 text-[11px]">
              <Row k="orderId" v="ord_demo_1234" />
              <Row k="amount" v="250000 IDR" />
              <Row k="provider" v="midtrans" />
              <Row k="snapToken" v="d8ab1c4a-…" />
            </div>
          </Card>
          <Card className="p-3">
            <Badge variant="outline" className="font-mono text-[10px]">webhook signature</Badge>
            <div className="mt-2 space-y-1 text-[11px]">
              <Row k="algo" v="SHA512" />
              <Row k="input" v="order_id + status_code + gross_amount + serverKey" />
              <Row k="match" v={<span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3 text-emerald-500" /> ok</span>} />
              <Row k="status" v="settlement → paid" />
            </div>
          </Card>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// app/checkout/page.tsx
export { default } from "@/features/midtrans-payment/components/checkout-page";

// app/layout.tsx
<Script src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} />

// convex/http.ts
http.route({ path: "/webhooks/midtrans", method: "POST", handler: midtransWebhook });`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function ChannelCard({ label }: { label: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2 text-center text-xs">{label}</div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}
