"use client";

import * as React from "react";
import { CodeBlock } from "@/features/code-block";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

const SAMPLES: { lang: string; text: string }[] = [
  {
    lang: "typescript",
    text: `// Type-safe pipeline
type Pipe<A, B> = (a: A) => B;
const compose = <A, B, C>(f: Pipe<A, B>, g: Pipe<B, C>): Pipe<A, C> =>
  (a) => g(f(a));

const add1 = (n: number) => n + 1;
const double = (n: number) => n * 2;
console.log(compose(add1, double)(3)); // 8`,
  },
  {
    lang: "python",
    text: `# Quick generator
def fibonacci():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

fib = fibonacci()
for _ in range(10):
    print(next(fib))`,
  },
  {
    lang: "bash",
    text: `# rr-sync workflow
pnpm sync:rr equation --dry-run
pnpm sync:rr equation
cd ~/projects/resources
git add . && git commit -m "feat(equation): lift"
git push origin main`,
  },
];

export default function Page() {
  const [items, setItems] = React.useState(SAMPLES);

  return (
    <SlicePreviewLayout title="Code Block" kind="ui" maxWidth="none">
      <PreviewSection title="Live demo" hint="highlight.js · pick language · copy to clipboard">
        <div className="grid gap-6">
          {items.map((sample, i) => (
            <CodeBlock
              key={i}
              text={sample.text}
              lang={sample.lang}
              registerRef={() => {}}
              onText={(next) =>
                setItems((arr) => arr.map((s, j) => (j === i ? { ...s, text: next } : s)))
              }
              onLang={(next) =>
                setItems((arr) => arr.map((s, j) => (j === i ? { ...s, lang: next } : s)))
              }
              onKeyDown={() => {}}
            />
          ))}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}
