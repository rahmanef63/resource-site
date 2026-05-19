"use client";

import * as React from "react";
import {
  useChangelog,
  useFeatures,
  useLandingSections,
  usePosts,
  usePricing,
} from "../../shared/store";
import { renderLanding } from "./LandingRenderer";

/**
 * Composes the public landing page from admin-editable `landingSections`.
 * Order + visibility are owned by `/admin/landing`; per-kind copy lives
 * in the same store. Each kind renders via the canonical slice (R/S/T
 * waves) — see `LandingRenderer` for the mapping.
 *
 * Pre-AB-wave this file hard-coded the section order. Now it's data-driven
 * — admin can reorder, hide a section, or add new ones without code.
 */
export function HomePage() {
  const sections = useLandingSections();
  const features = useFeatures();
  const pricing = usePricing();
  const posts = usePosts();
  const changelog = useChangelog();

  const ordered = React.useMemo(
    () => [...sections].filter((s) => s.enabled).sort((a, b) => a.order - b.order),
    [sections],
  );

  return <>{ordered.map((s) => renderLanding(s, { features, pricing, posts, changelog }))}</>;
}
