import Link from "next/link";
import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { PricingTiersClient } from "./PricingTiersClient";

/**
 * Server chrome for the public Pricing page. The live tier grid is wrapped
 * in a "use client" component (PricingTiersClient) that reads from the
 * template store so admin edits propagate live across tabs.
 */
export function PricingPage() {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="Pricing"
          title="Free forever. Paid plans when you outgrow it."
          subtitle="No per-seat fees on Free. EU + US data residency on Team and above."
        />
        <PricingTiersClient />
        <div className="mx-auto mt-12 max-w-2xl rounded-lg border border-border/60 bg-muted/30 p-6 text-center">
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
