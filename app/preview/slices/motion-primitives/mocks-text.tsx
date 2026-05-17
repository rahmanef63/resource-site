"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

export function MarqueeMock() {
  const items = ["Convex", "Next.js", "Tailwind", "shadcn", "Resend", "Cal.com", "DOKU", "Midtrans"];
  return (
    <div className="w-full overflow-hidden">
      <div className="flex gap-6 animate-[marquee_18s_linear_infinite]">
        {[...items, ...items].map((s, i) => (
          <span key={i} className="whitespace-nowrap text-xs font-medium text-muted-foreground">
            {s} ·
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

export function KineticMock() {
  const text = "MASA DEPAN";
  return (
    <div className="text-2xl font-bold tracking-tight">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{ animation: `kRise 1.4s ${i * 60}ms cubic-bezier(.2,.7,.3,1) infinite` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
      <style jsx>{`
        @keyframes kRise {
          0% { transform: translateY(0.3em); opacity: 0; }
          30% { transform: translateY(0); opacity: 1; }
          70% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-0.2em); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function MagneticMock() {
  const ref = React.useRef<HTMLButtonElement>(null);
  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.3}px, ${dy * 0.3}px)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }
  return (
    <div className="flex h-32 w-full items-center justify-center" onMouseMove={onMove} onMouseLeave={reset}>
      <Button
        ref={ref}
        type="button"
        className="h-auto rounded-full bg-foreground px-6 py-2.5 text-xs font-medium text-background transition-transform hover:bg-foreground/90"
      >
        Hover me
      </Button>
    </div>
  );
}

export function SpotlightMock() {
  const [pos, setPos] = React.useState({ x: 50, y: 50 });
  return (
    <div
      className="relative h-32 w-full overflow-hidden rounded-md border bg-muted/30"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
        Move cursor inside
      </div>
      <div
        className="pointer-events-none absolute inset-0 transition-opacity"
        style={{
          background: `radial-gradient(200px circle at ${pos.x}% ${pos.y}%, rgba(255,255,255,0.18), transparent 70%)`,
        }}
      />
    </div>
  );
}
