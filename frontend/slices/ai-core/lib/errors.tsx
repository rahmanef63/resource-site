// React error renderer. Parsing/friendly-copy/admin-detail semantics live in
// error-core.ts so React and Svelte present the same payload.

import {
  FRIENDLY,
  errData,
  presentError,
  type ChatErrData,
} from "./error-core";

export { FRIENDLY, errData, presentError, type ChatErrData } from "./error-core";

export function ErrorLine({ e, isAdmin, labels }: { e: unknown; isAdmin: boolean; labels?: Record<string, string> }) {
  const { headline, full, adminLine } = presentError(e, labels);
  return (
    <div className="err">
      <span>{headline}</span>
      {isAdmin && adminLine && <span className="mono muted" style={{ display: "block", fontSize: ".72rem", marginTop: ".3rem" }}>{adminLine}</span>}
      <ErrCopy full={full} />
    </div>
  );
}

function ErrCopy({ full }: { full: string }) {
  return (
    <details style={{ marginTop: ".3rem" }}>
      <summary className="link" style={{ fontSize: ".72rem", padding: 0, minHeight: 0, listStyle: "revert" }}>details / copy</summary>
      <pre className="mono muted" style={{ whiteSpace: "pre-wrap", overflowX: "auto", fontSize: ".7rem", margin: ".3rem 0 0", maxHeight: "12rem" }}>{full}</pre>
      <button
        type="button"
        className="link"
        style={{ fontSize: ".72rem", padding: 0, minHeight: 0 }}
        onClick={(ev) => { void navigator.clipboard?.writeText(full); const b = ev.currentTarget; const t = b.textContent; b.textContent = "copied ✓"; setTimeout(() => { b.textContent = t; }, 1500); }}
      >copy error</button>
    </details>
  );
}
