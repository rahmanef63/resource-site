import Link from "next/link";
import { PricingTiersClient } from "./PricingTiersClient";

/**
 * Server chrome for the public Pricing page. Live tier grid is delegated to
 * the canonical pricing-page slice (frontend/slices/pricing-page) via the
 * client wrap PricingTiersClient — admin edits propagate live across tabs.
 */
export function PricingPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-20">
        <PricingTiersClient
          eyebrow="Pricing"
          title="Free forever. Paid plans when you outgrow it."
          subtitle="No per-seat fees on Free. EU + US data residency on Team and above."
        />
        <div className="mx-auto -mt-4 max-w-2xl rounded-lg border border-border/60 bg-muted/30 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Need on-prem, BAA, or volume contracts?{" "}
            <Link
              href="../contact"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Talk to sales
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
