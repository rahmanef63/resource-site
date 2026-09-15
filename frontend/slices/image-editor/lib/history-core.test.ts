import { describe, expect, it } from "vitest";
import { blankDoc } from "./model";
import { createImageHistory } from "./history-core";

describe("image editor history core", () => {
  it("uses stable snapshots and one timeline for doc + paint", () => {
    let doc = blankDoc(100, 100); let paint = "a";
    const h = createImageHistory({ doc: (d) => { doc = d; }, paint: (_id, data) => { paint = data; } });
    const first = h.getSnapshot(); expect(h.getSnapshot()).toBe(first);
    const next = { ...doc, width: 200 };
    h.push({ type: "doc", before: doc, after: next }); doc = next;
    h.push({ type: "paint", id: doc.layers[0].id, before: "a", after: "b" }); paint = "b";
    h.undo(); expect(paint).toBe("a");
    h.undo(); expect(doc.width).toBe(100);
    h.redo(); expect(doc.width).toBe(200);
  });
});
