export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "bold" | "italic" | "strike" | "code" | "math"; inner: string }
  | { kind: "link"; label: string; href: string };

export function stripMd(s: string): string {
  return s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/~~(.+?)~~/g, "$1")
    .replace(/(^|\W)_([^_]+?)_(?=\W|$)/g, "$1$2").replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\((?:https?:\/\/|\/)[^\s)]+\)/g, "$1");
}
const rules: Array<[RegExp, (m: RegExpMatchArray) => InlineToken]> = [
  [/`([^`\n]+)`/, (m) => ({ kind: "code", inner: m[1] })],
  [/\$([^$\n]+)\$/, (m) => ({ kind: "math", inner: m[1] })],
  [/\*\*([^*\n]+)\*\*/, (m) => ({ kind: "bold", inner: m[1] })],
  [/~~([^~\n]+)~~/, (m) => ({ kind: "strike", inner: m[1] })],
  [/(?:\*([^*\n]+)\*|_([^_\n]+)_)/, (m) => ({ kind: "italic", inner: m[1] ?? m[2] })],
  [/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/, (m) => ({ kind: "link", label: m[1], href: m[2] })],
  [/(https?:\/\/[^\s)]+)/, (m) => ({ kind: "link", label: m[1], href: m[1] })],
];
export function tokenizeInline(input: string): InlineToken[] {
  const out: InlineToken[] = []; let buf = input;
  while (buf) {
    const matches = rules.flatMap(([re, build]) => { const m = buf.match(re); return m?.index == null ? [] : [{ idx: m.index, len: m[0].length, tok: build(m) }]; });
    if (!matches.length) { out.push({ kind: "text", value: buf }); break; }
    matches.sort((a, b) => a.idx - b.idx); const first = matches[0];
    if (first.idx) out.push({ kind: "text", value: buf.slice(0, first.idx) });
    out.push(first.tok); buf = buf.slice(first.idx + first.len);
  }
  return out;
}
