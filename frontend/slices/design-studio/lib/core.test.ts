import { describe, expect, it } from "vitest";
import { createStudioStore } from "./studio-core";
import { createSceneStore } from "./scene-core";
import { buildDoc, createLayer } from "./model-core";
import { ADJ_DEFAULT } from "./filters";

describe("design studio portable core", () => {
  it("adds, updates, undoes and redoes layers", () => {
    const store = createStudioStore();
    const before = store.getSnapshot().layers.length;
    const layer = store.add("text", { text: "Portable" });
    expect(store.getSnapshot().layers).toHaveLength(before + 1);
    store.update(layer.id, { x: 12 });
    expect(store.getSnapshot().layers.find((item) => item.id === layer.id)?.x).toBe(12);
    store.undo();
    expect(store.getSnapshot().layers.find((item) => item.id === layer.id)?.x).not.toBe(12);
    store.redo();
    expect(store.getSnapshot().layers.find((item) => item.id === layer.id)?.x).toBe(12);
  });

  it("keeps aspect and safe-area platform semantics observable", () => {
    const scene = createSceneStore();
    scene.setAspect("9 / 16");
    expect(scene.getSnapshot()).toMatchObject({ aspect: "9 / 16", platform: "TikTok" });
    scene.setSafe(true);
    expect(scene.getSnapshot().safe).toBe(true);
    scene.destroy();
  });

  it("serializes the framework-neutral document contract", () => {
    const doc = buildDoc([createLayer("text", { text: "Hello" })], "1 / 1", ADJ_DEFAULT);
    expect(doc.format).toBe("os-rr/layers@1");
    expect(doc.layers[0]).toMatchObject({ kind: "text", text: "Hello", z: 1 });
  });
});
