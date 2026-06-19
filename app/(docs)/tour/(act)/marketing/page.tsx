import { notFound } from "next/navigation";
import { acts, getAct } from "@/lib/content/tour";
import { getSlice } from "@/lib/content/slices";
import { ActHeader } from "@/components/site/tour/act-header";
import {
  SliceShowcase,
  type ShowcaseSlice,
} from "@/components/site/tour/slice-showcase";

const ACT_ID = "marketing";

export const metadata = {
  title: "Act I — Marketing | Grand Tour",
  description:
    "The whole landing page in slices — hero/feature/pricing/FAQ sections, testimonials, services, marketing chrome, scroll motion, theme presets, SEO, and the onboarding + contact flow — each mounted live with its add recipe.",
};

/**
 * Curated marketing STORY over Act I's slices, read top-to-bottom like a real
 * landing page: hero/sections → pricing → social proof → FAQ → blog/changelog
 * → motion + theme chrome → SEO + convert flow. Authored by hand because the
 * catalog carries no sub-grouping signal at this granularity. Coverage: every
 * slug in act.sliceSlugs lands in exactly one section; any future Act I slug
 * not listed here falls through to the "More marketing" catch-all below so it
 * never silently vanishes. (landing-sections bundles hero/feature/pricing/FAQ/
 * blog kinds, so the section copy speaks to what it renders.)
 */
const SECTIONS: { heading: string; blurb: string; slugs: string[] }[] = [
  {
    heading: "The landing page",
    blurb:
      "Hero, feature grid, pricing tiers, FAQ, and blog — the full above-and-below-the-fold section kit, plus the sticky nav/footer chrome that frames it.",
    slugs: ["landing-sections", "marketing-chrome"],
  },
  {
    heading: "Social proof",
    blurb:
      "The trust block: testimonial walls and the services/offer grid that turn a curious visitor into a believer.",
    slugs: ["testimonials", "services"],
  },
  {
    heading: "Motion & theme",
    blurb:
      "What makes it feel alive — scroll-reveal and kinetic motion primitives, and the OKLch theme presets that set the mood in one click.",
    slugs: ["motion-kit", "motion-primitives", "theme-presets"],
  },
  {
    heading: "Convert & ship",
    blurb:
      "Close the loop: the onboarding wizard that greets a first-time user, the contact form wired to Resend, and the SEO metadata that gets the page found.",
    slugs: ["onboarding-wizard", "contact-form-resend", "seo"],
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
  };
}

export default function MarketingActPage() {
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
            heading: "More marketing",
            blurb: "Additional marketing slices in this act.",
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
