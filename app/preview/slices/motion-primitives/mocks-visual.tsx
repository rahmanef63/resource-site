"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CounterMock() {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    let raf = 0;
    let start = 0;
    const target = 12_847;
    const dur = 1500;
    function tick(t: number) {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => { start = 0; setN(0); raf = requestAnimationFrame(tick); }, 1200);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="text-center">
      <div className="font-mono text-3xl font-bold tabular-nums">{n.toLocaleString("id-ID")}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">pageviews</div>
    </div>
  );
}

export function ReadingMock() {
  const [p, setP] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setP((x) => (x >= 100 ? 0 : x + 1)), 60);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="w-full space-y-3">
      <div className="h-1 w-full overflow-hidden rounded bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${p}%` }} />
      </div>
      <div className="space-y-1">
        <div className="h-2 w-full rounded bg-muted" />
        <div className="h-2 w-4/5 rounded bg-muted" />
        <div className="h-2 w-3/5 rounded bg-muted" />
      </div>
      <div className="text-right font-mono text-[10px] text-muted-foreground">{p}%</div>
    </div>
  );
}

export function GrainMock() {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-md bg-gradient-to-br from-amber-200 to-rose-300">
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs text-foreground/70">
        film-grain overlay
      </div>
    </div>
  );
}

export function LightboxMock() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative h-32 w-full">
      <Button
        variant="outline"
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-full w-full items-center justify-center rounded-md bg-gradient-to-br from-sky-100 to-indigo-100 text-xs text-muted-foreground"
      >
        <ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Click to zoom
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setOpen(false)}
        >
          <div className="relative aspect-video w-full max-w-3xl rounded-lg bg-gradient-to-br from-sky-200 to-indigo-300" />
          <div className="absolute bottom-6 text-xs text-white/70">Click anywhere to close</div>
        </div>
      )}
    </div>
  );
}
