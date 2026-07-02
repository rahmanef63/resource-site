import { SCRIPT_ID } from "./defaults";

function findCombo(): HTMLSelectElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLSelectElement>("select.goog-te-combo");
}

// Legacy DOM Level 2 event creation. Google's widget binds with
// `addEventListener("change", ...)` but its internal type-guard ignores
// events whose `isTrusted` is false AND whose class doesn't match
// `HTMLEvents` — the EventConstructor form (`new Event(...)`) produces a
// generic Event that fails the guard, silently dropping the dispatch.
// `document.createEvent("HTMLEvents") + initEvent` produces the legacy
// HTMLEvent the widget honours.
function fireLegacyEvent(el: Element, type: string): void {
  const evt = document.createEvent("HTMLEvents");
  evt.initEvent(type, true, true);
  el.dispatchEvent(evt);
}

function dispatchLang(lang: string, pageLang: string): boolean {
  const combo = findCombo();
  if (!combo) return false;
  // Google injects the <option> children AFTER the <select> itself mounts.
  // Setting combo.value before options exist is a silent no-op (the value
  // gets discarded) — treat empty-options as not-ready and retry.
  if (combo.options.length === 0) return false;
  // Empty string = "restore original" in Google's combo semantics.
  const target = lang === pageLang ? "" : lang;
  combo.value = target;
  // The widget's internal state machine drops the FIRST programmatic
  // dispatch on a freshly-populated combo; the second always takes.
  fireLegacyEvent(combo, "change");
  fireLegacyEvent(combo, "change");
  return true;
}

export async function applyWithRetry(
  lang: string,
  pageLang: string,
  maxMs: number,
): Promise<boolean> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    if (dispatchLang(lang, pageLang)) return true;
    await new Promise((r) => setTimeout(r, 50));
  }
  return false;
}

let scriptLoadingFor: string | null = null;
let initCallbacks: Array<() => void> = [];

export function ensureScript(
  pageLang: string,
  includedCodes: string,
  mountId: string,
  onReady: () => void,
): void {
  if (typeof document === "undefined") return;

  // Already mounted at a different id — just fire onReady once the
  // existing combo is reachable. The retry loop in setLang tolerates a
  // brief delay.
  if (document.getElementById(SCRIPT_ID)) {
    setTimeout(onReady, 0);
    return;
  }

  // Already loading from another instance on the same page — queue.
  if (scriptLoadingFor === pageLang) {
    initCallbacks.push(onReady);
    return;
  }
  scriptLoadingFor = pageLang;
  initCallbacks.push(onReady);

  window.googleTranslateElementInit = () => {
    const g = window.google?.translate;
    if (!g?.TranslateElement) return;
    // eslint-disable-next-line no-new
    new g.TranslateElement(
      {
        pageLanguage: pageLang,
        includedLanguages: includedCodes,
        autoDisplay: false,
        layout: g.TranslateElement.InlineLayout.SIMPLE,
      },
      mountId,
    );
    const fired = initCallbacks;
    initCallbacks = [];
    fired.forEach((cb) => cb());
  };

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.body.appendChild(s);
}
