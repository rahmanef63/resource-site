"use client";

import { SectionHead } from "@/components/templates/_shared/ui/section-head";
import { DEFAULT_SITE_CONFIG } from "../../shared/site-config";

export function AboutPage() {
  const c = DEFAULT_SITE_CONFIG;
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-20">
        <SectionHead
          eyebrow="About"
          title={`${c.productName} — built by a small distributed team`}
          subtitle="We started it because every signing API we tried felt heavier than the problem they solved."
        />
        <div className="mt-12 space-y-6 text-base text-muted-foreground">
          <p>
            {c.productName} is built and maintained by a remote team across Jakarta, Berlin, and Toronto.
            We ship every week and answer support emails ourselves.
          </p>
          <p>
            We focus on three things: a small focused API surface, audit-ready defaults, and predictable
            pricing. We will never charge per-seat on the Free tier.
          </p>
          <p>
            Have a question, a bug report, or a wild integration idea? Email{" "}
            <a href={`mailto:${c.email}`} className="text-foreground underline-offset-4 hover:underline">
              {c.email}
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
