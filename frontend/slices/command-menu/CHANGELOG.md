# Changelog — command-menu

## 0.4.0 — 2026-06-30

- Pure compute helpers `lib/calc.ts` (`evaluate` — safe shunting-yard arithmetic, no eval) and `lib/convert.ts` (`convert` — length/mass/temperature unit conversion), both dependency-free, plus `buildComputedGroup(query)` which prepends a "Result" group (e.g. "= 42", "= 6.21 mi") when the query parses as math or a unit conversion. All three are exported from the slice barrel, so consumers no longer reach across a slice boundary for calculator/conversion rows.
- `SearchModal` is now keyboard navigable: Arrow Up/Down move the selection (with wraparound across recent, page, and database rows), Enter activates the highlighted row, Escape closes the dialog. The active row carries `aria-selected` and a visible `bg-accent` highlight, and the selection resets on query change and on close.

## 0.3.0 — 2026-06-10

- Agentic tool collection (`lib/tools.ts`): `commandMenuTools` — list_commands/search/run_command over injectable `CommandMenuCtx` (the host's command groups + runner).
