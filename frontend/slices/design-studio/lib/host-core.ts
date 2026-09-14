import { SAMPLE_IMAGES } from "./samples";

export type AppProps = { payload?: unknown; winId?: string };
export type StudioDocSaver = (text: string, fileName: string, mime: string) => Promise<string>;
export type MediaStudioHost = { saveDoc?: StudioDocSaver; imageSources?: () => string[] };

let host: MediaStudioHost = {};
let cursor = 0;

export function configureMediaStudio(next: MediaStudioHost): void {
  host = { ...host, ...next };
}

export function canSaveToHost(): boolean {
  return typeof host.saveDoc === "function";
}

export async function saveDocToHost(
  text: string,
  fileName: string,
  mime: string,
): Promise<string | null> {
  return host.saveDoc ? host.saveDoc(text, fileName, mime) : null;
}

export function nextImageSource(): string {
  const pool = host.imageSources?.() ?? SAMPLE_IMAGES;
  if (!pool.length) return "";
  return pool[cursor++ % pool.length];
}
