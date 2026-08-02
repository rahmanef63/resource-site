"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type Mobile = "drawer-bottom" | "drawer-right";
export type Variant = "modal" | "panel" | "alert";

export function Frame({ viewport, children }: { viewport: "mobile" | "desktop"; children: React.ReactNode }) {
  return (
    <div className="flex justify-center rounded-lg border bg-muted/20 p-6">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border bg-background shadow-xl",
          viewport === "mobile" ? "h-[520px] w-[320px]" : "h-[420px] w-full max-w-3xl",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PageMock() {
  return (
    <div className="space-y-3 p-5">
      <div className="h-3 w-32 rounded bg-muted" />
      <div className="space-y-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-2 w-full rounded bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 rounded-md bg-muted" />
        <div className="h-16 rounded-md bg-muted" />
      </div>
    </div>
  );
}

export function Dialog({
  viewport, variant, mobile, onClose,
}: {
  viewport: "mobile" | "desktop";
  variant: Variant;
  mobile: Mobile;
  onClose: () => void;
}) {
  const isMobile = viewport === "mobile";
  const isSheet = isMobile;
  const sheetBottom = isMobile && mobile === "drawer-bottom";
  const sheetRight = isMobile && mobile === "drawer-right";

  return (
    <>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={cn(
          "absolute z-10 flex flex-col bg-background shadow-2xl",
          !isSheet && "left-1/2 top-1/2 w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-lg",
          sheetBottom && "inset-x-0 bottom-0 rounded-t-2xl",
          sheetRight && "inset-y-0 right-0 w-[260px]",
          variant === "alert" && !isSheet && "w-[400px]",
          variant === "panel" && !isSheet && "left-auto right-0 top-0 h-full w-[380px] translate-y-0 translate-x-0 rounded-l-lg",
        )}
      >
        <header className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">
            {variant === "alert" ? "Hapus item?" : variant === "panel" ? "Pengaturan" : "Konfirmasi"}
          </div>
          <Button variant="ghost" size="icon" type="button" onClick={onClose} className="size-auto p-0 text-muted-foreground hover:bg-transparent hover:text-foreground">
            <X className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex-1 space-y-2 p-4 text-sm text-muted-foreground">
          <p>
            {variant === "alert"
              ? "Tindakan ini tidak bisa dibatalkan. Item akan dihapus permanen."
              : variant === "panel"
                ? "Atur preferensi tampilan, akun, dan integrasi di sini."
                : "Lanjutkan dengan operasi ini? Klik OK untuk konfirmasi."}
          </p>
        </div>
        <footer className="flex justify-end gap-2 border-t px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>Batal</Button>
          <Button size="sm" variant={variant === "alert" ? "destructive" : "default"} onClick={onClose}>
            {variant === "alert" ? "Hapus" : "OK"}
          </Button>
        </footer>
      </div>
    </>
  );
}

export function Seg({
  label, value, options, onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="inline-flex rounded-md border border-input p-0.5">
        {options.map((o) => (
          <Button
            key={o}
            variant="ghost"
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "h-auto rounded px-2 py-0.5 text-[10px] capitalize transition",
              value === o ? "bg-accent font-medium" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function VariantCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-md border p-3">
      <Badge variant="outline" className="font-mono text-[10px]">{title}</Badge>
      <p className="mt-2 text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
