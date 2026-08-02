"use client";

// Presentational pieces for SetupHealth — split out to keep each file ≤200
// lines. No data dependencies; safe to render anywhere.

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Circle, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Setup</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Status website kamu</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cek satu halaman: apa yang sudah jalan, apa yang masih kurang.
      </p>
      <Card className="mt-8 border-border/60">
        <CardContent className="divide-y divide-border/50 p-0">{children}</CardContent>
      </Card>
    </div>
  );
}

export function StepRow({
  state,
  title,
  children,
}: {
  state: "done" | "todo" | "warn";
  title: string;
  children: React.ReactNode;
}) {
  const Icon = state === "done" ? CheckCircle2 : state === "warn" ? AlertTriangle : Circle;
  const color = state === "done" ? "text-primary" : state === "warn" ? "text-amber-500" : "text-muted-foreground/50";
  return (
    <div className="flex gap-3 p-5">
      <Icon className={`mt-0.5 size-5 shrink-0 ${color}`} />
      <div className="flex flex-col gap-2">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </div>
  );
}

export function EnvBlock() {
  const text = "NEXT_PUBLIC_CONVEX_URL\nCONVEX_DEPLOY_KEY";
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="relative">
      <pre className="overflow-x-auto rounded-md border border-border/60 bg-muted/40 p-3 text-xs">
        <code>
          NEXT_PUBLIC_CONVEX_URL = https://NAMA.convex.cloud{"\n"}
          CONVEX_DEPLOY_KEY = (deploy key production)
        </code>
      </pre>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => {
          void navigator.clipboard?.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute right-2 top-2 size-7"
        aria-label="Salin nama variabel"
      >
        {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  );
}

export function HealthFooter({
  productName,
  coreVersion,
  adminPath,
}: {
  productName: string;
  coreVersion: string;
  adminPath: string;
}) {
  return (
    <p className="mt-6 text-center text-[11px] text-muted-foreground">
      {productName} v{coreVersion} ·{" "}
      <Link href="/" className="underline">ke situs</Link> ·{" "}
      <Link href={adminPath} className="underline">admin</Link>
    </p>
  );
}
