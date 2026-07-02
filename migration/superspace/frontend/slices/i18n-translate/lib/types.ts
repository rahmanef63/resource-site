export type Lang = { code: string; label: string };

export type GoogleTranslateProps = {
  /** Source language of the page. Default `"id"`. */
  pageLanguage?: string;
  /** Available locales for the menu. Default `DEFAULT_LANGUAGES`. */
  languages?: Lang[];
  /**
   * localStorage key for persisting the user's language override. Scope
   * this per-project (e.g. `"my-app-lang"`) if you ship multiple apps on
   * the same eTLD+1 so each remembers its own choice. Default
   * `"google-translate-lang"`.
   */
  storageKey?: string;
  /** Trigger button className. Override for project-specific styling. */
  triggerClassName?: string;
  /** Dropdown menu className. */
  menuClassName?: string;
  /** Each menu item className. */
  itemClassName?: string;
  /** Additive className applied to the menu item that matches `current`. */
  activeItemClassName?: string;
  /** ARIA label prefix for the trigger button. Default `"Language:"`. */
  ariaLabelPrefix?: string;
  /**
   * Language-switch refresh strategy:
   *  - `"reload"`  → `window.location.reload()` after cookie set. DEFAULT.
   *                  Brief blink, 100% reliable.
   *  - `"router"`  → Next `router.refresh()`. Translation only applies on
   *                  the next hard reload — rarely the right choice.
   *  - `"none"`    → Best-effort programmatic dispatch on the hidden
   *                  combo, no reload. Fragile across Cache Components
   *                  and React re-renders.
   */
  fallbackRefresh?: "router" | "reload" | "none";
};

export type GoogleTranslateAPI = {
  TranslateElement: {
    new (
      opts: {
        pageLanguage: string;
        includedLanguages: string;
        autoDisplay?: boolean;
        layout?: number;
      },
      elementId: string,
    ): unknown;
    InlineLayout: { SIMPLE: number };
  };
};

declare global {
  interface Window {
    google?: { translate?: GoogleTranslateAPI };
    googleTranslateElementInit?: () => void;
  }
}
