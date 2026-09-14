"use client";

import * as React from "react";
import type { AdminConsoleSection } from "../lib/sections";
import {
  normalizeActiveSection,
  readSectionFromSearch,
  sectionHref,
} from "../lib/section-core";

function readCurrent(): string | null {
  return typeof window === "undefined"
    ? null
    : readSectionFromSearch(window.location.search);
}

export function useAdminSection(visible: readonly AdminConsoleSection[]) {
  const signature = visible.map((section) => section.id).join(",");
  const [activeId, setActiveId] = React.useState(() =>
    normalizeActiveSection(visible, readCurrent()),
  );

  React.useEffect(() => {
    setActiveId((current) =>
      normalizeActiveSection(visible, readCurrent() ?? current),
    );
  }, [signature, visible]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onPop = () =>
      setActiveId(normalizeActiveSection(visible, readCurrent()));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [signature, visible]);

  const navigate = React.useCallback((id: string) => {
    setActiveId(id);
    if (typeof window === "undefined") return;
    window.history.pushState({}, "", sectionHref(window.location.href, id));
  }, []);

  return { activeId, navigate };
}
