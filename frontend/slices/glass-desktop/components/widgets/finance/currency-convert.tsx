"use client";
// glass-desktop — currency-convert (W, finance). An editable base amount (USD)
// recomputes the converted value (EUR) live on every keystroke against a fixed
// seed rate. Numbers format through the en-GB `currency` helper (locale pinned
// for hydration safety). Content only — the canvas supplies the glass shell.
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { currencyConvertSeed } from "@/features/glass-desktop/lib/seeds/finance-analytics-2.seed";
import { currency } from "@/features/glass-desktop/utils/format";
import type { WidgetProps } from "@/features/glass-desktop/types";
import { cn } from "@/lib/utils";

const C = currencyConvertSeed;

export function CurrencyConvert(_props: WidgetProps) {
  const [raw, setRaw] = useState(String(C.amount));
  const amount = Number.parseFloat(raw);
  const converted = Number.isFinite(amount) ? amount * C.rate : 0;

  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
          {C.fromLabel}
        </span>
        <span className="flex items-baseline gap-2">
          <Input
            inputMode="decimal"
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-label={`Amount in ${C.from}`}
            className={cn(
              "h-9 flex-1 rounded-[var(--radius-control)] border-0 text-lg font-semibold tabular-nums",
              "[background:var(--color-glass-lo)] [color:var(--color-ink-hi)]",
              "[font-family:var(--font-numeric)]",
            )}
          />
          <span className="text-xs font-medium" style={{ color: "var(--color-ink-low)" }}>
            {C.from}
          </span>
        </span>
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-ink-mid)" }}>
          {C.toLabel}
        </span>
        <span className="flex items-baseline gap-2 tabular-nums" style={{ fontFamily: "var(--font-numeric)" }}>
          <span className="text-xl font-semibold" style={{ color: "var(--color-ink-hi)" }}>
            {currency(converted)}
          </span>
          <span className="text-xs font-medium" style={{ color: "var(--color-ink-low)" }}>
            {C.to}
          </span>
        </span>
        <span className="text-[11px] tabular-nums" style={{ color: "var(--color-ink-low)", fontFamily: "var(--font-numeric)" }}>
          1 {C.from} = {currency(C.rate)} {C.to}
        </span>
      </div>
    </div>
  );
}
