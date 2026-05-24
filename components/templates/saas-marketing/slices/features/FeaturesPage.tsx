import { CtaBand } from "@/components/templates/_shared";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { FeatureGridClient } from "./FeatureGridClient";
import { FeatureMatrix } from "./FeatureMatrix";
import { UseCases } from "./UseCases";

/**
 * CK-2B expansion.
 *
 * Server chrome for the public Features page. Renders the canonical
 * FeatureGridClient (admin-editable) as the top fold, then layers in three
 * static blocks: a categorised feature matrix, three use-case callouts,
 * and a closing CTA band. Sections live in sibling files (FeatureMatrix,
 * UseCases) to respect the 200 LOC cap.
 */
export function FeaturesPage() {
  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <FeatureGridClient
            eyebrow="Features"
            title="Everything you need to ship a signed PDF"
            subtitle="One opinionated API, audit-ready by default. The grid below is the editorial highlight reel — full matrix follows."
          />
        </div>
      </section>
      <FeatureMatrix />
      <UseCases />
      <CtaBand
        title="Spin up your first signed PDF in 90 seconds"
        subtitle="Free tier gives you 100 docs/month forever. No card."
        cta={DEFAULT_SITE_CONFIG.ctaPrimary}
        secondaryCta={{ label: "See pricing", href: `${PUBLIC_BASE}/pricing` }}
        bordered
      />
    </>
  );
}
