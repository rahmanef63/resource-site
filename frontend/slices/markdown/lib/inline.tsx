/** React renderer for the shared framework-neutral inline tokenizer. */
import * as React from "react";
import { MathSpan } from "./katex-lazy";
import { tokenizeInline } from "./inline-core";

export { tokenizeInline } from "./inline-core";
export type { InlineToken } from "./inline-core";

export function renderInline(input: string): React.ReactNode {
  return tokenizeInline(input).map((token, index) => {
    switch (token.kind) {
      case "text":
        return <React.Fragment key={index}>{token.value}</React.Fragment>;
      case "bold":
        return <strong key={index}>{token.inner}</strong>;
      case "italic":
        return <em key={index}>{token.inner}</em>;
      case "strike":
        return <del key={index}>{token.inner}</del>;
      case "code":
        return <code key={index} className="rounded bg-muted/70 px-1 py-0.5 font-mono text-[0.9em]">{token.inner}</code>;
      case "math":
        return <MathSpan key={index} tex={token.inner} />;
      case "link": {
        const external = /^https?:\/\//.test(token.href);
        return (
          <a
            key={index}
            href={token.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer nofollow" : undefined}
            className="text-primary underline-offset-2 hover:underline"
          >
            {token.label}
          </a>
        );
      }
    }
  });
}
