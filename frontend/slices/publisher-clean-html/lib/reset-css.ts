// Minimal modern CSS reset shipped (unscoped) with every published page, so the
// output doesn't inherit UA defaults (box model, body margin, default font).
// Every selector is wrapped in :where(...) for ZERO specificity — any user
// class, framework utility, or module CSS overrides it without !important.
// Lifted verbatim from Instatic `src/core/publisher/reset.ts`.

export const PUBLISHER_RESET_CSS = [
  ":where(*, *::before, *::after) { box-sizing: border-box; }",
  ":where(*) { margin: 0; padding: 0; }",
  ":where(html, body) { height: 100%; }",
  ":where(body) {" +
    " line-height: 1.5;" +
    ' font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;' +
    " -webkit-font-smoothing: antialiased;" +
    " -moz-osx-font-smoothing: grayscale;" +
    " }",
  // height:auto is critical: the UA maps width/height attributes to presentational
  // hints; without it, max-width:100% clamps width but leaves height stretched.
  ":where(img, picture, video, canvas, svg) { display: block; max-width: 100%; height: auto; }",
  ":where(input, button, textarea, select) { font: inherit; color: inherit; }",
  ":where(button) { background: none; border: 0; cursor: pointer; }",
  ":where(p, h1, h2, h3, h4, h5, h6) { overflow-wrap: break-word; }",
  ":where(ol, ul, menu) { list-style: none; }",
  ":where(a) { color: inherit; text-decoration: inherit; }",
  ":where(table) { border-collapse: collapse; }",
].join("\n");
