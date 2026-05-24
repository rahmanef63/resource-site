import { Check, Minus } from "lucide-react";
import { PRICING_MATRIX, type MatrixRow } from "./pricing-data";

function cell(v: MatrixRow["free"]) {
  if (v === true) return <Check className="mx-auto size-4 text-emerald-400" />;
  if (v === false) return <Minus className="mx-auto size-4 text-muted-foreground/40" />;
  return <span className="text-xs tabular-nums">{v}</span>;
}

const GROUPS: MatrixRow["category"][] = ["Limits", "Workflow", "Admin", "Support"];

/** CK-2B — full plan comparison matrix. Sticky header, grouped rows. */
export function PricingMatrix() {
  return (
    <section className="border-t border-border/60 bg-muted/10">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            Compare plans
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Everything that is and isn&rsquo;t included
          </h2>
        </div>
        <div className="mt-10 overflow-x-auto rounded-xl border border-border/60 bg-card/40">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">
                  Free
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-foreground">
                  Team
                </th>
                <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">
                  Scale
                </th>
              </tr>
            </thead>
            <tbody>
              {GROUPS.map((g) => (
                <>
                  <tr key={`grp-${g}`} className="bg-muted/20">
                    <td colSpan={4} className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {g}
                    </td>
                  </tr>
                  {PRICING_MATRIX.filter((r) => r.category === g).map((r) => (
                    <tr key={r.label} className="border-t border-border/40">
                      <td className="px-4 py-2.5 text-sm">{r.label}</td>
                      <td className="px-4 py-2.5 text-center">{cell(r.free)}</td>
                      <td className="px-4 py-2.5 text-center font-medium">{cell(r.team)}</td>
                      <td className="px-4 py-2.5 text-center">{cell(r.scale)}</td>
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
