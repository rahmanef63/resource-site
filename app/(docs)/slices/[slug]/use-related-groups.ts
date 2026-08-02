"use client";

import * as React from "react";
import { slices, getSlice } from "@/lib/content/slices";
import { RELATED_ICONS, type RelatedGroup } from "@/components/site/related-features";
import type { SliceEntry } from "@/lib/content/slices";

/** Build peer/enhances/siblings RelatedGroups CLIENT-side so the
 *  LucideIcon function refs never cross the server→client boundary
 *  (Next.js bans passing functions to client components without
 *  "use server"). Reads from the imported `slices` array directly. */
export function useRelatedGroups(slice: SliceEntry): RelatedGroup[] {
  return React.useMemo(() => {
    const peerSlices = (slice.peers ?? [])
      .map((p) => ({ peer: p, target: getSlice(p.slug) }))
      .filter((x): x is { peer: typeof x.peer; target: NonNullable<typeof x.target> } => !!x.target);

    const enhancesItems = (slice.compat?.enhances ?? [])
      .map((s) => getSlice(s))
      .filter((s): s is NonNullable<typeof s> => !!s);

    const siblingItems = slices
      .filter((s) => s.slug !== slice.slug && s.category === slice.category)
      .slice(0, 6);

    return [
      {
        id: "peers",
        label: "Peer slices",
        hint: "required co-dependencies",
        icon: RELATED_ICONS.peers,
        items: peerSlices.map(({ peer, target }) => ({
          slug: target.slug,
          title: target.title,
          description: target.description,
          category: target.category,
          badge: peer.range,
          reason: peer.reason,
        })),
      },
      {
        id: "enhances",
        label: "Pairs well with",
        hint: "optional enhancers",
        icon: RELATED_ICONS.enhances,
        items: enhancesItems.map((s) => ({
          slug: s.slug,
          title: s.title,
          description: s.tagline ?? s.description,
          category: s.category,
        })),
      },
      {
        id: "siblings",
        label: `More in ${slice.category}`,
        hint: "same category",
        icon: RELATED_ICONS.siblings,
        items: siblingItems.map((s) => ({
          slug: s.slug,
          title: s.title,
          description: s.tagline ?? s.description,
          category: s.category,
        })),
      },
    ];
  }, [slice]);
}
