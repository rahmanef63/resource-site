// Vendored in plugins/rresource. Self-contained — no cross-slice imports.
// Default state = localStorage. Optional Convex schema + fns under ./convex/.

import { createWorker, type Worker } from "tesseract.js";

let workerPromise: Promise<Worker> | null = null;

async function getWorker(lang: string): Promise<Worker> {
  if (workerPromise) return workerPromise;
  workerPromise = (async () => {
    const w = await createWorker(lang);
    return w;
  })();
  return workerPromise;
}

export async function runOcr(
  source: File | Blob | string,
  opts: { lang?: string } = {},
): Promise<string> {
  const lang = opts.lang ?? "eng";
  const worker = await getWorker(lang);
  const { data } = await worker.recognize(source);
  return data.text.trim();
}

export async function disposeOcr(): Promise<void> {
  if (!workerPromise) return;
  const w = await workerPromise;
  await w.terminate();
  workerPromise = null;
}
