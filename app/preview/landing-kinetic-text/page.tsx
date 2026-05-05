"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const HEADLINE = "We design space.";

const STAGGER_MS = { smooth: 36, snappy: 18, off: 0 };
const FONTS = { serif: "font-serif", sans: "font-sans", mono: "font-mono" };

export default function Page() { return <Suspense fallback={null}><Inner /></Suspense>; }

function Inner() {
  const p = useSearchParams();
  const stagger = (p.get("stagger") ?? "smooth") as keyof typeof STAGGER_MS;
  const fontKey = (p.get("font") ?? "serif") as keyof typeof FONTS;
  const magnetic = p.get("magnetic") !== "0";
  const marquee = p.get("marquee") !== "0";
  const gradient = p.get("gradient") !== "0";
  const noise = p.get("noise") === "1";
  const ms = STAGGER_MS[stagger];

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-50">
      {gradient && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_50%_30%,theme(colors.violet.500)_0,transparent_55%),radial-gradient(circle_at_70%_70%,theme(colors.amber.400)_0,transparent_55%)]"
        />
      )}
      {noise && (
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay [background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence baseFrequency=%221.5%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%221%22/></svg>')]" />
      )}
      <header className="relative flex items-center justify-between px-8 py-6 text-xs uppercase tracking-[0.3em]">
        <span className="font-semibold">studio · 04</span>
        <nav className="hidden gap-8 md:flex">
          <a href="#" className="opacity-70 hover:opacity-100">work</a>
          <a href="#" className="opacity-70 hover:opacity-100">about</a>
          <a href="#" className="opacity-70 hover:opacity-100">contact</a>
        </nav>
      </header>

      <section className="relative flex flex-1 flex-col justify-center px-8">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Atelier · 2026</p>
        <h1 className={`mt-6 ${FONTS[fontKey]} text-7xl font-light leading-[0.92] tracking-tight md:text-9xl`}>
          {HEADLINE.split("").map((ch, i) => (
            <span
              key={i}
              className={ms > 0 ? "inline-block animate-[rise_900ms_ease-out_forwards] opacity-0" : "inline-block"}
              style={ms > 0 ? { animationDelay: `${i * ms}ms` } : undefined}
            >
              {ch === " " ? " " : ch}
            </span>
          ))}
        </h1>
        <p className="mt-8 max-w-md text-sm text-zinc-400 md:text-base">
          Letter-stagger headings · Magnetic CTAs · Marquee strips. All
          motion respects <code className="text-zinc-200">prefers-reduced-motion</code>.
        </p>

        <div className="mt-10 flex items-center gap-4">
          {magnetic ? (
            <Magnetic>
              <button className="group rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-transform hover:scale-105">
                View work →
              </button>
            </Magnetic>
          ) : (
            <button className="rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 transition-transform hover:scale-105">
              View work →
            </button>
          )}
          <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">since 2018</span>
        </div>
      </section>

      {marquee && (
      <footer className="relative overflow-hidden border-t border-white/10 py-4">
        <div className="flex animate-[marquee_28s_linear_infinite] gap-12 whitespace-nowrap text-2xl font-light tracking-tight text-zinc-300">
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <span>Cesca</span>
              <span className="text-zinc-600">·</span>
              <span>Mahkota</span>
              <span className="text-zinc-600">·</span>
              <span>Lentera</span>
              <span className="text-zinc-600">·</span>
              <span>Beranda</span>
              <span className="text-zinc-600">·</span>
            </React.Fragment>
          ))}
        </div>
      </footer>
      )}

      <style>{`
        @keyframes rise {
          from { transform: translateY(40%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}

function Magnetic({ children, radius = 100 }: { children: React.ReactNode; radius?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [t, setT] = React.useState({ x: 0, y: 0 });
  return (
    <span
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d > radius) return setT({ x: 0, y: 0 });
        setT({ x: dx * 0.25, y: dy * 0.25 });
      }}
      onMouseLeave={() => setT({ x: 0, y: 0 })}
      style={{ transform: `translate(${t.x}px, ${t.y}px)`, transition: "transform 200ms cubic-bezier(.2,.7,.3,1)" }}
      className="inline-block"
    >
      {children}
    </span>
  );
}
