"use client";

import * as React from "react";
import { Image as ImageIcon } from "lucide-react";
import { SlicePreviewLayout, PreviewSection, CodeBlock } from "@/components/slice-previews/preview-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * 8 motion primitives demo. The actual implementations live in
 * template-base/frontend/shared/ui/motion/ (framer-motion). Here we render
 * lightweight CSS-only mocks of each so the preview can stay framer-free.
 */

export default function Page() {
  return (
    <SlicePreviewLayout
      title="Motion Primitives (8)"
      kind="ui"
      description="Eight independently-importable motion components. Tree-shakeable."
      sourceUrl="https://github.com/rahmanef63/resource-site/tree/main/template-base/frontend/shared/ui/motion"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Tile title="Marquee" hint="Infinite scroll strip">
          <MarqueeMock />
        </Tile>
        <Tile title="KineticHeading" hint="Letter-by-letter reveal">
          <KineticMock />
        </Tile>
        <Tile title="Magnetic" hint="Cursor-pulled CTA">
          <MagneticMock />
        </Tile>
        <Tile title="CursorSpotlight" hint="Hover-reveal radial">
          <SpotlightMock />
        </Tile>
        <Tile title="StatCounter" hint="Count-up on view">
          <CounterMock />
        </Tile>
        <Tile title="ReadingProgress" hint="Scroll progress bar">
          <ReadingMock />
        </Tile>
        <Tile title="Grain" hint="Film-grain overlay">
          <GrainMock />
        </Tile>
        <Tile title="Lightbox" hint="Image gallery zoom">
          <LightboxMock />
        </Tile>
      </div>

      <PreviewSection title="Wiring" className="mt-6">
        <CodeBlock>{`import { Marquee, KineticHeading, Magnetic } from "@/features/motion-primitives";

<KineticHeading>Membangun masa depan</KineticHeading>
<Marquee items={logos} durationSec={40} />
<Magnetic><button>Click me</button></Magnetic>`}</CodeBlock>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function Tile({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b bg-muted/30 px-3 py-2">
        <div className="text-xs font-medium">{title}</div>
        <div className="text-[10px] text-muted-foreground">{hint}</div>
      </div>
      <div className="flex min-h-[140px] items-center justify-center p-4">{children}</div>
    </Card>
  );
}

function MarqueeMock() {
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

function KineticMock() {
  const text = "MASA DEPAN";
  return (
    <div className="text-2xl font-bold tracking-tight">
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="inline-block"
          style={{
            animation: `kRise 1.4s ${i * 60}ms cubic-bezier(.2,.7,.3,1) infinite`,
          }}
        >
          {ch === " " ? " " : ch}
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

function MagneticMock() {
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

function SpotlightMock() {
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

function CounterMock() {
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

function ReadingMock() {
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

function GrainMock() {
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

function LightboxMock() {
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
