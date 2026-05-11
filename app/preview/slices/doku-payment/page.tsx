"use client";

import * as React from "react";
import { Copy, Check, ExternalLink, QrCode, Wallet, Building2 } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Mode = "checkout" | "direct-va" | "direct-qris" | "direct-ewallet";

const PRICE = 250_000;
const ORDER_ID = "ord_demo_1234";

export default function Page() {
  const [mode, setMode] = React.useState<Mode>("checkout");

  return (
    <SlicePreviewLayout
      title="DOKU — Indonesia Payment"
      kind="full"
      description="Two-mode payment: hosted Checkout or single-channel Direct. Same backend, same paymentOrders table."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/frontend/slices/doku-payment"
    >
      <PreviewSection title="Mode" hint="Pick how the customer pays">
        <div className="flex flex-wrap gap-2">
          <ModeChip active={mode === "checkout"} onClick={() => setMode("checkout")} label="Checkout (hosted)" />
          <ModeChip active={mode === "direct-va"} onClick={() => setMode("direct-va")} label="Direct — VA" />
          <ModeChip active={mode === "direct-qris"} onClick={() => setMode("direct-qris")} label="Direct — QRIS" />
          <ModeChip active={mode === "direct-ewallet"} onClick={() => setMode("direct-ewallet")} label="Direct — e-Wallet" />
        </div>
      </PreviewSection>

      <PreviewSection title="What the user sees">
        <div className="rounded-md border bg-background p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Order</div>
              <div className="font-mono text-xs">{ORDER_ID}</div>
            </div>
            <div className="text-xl font-bold tabular-nums">{formatIDR(PRICE)}</div>
          </div>

          {mode === "checkout" && <CheckoutView />}
          {mode === "direct-va" && <VaView />}
          {mode === "direct-qris" && <QrisView />}
          {mode === "direct-ewallet" && <EwalletView />}
        </div>
      </PreviewSection>

      <PreviewSection title="Backend trail" hint="paymentOrders row + webhook ack">
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <RowCard title="paymentOrders (pending)">
            <Row label="orderId">{ORDER_ID}</Row>
            <Row label="amount">250000 IDR</Row>
            <Row label="provider">doku</Row>
            <Row label="status">pending</Row>
            {mode === "checkout" && <Row label="checkoutUrl">https://sandbox.doku.com/p/eyJh…</Row>}
            {mode === "direct-va" && <Row label="vaNumber">8800 0012 3456 7890</Row>}
          </RowCard>
          <RowCard title="paymentWebhookEvents (on pay)">
            <Row label="provider">doku</Row>
            <Row label="eventType">SUCCESS</Row>
            <Row label="requestId">req_a8f7…</Row>
            <Row label="processed">true</Row>
          </RowCard>
        </div>
      </PreviewSection>

      <PreviewSection title="Wiring">
        <CodeBlock>{`// app/checkout/page.tsx
export { default } from "@/features/doku-payment/components/checkout-page";

// convex/http.ts
import { dokuWebhook } from "./features/payment/http";
http.route({ path: "/webhooks/doku", method: "POST", handler: dokuWebhook });`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function CheckoutView() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <p className="flex-1 text-xs text-muted-foreground">
        Klik tombol → redirect ke halaman DOKU yang menampilkan semua channel (VA / QRIS / e-Wallet / Kartu / PayLater / Minimarket).
      </p>
      <Button className="gap-2">
        Bayar dengan DOKU <ExternalLink className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

function VaView() {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Building2 className="h-3.5 w-3.5" /> BCA Virtual Account
      </div>
      <div className="flex items-center gap-3 rounded-md bg-muted/40 p-3">
        <div className="font-mono text-lg tracking-wider">8800 0012 3456 7890</div>
        <button
          onClick={() => {
            void navigator.clipboard.writeText("8800001234567890");
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="ml-auto inline-flex items-center gap-1 rounded border bg-background px-2 py-1 text-[10px]"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Berlaku 60 menit. Bayar via m-BCA / KlikBCA / ATM BCA.
      </p>
    </div>
  );
}

function QrisView() {
  return (
    <div className="flex items-start gap-4">
      <div className="grid h-32 w-32 grid-cols-8 gap-px rounded-md border bg-white p-1.5">
        {Array.from({ length: 64 }).map((_, i) => (
          <div key={i} className={cn("aspect-square", Math.random() > 0.5 ? "bg-black" : "bg-white")} />
        ))}
      </div>
      <div className="flex-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-medium text-foreground">
          <QrCode className="h-3.5 w-3.5" /> Scan QRIS
        </div>
        <p className="mt-1.5">
          Pakai aplikasi GoPay / OVO / Dana / ShopeePay / mobile banking. Status update otomatis lewat webhook.
        </p>
        <p className="mt-1.5 font-mono text-[10px]">Berlaku 30:00</p>
      </div>
    </div>
  );
}

function EwalletView() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Wallet className="h-3.5 w-3.5" /> GoPay
      </div>
      <Button className="w-full sm:w-auto">Buka aplikasi GoPay</Button>
      <Button variant="secondary" className="w-full sm:w-auto sm:ml-2">
        Bayar di browser
      </Button>
    </div>
  );
}

function ModeChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition",
        active ? "border-foreground bg-foreground text-background" : "border-input hover:bg-accent",
      )}
    >
      {label}
    </button>
  );
}

function RowCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-3">
      <Badge variant="outline" className="font-mono text-[10px]">{title}</Badge>
      <div className="mt-2 space-y-1">{children}</div>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{children}</span>
    </div>
  );
}

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}
