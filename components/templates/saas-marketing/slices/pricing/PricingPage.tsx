import { CtaBand } from "@/components/templates/_shared";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";
import { PUBLIC_BASE } from "../../shared/nav-config";
import { PricingTiersClient } from "./PricingTiersClient";
import { PricingMatrix } from "./PricingMatrix";
import { PricingFaq } from "./PricingFaq";

/**
 * CK-2B expansion.
 *
 * Public Pricing page = three-tier deck (admin-editable via
 * PricingTiersClient) + full plan comparison matrix + FAQ + custom-quote
 * sidebar + closing CTA. Sections split into sibling files to respect the
 * 200 LOC cap; data lives in pricing-data.ts so consumers can swap copy
 * without touching layout.
 */
export function PricingPage() {
  return (
    <>
      <section>
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-12">
          <PricingTiersClient
            eyebrow="Pricing"
            title="Free forever. Paid plans when you outgrow it."
            subtitle="No per-seat fees on Free. EU + US data residency on Team and above. Cancel anytime — first paid month refundable if it doesn’t work out."
          />
        </div>
      </section>
      <PricingMatrix />
      <PricingFaq />
      <CtaBand
        title="Start free. Upgrade when you outgrow it."
        subtitle="Most teams stay on Free for the first 60 days. We make that easy."
        cta={DEFAULT_SITE_CONFIG.ctaPrimary}
        secondaryCta={{ label: "Talk to sales", href: `${PUBLIC_BASE}/contact` }}
        bordered
      />
    </>
  );
}
