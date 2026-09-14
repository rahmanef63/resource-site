/** Framework-neutral inline markdown tokenizer shared by React and Svelte. */
const BOLD = /\*\*([^*\n]+)\*\*/;
const STRIKE = /~~([^~\n]+)~~/;
const CODE = /`([^`\n]+)`/;
const ITALIC = /(?:\*([^*\n]+)\*|_([^_\n]+)_)/;
const MATH = /\$([^$\n]+)\$/;
const LINK_MD = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/;
const BARE_URL = /(https?:\/\/[^\s)]+)/;

export type InlineToken =
  | { kind: "text"; value: string }
  | { kind: "bold" | "italic" | "strike" | "code" | "math"; inner: string }
  | { kind: "link"; label: string; href: string };

export function tokenizeInline(input: string): InlineToken[] {
  if (!input) return [];
  const out: InlineToken[] = [];
  let buf = input;
  while (buf.length > 0) {
    const matches: Array<{ idx: number; len: number; tok: InlineToken }> = [];
    push(matches, buf.match(CODE), (m) => ({ kind: "code", inner: m[1]! }));
    push(matches, buf.match(MATH), (m) => ({ kind: "math", inner: m[1]! }));
    push(matches, buf.match(BOLD), (m) => ({ kind: "bold", inner: m[1]! }));
    push(matches, buf.match(STRIKE), (m) => ({ kind: "strike", inner: m[1]! }));
    push(matches, buf.match(ITALIC), (m) => ({ kind: "italic", inner: (m[1] ?? m[2])! }));
    push(matches, buf.match(LINK_MD), (m) => ({ kind: "link", label: m[1]!, href: m[2]! }));
    push(matches, buf.match(BARE_URL), (m) => ({ kind: "link", label: m[1]!, href: m[1]! }));
    if (matches.length === 0) {
      out.push({ kind: "text", value: buf });
      break;
    }
    matches.sort((a, b) => a.idx - b.idx);
    const first = matches[0]!;
    if (first.idx > 0) out.push({ kind: "text", value: buf.slice(0, first.idx) });
    out.push(first.tok);
    buf = buf.slice(first.idx + first.len);
  }
  return out;
}

function push(
  out: Array<{ idx: number; len: number; tok: InlineToken }>,
  match: RegExpMatchArray | null,
  build: (match: RegExpMatchArray) => InlineToken,
) {
  if (match?.index !== undefined) {
    out.push({ idx: match.index, len: match[0].length, tok: build(match) });
  }
}
