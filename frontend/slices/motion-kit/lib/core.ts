export type RevealVariant = "fade-up" | "fade" | "fade-left" | "fade-right" | "zoom";

export type InViewOptions = IntersectionObserverInit & {
  once?: boolean;
};

export const DEFAULT_IN_VIEW: IntersectionObserverInit = {
  threshold: 0.12,
  rootMargin: "0px 0px -8% 0px",
};

export function observeInView(
  element: Element,
  onChange: (inView: boolean) => void,
  { once = true, ...init }: InViewOptions = {},
): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onChange(true);
    return () => undefined;
  }
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        onChange(true);
        if (once) observer.unobserve(entry.target);
      } else if (!once) {
        onChange(false);
      }
    }
  }, { ...DEFAULT_IN_VIEW, ...init });
  observer.observe(element);
  return () => observer.disconnect();
}

export function staggerDelay(index: number, step = 80, cap = 400): number {
  return Math.min(Math.max(index, 0) * Math.max(step, 0), Math.max(cap, 0));
}

export function easeOutCubic(progress: number): number {
  const t = Math.min(Math.max(progress, 0), 1);
  return 1 - Math.pow(1 - t, 3);
}

export function countAt(value: number, progress: number): number {
  return Math.round(value * easeOutCubic(progress));
}
