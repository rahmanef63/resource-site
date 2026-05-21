"use client";

import * as React from "react";
import { EquationBlock } from "@/features/equation";
import { Button } from "@/components/ui/button";

const SAMPLES = [
  String.raw`\int_0^\infty e^{-x^2}\,dx = \frac{\sqrt{\pi}}{2}`,
  String.raw`e^{i\pi} + 1 = 0`,
  String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`,
  String.raw`\mathbf{F} = m\mathbf{a}`,
];

/** Minimal interactive preview: pick a sample, edit, KaTeX-render. */
export default function Page() {
  const [text, setText] = React.useState(SAMPLES[0]);
  const refReg = React.useCallback((_el: HTMLElement | null) => {}, []);
  return (
    <main className="mx-auto grid min-h-screen max-w-2xl place-items-center gap-6 bg-background p-6">
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <Button
            key={i}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setText(s)}
            className="h-6 rounded-full px-2 font-mono text-[10px] text-muted-foreground"
          >
            sample {i + 1}
          </Button>
        ))}
      </div>
      <div className="w-full rounded-lg border bg-card p-6">
        <EquationBlock text={text} onText={setText} registerRef={refReg} />
      </div>
    </main>
  );
}
