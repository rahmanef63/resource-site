import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";

const ACT_ID = "platform";

export const metadata = {
  title: "Act VI — Platform, Auth & Commerce | Grand Tour",
  description:
    "The backbone that ships a product: @convex-dev/auth (no Clerk), RBAC + user management, the admin/platform-admin control planes, audit + event tracking, the multi-replica rate limiter, transactional/newsletter email, bookings, DOKU & Midtrans payments, guest-cart checkout, and cross-tab sync — each mounted live with its add recipe, key-gated providers shown as honest capability cards.",
};

/**
 * Curated PLATFORM story over Act VI's slices, read as a build-order: identity &
 * access first, then the control planes that run the product, then the
 * observability & limits that keep it healthy, and finally the commerce + comms
 * surfaces (most key-gated — they preview env-free but need a provider key to go
 * live). Authored by hand because the catalog carries no sub-grouping signal at
 * this granularity.
 *
 * Routing is delegated to <SliceShowcase>, which picks the mount strategy per
 * slug from the shared infra — NO per-page liveMount branch here:
 *   • liveMount:false (key-gated: resend-newsletter, cal-com-booking,
 *     payment) → <CapabilityCard> (env-free demo iframe +
 *     "needs <KEY>" badge, or a static card)
 *   • PREVIEW_REGISTRY[slug] present → <LazySliceMount> (code-split-on-scroll)
 *   • else previewPath set → lazy <IframeThumbnail> of that route
 *   • else (rate-limit: backend-only, no registry + no previewPath) → static
 *     info card (SliceShowcase's fallback, fed by description/tagline below)
 *
 * Heavy / iframe-isolated surfaces (admin-panel, platform-admin, audit-log,
 * event-tracking, the payment cards) land in the LATER sections so their chunks
 * stay below the fold and only load on scroll. A "More platform" catch-all
 * absorbs any future Act VI slug so nothing silently vanishes (audit:tour
 * enforces a total + disjoint partition against the live catalog).
 */
const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "Identity & access",
    blurb:
      "Who can do what: @convex-dev/auth (no Clerk), the RBAC engine with permission gates, and full user/team/invite management.",
    slugs: ["convex-auth", "rbac-roles", "user-management"],
  },
  {
    heading: "Control planes",
    blurb:
      "Run the product: the admin shell, the 17-section admin panel, and the platform-admin tenant console.",
    slugs: ["admin", "admin-panel", "platform-admin"],
  },
  {
    heading: "Observability & limits",
    blurb:
      "Keep it healthy: the audit log, the event-tracking SDK, and the multi-replica rate limiter.",
    slugs: ["audit-log", "event-tracking", "rate-limit"],
  },
  {
    heading: "Commerce & comms (bring your keys)",
    blurb:
      "Money and messages, each previewing env-free but needing a provider key to go live: transactional/newsletter email, bookings, DOKU & Midtrans payments — plus the env-free guest checkout cart and cross-tab sync.",
    slugs: [
      "resend-newsletter",
      "cal-com-booking",
      "payment",
      "storefront-checkout",
      "broadcast-channel-sync",
    ],
  },
];

function toShowcase(slug: string, liveMount: boolean): ShowcaseSlice {
  const slice = getSlice(slug);
  return {
    slug,
    title: slice?.title ?? slug,
    recipe: `npx rahman-resources add ${slug}`,
    previewPath: slice?.previewPath,
    liveMount,
    // Copy for the rate-limit static info card + the key-gated CapabilityCard
    // static variant (no previewPath case). Harmless for live slices.
    description: slice?.description,
    tagline: slice?.tagline,
  };
}

export default function PlatformActPage() {
  const act = getAct(ACT_ID);
  if (!act) notFound();

  const i = acts.findIndex((a) => a.id === ACT_ID);
  const prev = i > 0 ? acts[i - 1] : null;
  const next = i < acts.length - 1 ? acts[i + 1] : null;

  // liveMount lookup keyed by slug, so curated order can diverge from catalog.
  const liveBySlug = new Map(act.sliceSlugs.map((s) => [s.slug, s.liveMount]));
  const placed = new Set(SECTIONS.flatMap((sec) => sec.slugs));
  const leftover = act.sliceSlugs.filter((s) => !placed.has(s.slug));

  const sections = [
    ...SECTIONS,
    ...(leftover.length > 0
      ? [
          {
            heading: "More platform",
            blurb: "Additional platform, auth & commerce slices in this act.",
            slugs: leftover.map((s) => s.slug),
          },
        ]
      : []),
  ];

  return (
    <>
      <ActHeader act={act} prev={prev} next={next} />

      {sections.map((section) => (
        <section key={section.heading} className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">{section.heading}</h2>
            <p className="text-sm text-muted-foreground">{section.blurb}</p>
          </div>
          <div className="space-y-4">
            {section.slugs
              .filter((slug) => liveBySlug.has(slug))
              .map((slug) => (
                <SliceShowcase
                  key={slug}
                  {...toShowcase(slug, liveBySlug.get(slug) ?? true)}
                />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
