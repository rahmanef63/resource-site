/* Types, constants, and pure helpers for the HTML Studio — no React hooks live
   here. Extracted from app.tsx so each file stays <=200 LOC. */
import { Monitor, Tablet, Smartphone } from "lucide-react";

export type View = "code" | "split" | "preview";
export type Device = "full" | "tablet" | "phone";

// Device-width presets for the standalone preview (undefined = responsive).
export const DEVICE_W: Record<Device, number | undefined> = { full: undefined, tablet: 834, phone: 414 };
export const DEVICE_NEXT: Record<Device, Device> = { full: "tablet", tablet: "phone", phone: "full" };
export const DEVICE_ICON: Record<Device, typeof Monitor> = { full: Monitor, tablet: Tablet, phone: Smartphone };

// Below this container width the split view collapses to preview-only.
export const SPLIT_MIN = 720;

/** Sandbox flags for the render iframe. `allow-same-origin` is intentionally
 *  absent — adding it would collapse the sandbox to the host origin and defeat
 *  the whole boundary. Scripts run, but in a null/opaque origin, so the framed
 *  document cannot read the host's cookies / localStorage. `allow-modals` and
 *  `allow-downloads` are also withheld: a previewed page should not borrow the
 *  host address bar's trust for fake alert()/confirm() dialogs or drive-by
 *  downloads. Links / forms / popups stay. This is the security boundary —
 *  keep it intact wherever the HTML renders. */
export const HTML_SANDBOX = "allow-scripts allow-forms allow-popups allow-presentation";

// Seed document — a self-contained, interactive page so the editor + live
// sandboxed preview are alive the moment the slice mounts.
export const STARTER = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hello</title>
    <style>
      body { margin: 0; height: 100vh; display: grid; place-items: center;
             font-family: system-ui, sans-serif; background: #0b0b12; color: #fafafa; }
      h1 { font-size: clamp(2rem, 8vw, 4rem); cursor: pointer;
           background: linear-gradient(90deg, #a78bfa, #f472b6);
           -webkit-background-clip: text; background-clip: text; color: transparent; }
    </style>
  </head>
  <body>
    <h1 id="t">Hello, world</h1>
    <script>
      document.getElementById("t").addEventListener("click", () => {
        document.getElementById("t").textContent = "It runs! " + new Date().toLocaleTimeString();
      });
    </script>
  </body>
</html>
`;

/** Would-be public address for a saved page. The host serves /p/<slug>; in the
 *  standalone catalog this is just a copyable string (no navigation). */
export function shareUrl(slug: string): string {
  const base = typeof location !== "undefined" ? location.origin : "";
  return `${base}/p/${slug}`;
}

/** Tiny className joiner — keeps the slice self-contained (no shared util). */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Pull an initial slug out of an appshell launch payload, if any. */
export function payloadSlug(payload: unknown): string | null {
  if (payload && typeof payload === "object") {
    const s = (payload as { slug?: unknown }).slug;
    if (typeof s === "string" && s) return s;
  }
  return null;
}
