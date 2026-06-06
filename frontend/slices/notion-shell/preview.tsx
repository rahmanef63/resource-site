"use client";
/** Variant preview (VP wave) — rr-internal, stripped on `rr add`. */
import type { SlicePreviewModule } from "@/shared/preview/types";
import { createDemoStore } from "@/shared/preview/demo-store";
import { CalloutBlock } from "./components/blocks/CalloutBlock";
import type { Block } from "./types";

type CalloutKind = NonNullable<Block["calloutKind"]>;

const SEED: Block = {
  id: "callout-demo",
  type: "callout",
  text: "Edit me — this is a live, inline-editable callout. Pick a kind to recolour it.",
  calloutKind: "tip",
};

const { useDemoStore } = createDemoStore({ slug: "notion-shell", seed: SEED });

const preview: SlicePreviewModule = {
  CalloutBlock: ({ variant }) => {
    const [block, setBlock, { ready }] = useDemoStore();
    if (!ready) return null;
    const kind = (variant.kind as CalloutKind) ?? "tip";
    return (
      <div className="p-4">
        <CalloutBlock
          block={{ ...block, calloutKind: kind }}
          onUpdate={(patch) => setBlock((b) => ({ ...b, ...patch }))}
        />
      </div>
    );
  },
};
export default preview;
