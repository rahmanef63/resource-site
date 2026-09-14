"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function useInView<T extends HTMLElement>() {
  const ref = React.useRef<T | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

export type RevealVariant = "fade-up" | "fade" | "fade-left" | "fade-right" | "zoom";

export function Reveal({ children, variant = "fade-up", delay = 0, className }: {
  children: React.ReactNode; variant?: RevealVariant; delay?: number; className?: string;
}) {
  const { ref, visible } = useInView<HTMLDivElement>();
  return <div ref={ref} data-reveal={variant} className={cn(visible && "is-inview", className)} style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}>{children}</div>;
}

export function Stagger({ children, step = 80, cap = 400, itemClassName }: {
  children: React.ReactNode; step?: number; cap?: number; itemClassName?: string;
}) {
  return <>{React.Children.toArray(children).map((child, index) => <Reveal key={index} delay={Math.min(index * step, cap)} className={itemClassName}>{child}</Reveal>)}</>;
}

export function CountUp({ value, locale = "id-ID" }: { value: number; locale?: string }) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = React.useState(0);
  React.useEffect(() => {
    if (!visible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDisplay(value); return; }
    let raf = 0; const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1200, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible, value]);
  return <span ref={ref}>{display.toLocaleString(locale)}</span>;
}

export function Marquee({ children, className, speed = 36 }: { children: React.ReactNode; className?: string; speed?: number }) {
  return <div className={cn("motion-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]", className)}><div className="motion-marquee-track flex w-max items-center gap-10" style={{ animationDuration: `${speed}s` }}><div className="flex shrink-0 items-center gap-10">{children}</div><div className="flex shrink-0 items-center gap-10" aria-hidden>{children}</div></div></div>;
}

export { useInView };
