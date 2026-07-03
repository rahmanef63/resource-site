"use client";

import * as React from "react";
import { ExternalLink, QrCode, Wallet, Building2, ShieldCheck } from "lucide-react";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Provider = "doku" | "midtrans";

const ORDER_ID = "ord_demo_1234";
const IDR = "Rp 250.000";

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      onClick={onClick}
      className={cn("rounded-full text-xs", !active && "text-muted-foreground")}
    >
      {label}
    </Button>
  );
}

function ChannelCard({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <Card className="flex items-center gap-2 p-3 text-xs">
      {icon}
      {label}
    </Card>
  );
}

export default function Page() {
  const [provider, setProvider] = React.useState<Provider>("doku");

  return (
    <SlicePreviewLayout
      title="Payment — DOKU · Midtrans"
      kind="full"
      description="Two Indonesia PSP variants over one shared backend (convex/features/payment, provider-discriminated). Pick a provider — same paymentOrders table, different gateway."
    >
      <PreviewSection title="Provider" hint="npx rr add payment doku | midtrans">
        <div className="flex flex-wrap gap-2">
          <Chip active={provider === "doku"} onClick={() => setProvider("doku")} label="DOKU (Hosted + Direct)" />
          <Chip active={provider === "midtrans"} onClick={() => setProvider("midtrans")} label="Midtrans (Snap)" />
        </div>
      </PreviewSection>

      <PreviewSection title="What the user sees">
        <div className="rounded-md border bg-background p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Order</div>
              <div className="font-mono text-xs">{ORDER_ID}</div>
            </div>
            <div className="text-xl font-bold tabular-nums">{IDR}</div>
          </div>

          {provider === "doku" ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Hosted Checkout (all channels) or Direct (single channel → VA number / QRIS / e-wallet deeplink).
                HMAC-SHA256 signed REST, server-side only.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                <ChannelCard label="Virtual Account" icon={<Building2 className="h-4 w-4" />} />
                <ChannelCard label="QRIS" icon={<QrCode className="h-4 w-4" />} />
                <ChannelCard label="GoPay / OVO / Dana" icon={<Wallet className="h-4 w-4" />} />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <p className="flex-1 text-xs text-muted-foreground">
                  Snap.js loads from the Midtrans CDN with your client key and calls{" "}
                  <code className="rounded bg-muted px-1 py-0.5">window.snap.pay(token)</code> to open a hosted modal.
                </p>
                <Button className="gap-2">
                  Bayar dengan Snap <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <ChannelCard label="QRIS" icon={<QrCode className="h-4 w-4" />} />
                <ChannelCard label="e-Wallets" icon={<Wallet className="h-4 w-4" />} />
                <ChannelCard label="Bank VA" icon={<Building2 className="h-4 w-4" />} />
              </div>
            </div>
          )}
        </div>
      </PreviewSection>

      <PreviewSection title="Shared backend trail" hint="one paymentOrders row per order, provider column">
        <Card className="p-3 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
            <Badge variant="outline" className="font-mono text-[10px]">paymentOrders</Badge>
            <span className="font-mono text-muted-foreground">
              {`{ orderId: "${ORDER_ID}", provider: "${provider}", amount: 250000, status: "pending" }`}
            </span>
          </div>
          <p className="mt-2 text-muted-foreground">
            Webhook verifies the gateway signature → patches status → paymentWebhookEvents logs it. Same tables both providers.
          </p>
        </Card>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
