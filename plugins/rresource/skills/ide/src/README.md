# ide (layout)

This template is **doc-only**. Source not bundled in plugin.

See `../SKILL.md` for the run protocol. The agent will:
1. Read the bundled spec at `cookbook/layouts/ide.md`.
2. Run the cp commands listed there from the upstream donor repo
   (`~/projects/CareerPack`, `~/projects/cescadesigns`, `~/projects/legacy-rahmanef-com`,
   `~/projects/notion-page-clone`, or kitab-core — see plugin README "Lift sources").
3. If the upstream repo is not mounted on user's box, scaffold a
   minimal stub from the spec's example code.

## Why doc-only

These templates are too large or too domain-coupled to vendor inline
without bloating the plugin past usable size. The cookbook spec
contains the exact file list + integration patterns.

## Want it as primitive instead?

If you want a small, standalone version of part of this template
(e.g. `kanban-board` lifted from `career-dashboard`), check the
`primitives/` set — many were already extracted there.
