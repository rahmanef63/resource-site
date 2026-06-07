// scanner — the canonical DOM scan, run inside the page. Output is byte-for-byte
// the os-vps runtime /elements shape (ScannedElement), so an agent can read the
// page through EITHER the runtime or this extension and act on the same selectors.
import type { ScannedElement } from "../../browser-protocol/src/index";

const INTERACTIVE =
  "a,button,input,textarea,select,[role=button],[role=link],[onclick],[contenteditable=true]";

/** Build a stable selector candidate: #id → [data-testid] → [name] → nth path. */
function selectorFor(el: Element): string {
  const e = el as HTMLElement;
  if (e.id) return `#${CSS.escape(e.id)}`;
  const tid = e.getAttribute("data-testid");
  if (tid) return `[data-testid="${tid}"]`;
  const name = e.getAttribute("name");
  if (name) return `${e.tagName.toLowerCase()}[name="${name}"]`;
  const parts: string[] = [];
  let n: Element | null = e;
  for (let d = 0; n && n.nodeType === 1 && d < 5 && n.tagName !== "BODY"; d++) {
    const t = n.tagName.toLowerCase();
    const sibs = Array.from(n.parentNode?.children ?? []).filter((c) => c.tagName === n!.tagName);
    parts.unshift(`${t}:nth-of-type(${sibs.indexOf(n) + 1})`);
    n = n.parentElement;
  }
  return parts.join(" > ");
}

/** Scan visible interactive elements, capped to keep the payload small. */
export function scanElements(max = 200): ScannedElement[] {
  const out: ScannedElement[] = [];
  for (const el of Array.from(document.querySelectorAll(INTERACTIVE))) {
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    if (r.bottom < 0 || r.top > window.innerHeight * 3) continue;
    const e = el as HTMLInputElement;
    out.push({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type") ?? undefined,
      role: el.getAttribute("role") ?? undefined,
      text: (e.innerText || e.value || e.placeholder || el.getAttribute("aria-label") || "").trim().slice(0, 120),
      href: el.getAttribute("href") ?? undefined,
      selector: selectorFor(el),
      box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    });
    if (out.length >= max) break;
  }
  return out;
}

/** Scan <form> fields grouped by form, for richer CRUD-form understanding. */
export function scanForms(): Array<{ selector: string; fields: ScannedElement[] }> {
  return Array.from(document.querySelectorAll("form")).map((form) => ({
    selector: selectorFor(form),
    fields: Array.from(form.querySelectorAll("input,textarea,select"))
      .map((f) => {
        const r = f.getBoundingClientRect();
        const e = f as HTMLInputElement;
        return {
          tag: f.tagName.toLowerCase(),
          type: f.getAttribute("type") ?? undefined,
          role: f.getAttribute("role") ?? undefined,
          text: (e.placeholder || f.getAttribute("name") || f.getAttribute("aria-label") || "").trim().slice(0, 120),
          selector: selectorFor(f),
          box: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        } as ScannedElement;
      }),
  }));
}
