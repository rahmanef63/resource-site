"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const WORDS = ["faster", "smarter", "safer", "together"];

export default function Page() {
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          Build{" "}
          <span className="relative inline-block min-w-[3.5ch] align-baseline">
            {WORDS.map((w, idx) => (
              <span
                key={w}
                className={`absolute inset-x-0 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500 bg-clip-text text-transparent transition-all duration-500 ${
                  idx === i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
              >
                {w}
              </span>
            ))}
            <span className="invisible">{WORDS[0]}</span>
          </span>
          <br />
          with the slice mesh
        </h1>
        <p className="mt-8 max-w-xl text-balance text-lg text-muted-foreground">
          Slices flow up from consumer projects and down from the kitab. Always in sync.
        </p>
        <Link
          href="#"
          className="mt-10 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See it work <ArrowRight className="size-4" />
        </Link>
      </section>
    </main>
  );
}
