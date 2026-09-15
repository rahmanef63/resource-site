/** Lightweight inline-markdown renderer for read-only surfaces (public
 *  share view, exports). Editor input remains plain text — markers are
 *  source-of-truth.
 *
 *  Supported:
 *    **bold**          → <strong>
 *    *italic* / _it_   → <em>
 *    ~~strike~~        → <del>
 *    `code`            → <code>
 *    [label](url)      → <a>  (http/https only)
 *    bare http(s)://…  → <a>
 *
 *  Greedy left-to-right, no nesting beyond one level — sufficient for the
 *  90% block-editor case. Returns React children, not HTML strings, so
 *  there is no XSS surface. */

import * as React from "react";
import Link from "next/link";
import { MathSpan } from "./katex-lazy";

export { stripMd, tokenizeInline } from "./inlineCore";
import { tokenizeInline } from "./inlineCore";

/** Render the tokens as React children. */
export function renderInline(input: string): React.ReactNode {
  const tokens = tokenizeInline(input);
  return tokens.map((t, i) => {
    switch (t.kind) {
      case "text":
        return <React.Fragment key={i}>{t.value}</React.Fragment>;
      case "bold":
        return <strong key={i}>{t.inner}</strong>;
      case "italic":
        return <em key={i}>{t.inner}</em>;
      case "strike":
        return <del key={i}>{t.inner}</del>;
      case "code":
        return <code key={i} className="rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.9em]">{t.inner}</code>;
      case "math":
        return <MathSpan key={i} tex={t.inner} />;
      case "link": {
        const internal = t.href.startsWith("/");
        const cls = "text-brand underline-offset-2 hover:underline";
        if (internal) {
          return (
            <Link key={i} href={t.href} className={cls}>
              {t.label}
            </Link>
          );
        }
        return (
          <a
            key={i}
            href={t.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className={cls}
          >
            {t.label}
          </a>
        );
      }
    }
  });
}
