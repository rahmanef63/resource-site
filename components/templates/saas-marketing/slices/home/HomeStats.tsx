import { HOME_STATS, SOCIAL_PROOF_LOGOS } from "./home-data";

/** CK-2B — band 1: above-the-fold trust strip. Subtle "logos" rendered as
 *  uppercase wordmarks (no real assets); 4 numeric KPI tiles below. */
export function SocialProofRow() {
  return (
    <section className="border-y border-border/50 bg-muted/10">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
          Trusted by product teams at
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {SOCIAL_PROOF_LOGOS.map((name) => (
            <li
              key={name}
              className="text-sm font-semibold tracking-wider text-muted-foreground/80 hover:text-foreground/80 transition-colors"
            >
              {name.toUpperCase()}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** CK-2B — band 2: numeric KPIs. */
export function HomeStatsStrip() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 md:grid-cols-4">
        {HOME_STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border/60 bg-card/60 p-5"
          >
            <p className="text-3xl font-semibold tracking-tight tabular-nums">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/80">{s.hint}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
