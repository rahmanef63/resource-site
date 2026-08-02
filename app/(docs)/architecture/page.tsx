import { CodeBlock } from "@/components/site/code-block";
import { RepoLink } from "@/components/site/repo-link";
import { PageHeader } from "@/components/site/page-header";

export const metadata = { title: "Architecture" };

export default function ArchitecturePage() {
  const subdomainFlow = `Request → demo-konsultan.rahmanef.com/admin/admin-panel/users
            │
            ▼
        proxy.ts (root, Next 16)
            │
            ├── Host header → resolveDemoSlug("demo-konsultan") → "konsultan-os"
            └── Path rewrite → /preview/konsultan-os/dashboard/admin/admin-panel/users
                                                      │
                                                      ▼
                                          AdminFeatureStubPage(segment="users")
                                                      │
                                                      └─► <UsersBlockView />`;

  const dispatcher = `// components/templates/_shared/admin-panel/AdminFeatureStubPage.tsx
//
// One file, 6 dispatch cases. 8 templates × 6 admin-panel blocks = 48
// routes. Every template's /admin/admin-panel/<segment>/page.tsx just
// calls <AdminFeatureStubPage segment="X" /> — zero per-template
// duplication.

export function AdminFeatureStubPage({ segment }: { segment: string }) {
  const block = ADMIN_PANEL_BLOCKS.find((b) => b.segment === segment);
  if (!block) notFound();
  if (segment === "users")     return <UsersBlockView />;
  if (segment === "audit-log") return <AuditLogBlockView />;
  if (segment === "ai-config") return <AiConfigBlockView />;
  if (segment === "analytics") return <AnalyticsBlockView />;
  if (segment === "webhooks")  return <WebhooksBlockView />;
  if (segment === "settings")  return <SettingsBlockView />;
  return <AdminFeatureCard block={block} />;  // fallback
}`;

  const matrix = `             users  audit-log  ai-config  analytics  webhooks  settings
konsultan      ✅        ✅          ✅          ✅          ✅         ✅
personal-brand ✅        ✅          ✅          ✅          ✅         ✅
kreator        ✅        ✅          ✅          ✅          ✅         ✅
wirausaha      ✅        ✅          ✅          ✅          ✅         ✅
riset          ✅        ✅          ✅          ✅          ✅         ✅
agency         ✅        ✅          ✅          ✅          ✅         ✅
saas           ✅        ✅          ✅          ✅          ✅         ✅
notion-clone   ✅        ✅          ✅          ✅          ✅         ✅

   8 templates × 6 blocks = 48 routes served by 1 dispatcher`;

  const blockShape = `_shared/admin-panel/
├── AdminFeatureStubPage.tsx     # dispatcher (6 cases + fallback)
├── AdminFeatureCard.tsx         # placeholder for future segments
├── feature-blocks.ts            # registry (id, segment, icon, label, poweredBy)
├── ui/                          # shared chrome (BY-wave)
│   ├── tones.ts                 # semantic palette SSOT (success/warn/danger/…)
│   ├── block-header.tsx
│   ├── section-header.tsx
│   └── empty-state.tsx
└── blocks/<segment>/            # 1 dir per real block
    ├── types.ts
    ├── seed.ts                  # demo data (resets on browser reload)
    ├── <Segment>BlockView.tsx   # orchestrator, ≤200 LOC
    └── <…>.tsx                  # sub-components`;

  return (
    <div>
      <PageHeader
        eyebrow="Get Started"
        title="Architecture"
        description="Vertical-slice. Copy-first. One dispatcher across N templates. Subdomain demos. No fork."
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Subdomain routing</h2>
        <p className="text-muted-foreground">
          Each of the 8 website templates gets a portfolio-quality demo URL via wildcard
          DNS + a host-header rewriter in <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">proxy.ts</code>.
          Zero forked repos. All 8 subdomains serve the same Next.js build — edit once,
          push, all 8 reflect on next request.
        </p>
        <CodeBlock code={subdomainFlow} language="text" filename="proxy.ts → AdminFeatureStubPage" />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Admin-panel dispatcher pattern</h2>
        <p className="text-muted-foreground">
          Each template&apos;s admin panel feature route is a 1-line stub that calls
          a shared dispatcher. Adding a new real block = one switch case + one BlockView
          file — propagates to all 8 templates&apos; routes simultaneously.
        </p>
        <CodeBlock code={dispatcher} language="tsx" filename="components/templates/_shared/admin-panel/AdminFeatureStubPage.tsx" />
        <CodeBlock code={matrix} language="text" filename="Block × template coverage" />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Block file shape</h2>
        <p className="text-muted-foreground">
          Every block follows the same shape — view orchestrator + extracted sub-components,
          all ≤200 LOC. Shared chrome (BlockHeader, SectionHeader, EmptyState) lives in
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs"> _shared/admin-panel/ui/</code>.
          Semantic tones (success / warn / danger / neutral / info / accent / elevated) come
          from a single SSOT — every status badge across all 6 blocks resolves through it.
        </p>
        <CodeBlock code={blockShape} language="text" filename="_shared/admin-panel/" />
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Hard rules</h2>
        <ul className="list-disc space-y-2 pl-6 text-sm">
          <li><strong>NO Clerk.</strong> Auth = <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">@convex-dev/auth</code>.</li>
          <li><strong>shadcn-only UI.</strong> No raw <code>&lt;button&gt;</code> / <code>&lt;dialog&gt;</code> / native date+file inputs. Use ResponsiveDialog, DateField, FileUpload.</li>
          <li><strong>Copy-first.</strong> Never greenfield. Every artifact comes from a proven source project (see CLAUDE.md Source Map).</li>
          <li><strong>Stack lock</strong>: Next 16 + React 19 + Tailwind 4 + Convex self-hosted + TS strict.</li>
          <li><strong>≤200 LOC per file.</strong> Enforced by <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">audit-file-size</code> across 1.4K+ files.</li>
          <li><strong>Audit chain green</strong> before push: audit-slice (44 slices), audit-templates (36 templates), audit-file-size.</li>
          <li><strong>No marketing chrome on workspace surfaces.</strong> Notion-clone template renders <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">h-dvh</code> full-bleed (BZ-wave) — workspace = the product, not a landing about it.</li>
          <li><strong>proxy.ts not middleware.ts</strong> — Next 16 convention.</li>
        </ul>
        <RepoLink path="CLAUDE.md">CLAUDE.md (full rules)</RepoLink>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Shell hierarchy — who composes whom</h2>
        <p className="text-sm text-muted-foreground">
          Five shell-family slices, one composition rule: outer chrome is owned by exactly one
          shell, everything else is an inner surface mounted inside it. Never nest two chromes.
        </p>
        <ul className="space-y-1.5 pl-6 text-sm list-disc text-muted-foreground">
          <li><strong className="text-foreground">appshell</strong> — OS desktop/mobile chrome (windows, dock, menu bar). The outermost layer for OS-style apps; everything else runs in its windows.</li>
          <li><strong className="text-foreground">dashboard-shell</strong> — app chrome SSOT for dashboards: sidebar + topbar (desktop), dock + sheet (mobile). The single outer chrome for admin/workspace surfaces.</li>
          <li><strong className="text-foreground">workspace-shell</strong> — nav context primitive (workspace × menuSet pair + switcher). Feeds nav state INTO dashboard-shell; renders no chrome.</li>
          <li><strong className="text-foreground">admin-panel</strong> — 17 RBAC-gated sections. Its AdminShell is the INNER section list; mount <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">&lt;AdminPage&gt;</code> inside dashboard-shell, never the reverse.</li>
          <li><strong className="text-foreground">admin</strong> — headless admin scaffold (nav-from-registry + stats factory). No chrome of its own; pair with dashboard-shell.</li>
          <li><strong className="text-foreground">platform-admin</strong> — multi-tenant control-plane panels (contract-only). Mounts inside dashboard-shell like any other admin surface.</li>
        </ul>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Wave progression (recent)</h2>
        <ul className="space-y-1 pl-6 text-sm list-disc text-muted-foreground">
          <li><span className="font-mono text-foreground">BR</span> — wildcard subdomain routing (8 demo URLs, host-based rewriter, zero fork)</li>
          <li><span className="font-mono text-foreground">BS → BX</span> — 6 admin-panel blocks graduated from stub to real impl (users / audit-log / ai-config / analytics / webhooks / settings)</li>
          <li><span className="font-mono text-foreground">BY</span> — polish wave: tones SSOT + shared chrome + a11y + dark-mode + ai-config tabs</li>
          <li><span className="font-mono text-foreground">BZ</span> — notion-clone strip marketing chrome, full-bleed workspace</li>
          <li><span className="font-mono text-foreground">CA</span> — this docs refresh</li>
        </ul>
        <RepoLink path="lib/content/changelog.ts">changelog.ts (full history)</RepoLink>
      </section>
    </div>
  );
}
