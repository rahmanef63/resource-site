"use client";

import * as React from "react";
import {
  useContents,
  useLandingSections,
  useNewsletters,
} from "../../shared/store";
import { renderLanding } from "./LandingRenderer";

/**
 * Composes the public home from admin-editable `landingSections`.
 * Order + visibility + per-section copy are owned by /admin/landing;
 * BroadcastChannel sync makes edits appear here without a reload.
 *
 * Pre-AJ-wave this file hard-coded section order + uneditable copy.
 */
export function HomePage() {
  const sections = useLandingSections();
  const contents = useContents();
  const newsletters = useNewsletters();

  const ordered = React.useMemo(
    () => [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [sections],
  );

  return <>{ordered.map((s) => renderLanding(s, { contents, newsletters }))}</>;
}
