"use client";

import * as React from "react";
import { Check } from "lucide-react";

function priceFor(seats: number): number {
  if (seats <= 1) return 0;
  if (seats <= 5) return seats * 9;
  if (seats <= 20) return 5 * 9 + (seats - 5) * 7;
  return 5 * 9 + 15 * 7 + (seats - 20) * 5;
}

export default function Page() {
  const [seats, setSeats] = React.useState(5);
  const price = priceFor(seats);
  const plan = seats <= 1 ? "Free" : seats <= 5 ? "Solo" : seats <= 20 ? "Team" : "Scale";
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-3xl px-6 py-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Pay for what you use</h1>
          <p className="mt-3 text-muted-foreground">Slide to pick your team size. Price scales gracefully.</p>
        </header>
        <div className="rounded-2xl border border-border/60 bg-card p-8">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Seats</span>
            <span className="font-mono text-xs text-muted-foreground">{seats} {seats === 1 ? "person" : "people"}</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            className="mt-3 w-full accent-primary"
          />
          <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>1</span><span>10</span><span>20</span><span>30</span><span>40</span><span>50</span>
          </div>
          <div className="mt-10 flex items-end justify-between border-t border-border/40 pt-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recommended</p>
              <p className="mt-1 text-2xl font-bold">{plan}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold tracking-tight">${price}<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="mt-1 text-xs text-muted-foreground">${seats > 0 ? (price / seats).toFixed(2) : "0"}/seat</p>
            </div>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-y-2 text-sm">
            {["All slices", "Bidir sync", "Audit-bp", "Priority support", "SSO (Team+)", "Custom contracts (Scale)"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check className="size-3.5 shrink-0 text-emerald-500" /> {f}
              </li>
            ))}
          </ul>
          <button className="mt-7 h-11 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Start with {seats} {seats === 1 ? "seat" : "seats"}
          </button>
        </div>
      </section>
    </main>
  );
}
