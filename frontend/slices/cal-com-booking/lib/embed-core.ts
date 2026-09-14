export const DEFAULT_CAL_ORIGIN = "https://app.cal.com";

export type CalEmbedConfig = Record<string, string | boolean | number>;

export type CalInlineMountOptions = {
  calLink: string;
  calOrigin?: string;
  config?: CalEmbedConfig;
};

type CalApi = (action: "inline", options: Record<string, unknown>) => void;

function getCalApi(win: Window): CalApi | undefined {
  const value: unknown = Reflect.get(win, "Cal");
  return typeof value === "function" ? (value as CalApi) : undefined;
}

export function normalizeCalLink(value?: string | null): string | null {
  const link = value?.trim().replace(/^\/+|\/+$/g, "");
  return link || null;
}

export function normalizeCalOrigin(value?: string | null): string {
  const raw = value?.trim() || DEFAULT_CAL_ORIGIN;
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Cal.com origin must use http or https.");
  }
  return url.origin;
}

export function calEmbedScriptUrl(origin?: string | null): string {
  return `${normalizeCalOrigin(origin)}/embed/embed.js`;
}

function waitForScript(script: HTMLScriptElement, win: Window): Promise<CalApi> {
  const current = getCalApi(win);
  if (current) return Promise.resolve(current);
  if (script.dataset.rrCalLoaded === "true") {
    return Promise.reject(new Error("Cal.com embed script loaded without exposing window.Cal."));
  }
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
    const onLoad = () => {
      script.dataset.rrCalLoaded = "true";
      cleanup();
      const cal = getCalApi(win);
      cal ? resolve(cal) : reject(new Error("Cal.com embed API is unavailable."));
    };
    const onError = () => {
      cleanup();
      reject(new Error("Cal.com embed script failed to load."));
    };
    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });
  });
}

export async function loadCalEmbed(doc: Document, origin?: string | null): Promise<CalApi> {
  const win = doc.defaultView;
  if (!win) throw new Error("Cal.com embed requires a browser document.");
  const current = getCalApi(win);
  if (current) return current;

  const src = calEmbedScriptUrl(origin);
  const existing = [...doc.scripts].find((script) => script.dataset.rrCalSrc === src);
  if (existing) return waitForScript(existing, win);

  const script = doc.createElement("script");
  script.src = src;
  script.async = true;
  script.dataset.rrCalSrc = src;
  const ready = waitForScript(script, win);
  doc.head.appendChild(script);
  return ready;
}

export async function mountCalInline(
  element: HTMLElement,
  options: CalInlineMountOptions,
): Promise<() => void> {
  const calLink = normalizeCalLink(options.calLink);
  if (!calLink) throw new Error("Cal.com calLink is required.");
  const calOrigin = normalizeCalOrigin(options.calOrigin);
  const cal = await loadCalEmbed(element.ownerDocument, calOrigin);
  cal("inline", {
    elementOrSelector: element,
    calLink,
    calOrigin,
    config: options.config ?? { layout: "month_view" },
  });
  return () => element.replaceChildren();
}
