import { Container, Section } from "@/shared/ui/section";
import { StatCounter } from "@/shared/ui/stat-counter";

type Stat = {
  to: number;
  label: string;
  suffix?: string;
  decimals?: number;
};

/**
 * Scroll-triggered numeric counters for a landing section. 4 cols by
 * default. Big serif digits, uppercase label micro-copy. Plug values
 * in at the call site.
 */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <Section className="border-y-2 border-foreground bg-background">
      <Container>
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <li
              key={s.label}
              className={`relative ${i > 0 ? "lg:pl-8 lg:border-l-2 lg:border-foreground" : ""}`}
            >
              <div className="font-serif text-[clamp(3rem,8vw,6rem)] leading-none tracking-[-0.04em]">
                <StatCounter to={s.to} suffix={s.suffix} decimals={s.decimals ?? 0} />
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-brutal font-medium text-muted-foreground">
                {s.label}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
