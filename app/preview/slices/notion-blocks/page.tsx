"use client";

import * as React from "react";
import {
  EquationBlock,
  CodeBlock,
  NotifyMePopover,
  SelectableCell,
  useDragFill,
  type FillSource,
} from "@/features/notion-blocks";
import { SlicePreviewLayout, PreviewSection } from "@/components/slice-previews/preview-layout";

/** One preview surface for all four notion-style block primitives.
 *  Each demo is independent + config-driven — drop any one into your
 *  own surface and it works without state coupling. */
export default function Page() {
  return (
    <SlicePreviewLayout title="Notion Blocks" kind="ui" maxWidth="none">
      <PreviewSection
        title="1. Equation (KaTeX)"
        hint="click pencil to edit · KaTeX in display mode · zero runtime deps beyond katex"
      >
        <EquationDemo />
      </PreviewSection>

      <PreviewSection
        title="2. Code Block (highlight.js)"
        hint="language picker via dropdown · copy-to-clipboard · github-dark theme"
      >
        <CodeDemo />
      </PreviewSection>

      <PreviewSection
        title="3. Notify Me (per-page subscription)"
        hint="localStorage-backed (notion-clone:subscriptions:v1) · state persists across reload per pageId"
      >
        <div className="flex items-center gap-12 rounded-lg border border-border bg-card p-12">
          {["demo-page-a", "demo-page-b", "demo-page-c"].map((id, i) => (
            <div key={id} className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">Page {String.fromCharCode(65 + i)}</p>
              <NotifyMePopover pageId={id} />
            </div>
          ))}
        </div>
      </PreviewSection>

      <PreviewSection
        title="4. Drag-Fill Cell Selection"
        hint="click any cell · drag bottom-right handle down to fill range with selected cell's value"
      >
        <CellSelectionDemo />
      </PreviewSection>
    </SlicePreviewLayout>
  );
}

function EquationDemo() {
  const samples = [
    String.raw`E = mc^2`,
    String.raw`\int_{-\infty}^{\infty} e^{-x^2} \, dx = \sqrt{\pi}`,
    String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}`,
  ];
  return (
    <div className="grid gap-6">
      {samples.map((init, i) => (
        <EquationItem key={i} initial={init} />
      ))}
    </div>
  );
}

function EquationItem({ initial }: { initial: string }) {
  const [t, setT] = React.useState(initial);
  return <EquationBlock text={t} onText={setT} registerRef={() => {}} />;
}

function CodeDemo() {
  const initial: { lang: string; text: string }[] = [
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
      lang: "bash",
      text: `# rr-sync workflow
pnpm sync:rr <slug> --dry-run
pnpm sync:rr <slug>
cd ~/projects/resources && git add . && git commit && git push`,
    },
  ];
  const [items, setItems] = React.useState(initial);
  return (
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
  );
}

type Row = { id: string; name: string; status: string };
const ROWS: Row[] = [
  { id: "r1", name: "Alice", status: "Active" },
  { id: "r2", name: "Bob", status: "" },
  { id: "r3", name: "Carol", status: "" },
  { id: "r4", name: "Dan", status: "" },
];
const PROPS = ["name", "status"] as const;
type PropId = (typeof PROPS)[number];

function CellSelectionDemo() {
  const [rows, setRows] = React.useState<Row[]>(ROWS);
  const [sel, setSel] = React.useState<{ rowId: string; propId: PropId } | null>(null);

  const { source, start, isInFillRange } = useDragFill({
    rowIds: rows.map((r) => r.id),
    onFill: (src: FillSource, targetIds) => {
      const srcRow = rows.find((r) => r.id === src.rowId)!;
      const v = (srcRow as Record<string, string>)[src.propId];
      setRows((arr) =>
        arr.map((r) => (targetIds.includes(r.id) ? ({ ...r, [src.propId]: v } as Row) : r)),
      );
    },
  });

  const inRange = (rowIdx: number, propId: PropId) =>
    Boolean(source && source.propId === propId && isInFillRange(rowIdx, propId));

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {PROPS.map((p) => (
              <th key={p} className="p-2 text-left font-medium capitalize">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, rowIdx) => (
            <tr key={r.id} className="border-t border-border">
              {PROPS.map((p) => {
                const isSel = sel?.rowId === r.id && sel?.propId === p;
                return (
                  <td key={p} className="h-10 p-0">
                    <SelectableCell
                      rowId={r.id}
                      propId={p}
                      selected={isSel}
                      inFillRange={inRange(rowIdx, p)}
                      showFillHandle={isSel}
                      onSelect={() => setSel({ rowId: r.id, propId: p })}
                      onStartFill={() => start({ rowId: r.id, propId: p, rowIndex: rowIdx })}
                    >
                      <div className="p-2">
                        {(r as Record<string, string>)[p] || (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </div>
                    </SelectableCell>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
