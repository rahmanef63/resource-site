export type MarqueeMode = "window" | "crossing";
export interface MarqueeRect { x: number; y: number; w: number; h: number; mode: MarqueeMode }

export interface MarqueeOptions {
  container: HTMLElement;
  itemSelector?: string;
  getItemId?: (element: HTMLElement) => string | undefined;
  onSelect: (ids: string[], additive: boolean, mode: MarqueeMode) => void;
  onDragStart?: (additive: boolean) => void;
  getBaseline?: () => string[];
  onRect?: (rect: MarqueeRect | null) => void;
  skipSelector?: string;
  autocad?: boolean;
}

const THRESHOLD = 4;
const INTERACTIVE = "input,textarea,button,a,select,[contenteditable='true'],[role='button'],[data-no-marquee]";

export const marqueeMode = (startX: number, currentX: number, autocad = true): MarqueeMode => {
  if (!autocad) return "crossing";
  return currentX < startX ? "crossing" : "window";
};

export const marqueeRect = (
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  autocad = true,
): MarqueeRect => ({
  x: Math.min(startX, currentX),
  y: Math.min(startY, currentY),
  w: Math.abs(currentX - startX),
  h: Math.abs(currentY - startY),
  mode: marqueeMode(startX, currentX, autocad),
});

export function attachMarquee(options: MarqueeOptions) {
  const itemSelector = options.itemSelector ?? "[data-selectable-id]";
  const getItemId = options.getItemId ?? ((element) => element.dataset.selectableId);
  let armed = false;
  let active = false;
  let additive = false;
  let startX = 0;
  let startY = 0;
  let baseline: string[] = [];
  const origin = () => options.container.getBoundingClientRect();

  const collect = (rect: MarqueeRect) => {
    const o = origin();
    const hits = new Set(baseline);
    options.container.querySelectorAll<HTMLElement>(itemSelector).forEach((element) => {
      const id = getItemId(element);
      if (!id) return;
      const bounds = element.getBoundingClientRect();
      const x = bounds.left - o.left + options.container.scrollLeft;
      const y = bounds.top - o.top + options.container.scrollTop;
      const intersects = x < rect.x + rect.w && x + bounds.width > rect.x
        && y < rect.y + rect.h && y + bounds.height > rect.y;
      if (!intersects) return;
      const enclosed = x >= rect.x && y >= rect.y
        && x + bounds.width <= rect.x + rect.w && y + bounds.height <= rect.y + rect.h;
      if (rect.mode === "window" ? enclosed : intersects) hits.add(id);
    });
    return [...hits];
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0 || event.pointerType === "touch") return;
    const target = event.target as HTMLElement;
    if (!options.container.contains(target) || target.closest(INTERACTIVE)) return;
    if (options.skipSelector && target.closest(options.skipSelector)) return;
    armed = true;
    active = false;
    additive = event.shiftKey || event.metaKey || event.ctrlKey;
    const o = origin();
    startX = event.clientX - o.left + options.container.scrollLeft;
    startY = event.clientY - o.top + options.container.scrollTop;
    baseline = additive && options.getBaseline ? options.getBaseline() : [];
  };

  const onMove = (event: PointerEvent) => {
    if (!armed) return;
    const o = origin();
    const x = event.clientX - o.left + options.container.scrollLeft;
    const y = event.clientY - o.top + options.container.scrollTop;
    if (!active) {
      if (Math.abs(x - startX) < THRESHOLD && Math.abs(y - startY) < THRESHOLD) return;
      active = true;
      options.onDragStart?.(additive);
    }
    const rect = marqueeRect(startX, startY, x, y, options.autocad ?? true);
    options.onRect?.(rect);
    options.onSelect(collect(rect), additive, rect.mode);
  };

  const onUp = () => {
    armed = false;
    active = false;
    options.onRect?.(null);
  };

  options.container.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  return () => {
    options.container.removeEventListener("pointerdown", onDown);
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
}
