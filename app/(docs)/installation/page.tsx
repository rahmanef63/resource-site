import Link from "next/link";
import { CodeBlock } from "@/components/site/code-block";
import { RepoLink } from "@/components/site/repo-link";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { PageHeader } from "@/components/site/page-header";
import { site } from "@/lib/content/site";

export const metadata = { title: "Installation" };

export default function InstallationPage() {
  const prompt = buildAgentPrompt({});
  return (
    <div>
      <PageHeader
        eyebrow="Get Started"
        title="Installation"
        description="Two paths. Pick one."
      />

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">CLI scaffold (recommended)</h2>
        <p className="text-muted-foreground">
          One command. Scaffolds Next 16 + React 19 + Tailwind 4 + Convex
          self-hosted + shadcn/ui into a fresh empty folder. Cross-platform —
          macOS / Linux / Windows PowerShell + WSL.
        </p>
        <CodeBlock
          code={`# Scaffold
npx rahman-resources@latest init my-app

# With every shadcn primitive pre-baked (recommended for heavy customization):
npx rahman-resources@latest init my-app --with-shadcn-all

# With a full-app template (public + admin route trees):
npx rahman-resources@latest init my-app --template personal-brand-os

# Then:
cd my-app
cp .env.example .env.local        # fill NEXT_PUBLIC_CONVEX_URL
npx convex dev --once             # generates convex/_generated
npm run dev                       # http://localhost:3000`}
          language="bash"
          filename="terminal"
        />
        <p className="text-sm text-muted-foreground">
          Browse the catalog at{" "}
          <Link href="/tour" className="underline">/tour</Link>{" "}
          or use the visual{" "}
          <Link href="/build" className="underline">Bundle Builder</Link>{" "}
          to compose template + slices + skills.
        </p>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Clone the repo (contributors)</h2>
        <p className="text-muted-foreground">
          Only needed if you&apos;re contributing back to rr (adding slices,
          editing templates, fixing the CLI). Consumers use{" "}
          <code className="rounded bg-muted px-1 font-mono text-xs">npx rr init</code>{" "}
          above.
        </p>
        <CodeBlock
          code={`git clone ${site.repo} resources
cd resources
npm install --legacy-peer-deps
npm run dev`}
          language="bash"
          filename="terminal"
        />
        <RepoLink>Open repo</RepoLink>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">With AI agent</h2>
        <p className="text-muted-foreground">
          The agent will fetch the knowledge base, clone the repo, copy template-base
          + chosen layout/recipes, install deps, generate Convex types, and run audit-bp.
        </p>
        <CodeBlock code={prompt} language="markdown" filename="agent-prompt.md" />
        <div className="flex items-center gap-2">
          <InstallWithAgent prompt={prompt} />
          <a
            href={`${site.url}/llms.txt`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            View llms.txt →
          </a>
        </div>
      </section>

      <section className="mt-12 space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Pre-flight</h2>
        <p className="text-muted-foreground">For first-time setup:</p>
        <ul className="list-disc space-y-2 pl-6 text-sm">
          <li>Node 20+</li>
          <li>pnpm or npm</li>
          <li>SSH access to GitHub for deploy</li>
          <li>
            Shell env for deploy:{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">DOKPLOY_API_URL</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">DOKPLOY_API_KEY</code>,{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">GITHUB_TOKEN</code>
          </li>
        </ul>
      </section>
    </div>
  );
}
