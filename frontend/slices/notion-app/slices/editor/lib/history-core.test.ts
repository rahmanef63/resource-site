import { describe, expect, it } from "vitest";
import { createTextHistory } from "./history-core";
describe("text history",()=>{it("records word-boundary checkpoints and redo",()=>{const h=createTextHistory("a");h.record("ab ",1000);h.record("abc ",1600);expect(h.undo("abc ")).toBe("ab ");expect(h.redo("ab ")).toBe("abc ");});});
