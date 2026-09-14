export type AppManifest = {
  title: string;
  runtime: string;
  entry: string;
  source: string;
};

export type ConsoleLine = { kind: "out" | "err" | "exit" | "sys"; text: string };

export function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export function splitConsoleLines(text: string, kind: ConsoleLine["kind"]): ConsoleLine[] {
  return text
    .replace(/\n$/, "")
    .split("\n")
    .filter((_, i, all) => !(all.length === 1 && all[0] === ""))
    .map((line) => ({ kind, text: line }));
}
