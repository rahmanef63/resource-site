// glass-desktop — Lucent tokens as an inline <style> (Build Plan Appendix A).
// Rendered into the DOM directly rather than imported as a CSS side-effect:
// Next drops client-component CSS imports from the prod bundle in some graphs,
// which left every var(--color-*) undefined (black wallpaper, invisible glass).
// A rendered <style> always applies in dev AND prod, and travels with the slice
// (portable — the consumer needs no Tailwind wiring). config/theme.css remains
// the @theme source for consumers who prefer Tailwind integration.
const TOKENS = `:root{
--color-canvas:oklch(16% 0.015 260);
--color-glass-hi:oklch(30% 0.02 260 / 0.72);
--color-glass-lo:oklch(22% 0.02 260 / 0.60);
--color-glass-solid:oklch(24% 0.02 260 / 0.92);
--color-hairline:oklch(100% 0 0 / 0.10);
--color-hairline-hover:oklch(100% 0 0 / 0.16);
--color-ink-hi:oklch(97% 0.005 260 / 0.95);
--color-ink-mid:oklch(97% 0.005 260 / 0.60);
--color-ink-low:oklch(97% 0.005 260 / 0.36);
--color-accent-blue:oklch(78% 0.14 250);
--color-accent-green:oklch(78% 0.14 155);
--color-accent-amber:oklch(78% 0.14 75);
--color-accent-coral:oklch(78% 0.14 25);
--color-accent-violet:oklch(78% 0.14 305);
--tone-info:var(--color-accent-blue);
--tone-success:var(--color-accent-green);
--tone-warn:var(--color-accent-amber);
--tone-danger:var(--color-accent-coral);
--radius-widget:22px;--radius-pill:999px;--radius-control:12px;
--spacing-cell-w:150px;--spacing-cell-h:71px;--spacing-cell-gap:8px;
--blur-glass:24px;
--shadow-widget:0 12px 32px oklch(0% 0 0 / 0.35), inset 0 1px 0 oklch(100% 0 0 / 0.08);
--shadow-drag:0 24px 56px oklch(0% 0 0 / 0.50), inset 0 1px 0 oklch(100% 0 0 / 0.10);
--font-ui:var(--font-spline-sans), system-ui, sans-serif;
--font-numeric:var(--font-spline-sans-mono), ui-monospace, monospace;
--ease-settle:cubic-bezier(0.32, 0.72, 0.28, 1);
--duration-micro:160ms;--duration-settle:320ms;
}`;

/** Lucent design tokens, applied globally via a rendered <style>. Mount once
 *  at the root of any Lucent surface (desktop shell, gallery). */
export function LucentTheme() {
  return <style data-lucent-theme dangerouslySetInnerHTML={{ __html: TOKENS }} />;
}
