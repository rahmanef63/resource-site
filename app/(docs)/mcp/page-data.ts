// MCP docs page — tools + resources catalog data.

export type Tool = {
  name: string;
  purpose: string;
  args?: string;
};

export const TOOLS: Tool[] = [
  {
    name: "rr_list_templates",
    purpose: "List full-app website templates (Personal Brand OS, Agency Studio, Kreator Studio, Konsultan OS, Wirausaha OS, Riset Kit, …)",
    args: "{ tag?: string }",
  },
  {
    name: "rr_list_features",
    purpose: "List backend / integration features (auth, midtrans, resend, vector-search, ai-router, …)",
    args: "{ tag?: string }",
  },
  {
    name: "rr_list_recipes",
    purpose: "List UI patterns to copy manually (block-editor, command-palette, asymmetric-masonry, …)",
  },
  {
    name: "rr_list_skills",
    purpose: "List Claude Skills inventory (anthropics + rahman skills shipped via the kitab)",
    args: "{ scope?: 'anthropics' | 'rahman' | 'all' }",
  },
  {
    name: "rr_search",
    purpose: "Fuzzy search across all kinds. Returns ranked hits with kind + slug.",
    args: "{ query: string }",
  },
  {
    name: "rr_get",
    purpose: "Full entry by slug (template, feature, recipe, or skill).",
    args: "{ slug: string }",
  },
  {
    name: "rr_compose_init_command",
    purpose: "Emit the `npx rahman-resources init` command for a selection. Use this when scaffolding a fresh project.",
    args: "{ appName, template?, features?, skills? }",
  },
  {
    name: "rr_compose_add_commands",
    purpose: "Emit `add` / `add-skill` commands for an existing rr.json project. Use this when extending an installed kitab.",
    args: "{ features?, skills?, template? }",
  },
  {
    name: "rr_list_workflows",
    purpose: "List the CRUD workflow kinds the kitab documents (templates, features, recipes, skills). Returns slugs the agent can pass to rr_get_workflow.",
  },
  {
    name: "rr_get_workflow",
    purpose: "Get the full Create / Read / Update / Delete workflow doc for one kind. Includes the npm publish step. Use when the user asks how to add/edit/remove a kitab item.",
    args: "{ kind: 'templates'|'features'|'recipes'|'skills' }",
  },
];

export const RESOURCES: { uri: string; purpose: string }[] = [
  { uri: "rr://manifest", purpose: "Full kitab manifest — every layout, feature, recipe, skill, in one JSON tree." },
  { uri: "rr://templates/{slug}", purpose: "One template entry (e.g. `rr://templates/kreator-studio-os`)." },
  { uri: "rr://features/{slug}", purpose: "One feature entry." },
  { uri: "rr://recipes/{slug}", purpose: "One recipe entry." },
  { uri: "rr://skills/{slug}", purpose: "One Claude Skill entry." },
  { uri: "rr://workflow/{kind}", purpose: "CRUD workflow markdown. `kind` ∈ templates|features|recipes|skills. Includes Create/Read/Update/Delete + the npm publish step." },
];
