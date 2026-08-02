// Type definitions for snapshot.mjs.

import type { SliceSnapshot } from "./merge3";

/** Walk a slice directory and build a SliceSnapshot. */
export function snapshotFromDir(slug: string, dir: string): Promise<SliceSnapshot>;
