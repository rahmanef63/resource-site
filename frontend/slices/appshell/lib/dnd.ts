"use client";

// Cross-app drag & drop seam. Sources attach makeDragProps(data) to anything
// draggable; every window's content area is a drop target that routes the
// typed payload to the target app's registered drop handler. Payloads ride a
// custom mime so native browser drags (file uploads) keep working untouched.

export const DND_MIME = "application/x-shell-payload";

export type DragData = { kind: string } & Record<string, unknown>;

type DropHandler = {
  accepts: (data: DragData) => boolean;
  onDrop: (data: DragData) => void;
};

const handlers = new Map<string, DropHandler[]>();

/** Register a drop handler for an app. Returns an unregister fn. */
export function registerDropHandler(appId: string, h: DropHandler): () => void {
  handlers.set(appId, [h, ...(handlers.get(appId) ?? [])]);
  return () => {
    handlers.set(appId, (handlers.get(appId) ?? []).filter((x) => x !== h));
  };
}

function handlerFor(appId: string, data: DragData): DropHandler | undefined {
  return (handlers.get(appId) ?? []).find((h) => {
    try {
      return h.accepts(data);
    } catch {
      return false;
    }
  });
}

export function appAccepts(appId: string, data: DragData): boolean {
  return !!handlerFor(appId, data);
}

/** Route a payload to an app's drop handler. Returns false when none claims it. */
export function deliverDrop(appId: string, data: DragData): boolean {
  const h = handlerFor(appId, data);
  if (!h) return false;
  h.onDrop(data);
  return true;
}

/** Spread these onto any element to make it a cross-app drag source.
 * `ghostLabel`, when given, swaps the browser's washed-out half-opacity
 * default drag snapshot for a small opaque pill (native OS drag proxies are
 * full-opacity, not a translucent DOM screenshot). The pill is built off-screen
 * so the browser can still rasterize it for setDragImage, then removed on the
 * next frame — dataTransfer.setDragImage snapshots synchronously during
 * dragstart, so the element only needs to exist for that one tick. */
export function makeDragProps(data: DragData, ghostLabel?: string): {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
} {
  return {
    draggable: true,
    onDragStart: (e) => {
      e.dataTransfer.setData(DND_MIME, JSON.stringify(data));
      e.dataTransfer.effectAllowed = "copy";
      if (ghostLabel) setDragGhost(e, ghostLabel);
    },
  };
}

function setDragGhost(e: React.DragEvent, label: string): void {
  if (typeof e.dataTransfer.setDragImage !== "function") return;
  const ghost = document.createElement("div");
  ghost.textContent = label;
  Object.assign(ghost.style, {
    position: "fixed",
    top: "-999px",
    left: "-999px",
    padding: "6px 12px",
    borderRadius: "8px",
    background: "color-mix(in oklab, var(--foreground) 85%, transparent)",
    color: "var(--background)",
    font: "600 12px var(--font-os, system-ui)",
    whiteSpace: "nowrap",
    boxShadow: "0 8px 20px -4px rgba(0,0,0,0.45)",
  });
  document.body.appendChild(ghost);
  e.dataTransfer.setDragImage(ghost, 14, 14);
  requestAnimationFrame(() => ghost.remove());
}

/** Parse a shell payload off a drag event (null for native/file drags). */
export function readDragData(e: React.DragEvent): DragData | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME);
    if (!raw) return null;
    const v = JSON.parse(raw) as DragData;
    return v && typeof v.kind === "string" ? v : null;
  } catch {
    return null;
  }
}

/** True while the drag carries a shell payload (dragover can't read data). */
export function dragCarriesPayload(e: React.DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes(DND_MIME);
}
