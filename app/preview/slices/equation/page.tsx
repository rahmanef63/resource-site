"use client";

import * as React from "react";
import { EquationBlock } from "@/features/equation";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

/** Interactive equation block preview.
 *  KaTeX renders LaTeX in display mode. Click pencil to edit. */
export default function Page() {
  const [text, setText] = React.useState(String.raw`E = mc^2`);

  return (
    <SlicePreviewLayout title="Equation" kind="ui">
      <PreviewSection title="Live demo" hint="click pencil to edit · KaTeX in display mode">
        <EquationBlock text={text} onText={setText} registerRef={() => {}} />
      </PreviewSection>

      <PreviewSection title="Example formulas">
        <div className="grid gap-6">
          {[
            String.raw`\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}`,
            String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`,
            String.raw`a^2 + b^2 = c^2`,
          ].map((sample, i) => (
            <EquationBlockDemo key={i} initial={sample} />
          ))}
        </div>
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function EquationBlockDemo({ initial }: { initial: string }) {
  const [t, setT] = React.useState(initial);
  return <EquationBlock text={t} onText={setT} registerRef={() => {}} />;
}
