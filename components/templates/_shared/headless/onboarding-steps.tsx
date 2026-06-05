"use client";

// Step bodies for OnboardingWizard — split out to keep each file ≤200 lines.

import * as React from "react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ImageFieldComponent, OnboardingFields } from "./types";

type SetField = (k: keyof OnboardingFields, v: string) => void;

export function StepIdentity({ f, set }: { f: OnboardingFields; set: SetField }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Identitas situs</h1>
        <p className="text-sm text-muted-foreground">Bisa diganti kapan saja.</p>
      </div>
      <Field label="Nama situs / brand">
        <Input value={f.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="mis. Studio Saya" />
      </Field>
      <Field label="Tagline">
        <Input value={f.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="Satu kalimat tentang kamu" />
      </Field>
      <Field label="Nama pemilik">
        <Input value={f.ownerName} onChange={(e) => set("ownerName", e.target.value)} placeholder="Nama kamu" />
      </Field>
      <Field label="Email kontak">
        <Input type="email" value={f.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="halo@situ.kamu" />
      </Field>
    </div>
  );
}

export function StepBranding({
  f,
  set,
  ImageField,
}: {
  f: OnboardingFields;
  set: SetField;
  ImageField?: ImageFieldComponent;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Branding</h1>
        <p className="text-sm text-muted-foreground">Logo, favicon, warna — semua tersimpan di situs kamu.</p>
      </div>
      {ImageField ? (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Logo">
            {f.logoUrl ? <img src={f.logoUrl} alt="logo" className="mb-2 h-10 rounded object-contain" /> : null}
            <ImageField label="Upload logo" onUploaded={(u) => set("logoUrl", u)} />
          </Field>
          <Field label="Favicon">
            {f.faviconUrl ? <img src={f.faviconUrl} alt="favicon" className="mb-2 size-8 rounded object-contain" /> : null}
            <ImageField label="Upload favicon" onUploaded={(u) => set("faviconUrl", u)} />
          </Field>
        </div>
      ) : null}
      <Field label="Warna brand">
        <div className="flex items-center gap-2">
          <Input type="color" value={f.brandColor} onChange={(e) => set("brandColor", e.target.value)} className="h-10 w-16 p-1" />
          <Input value={f.brandColor} onChange={(e) => set("brandColor", e.target.value)} className="flex-1" />
        </div>
      </Field>
      <Field label="Tema default">
        <div className="flex gap-2">
          {["light", "dark", "system"].map((t) => (
            <Button key={t} type="button" variant={f.themeDefault === t ? "default" : "outline"} size="sm" className="flex-1" onClick={() => set("themeDefault", t)}>
              {t === "light" ? "Terang" : t === "dark" ? "Gelap" : "Sistem"}
            </Button>
          ))}
        </div>
      </Field>
      <Field label="Google Analytics ID (opsional)">
        <div className="flex items-center gap-2">
          <Input value={f.analyticsId} onChange={(e) => set("analyticsId", e.target.value)} placeholder="G-XXXXXXX" className="flex-1" />
          <a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" size="sm" className="gap-1 whitespace-nowrap">
              Dapatkan <ExternalLink className="size-3" />
            </Button>
          </a>
        </div>
      </Field>
    </div>
  );
}

export function StepContent({
  alreadySeeded,
  busy,
  onSeed,
}: {
  alreadySeeded: boolean;
  busy: boolean;
  onSeed: () => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Konten awal</h1>
        <p className="text-sm text-muted-foreground">Mulai dengan contoh, atau mulai kosong.</p>
      </div>
      <div className="rounded-lg border border-border/60 p-4">
        {alreadySeeded ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-4 text-primary" /> Konten contoh sudah terisi.
          </p>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Isi blog, portfolio, layanan, dan halaman depan dengan contoh biar langsung kelihatan.
            </p>
            <Button type="button" onClick={onSeed} disabled={busy} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : "Isi konten contoh"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function StepDone({ siteName }: { siteName: string }) {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold tracking-tight">Siap!</h1>
      <p className="text-sm text-muted-foreground">
        {siteName ? <><b>{siteName}</b> siap dikelola. </> : null}
        Klik selesai untuk masuk dashboard. Semua ini bisa kamu ubah lagi di menu Settings.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
