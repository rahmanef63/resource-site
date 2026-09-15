import Link from "next/link";
import { Box, Package, Sparkles, Terminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/site/code-block";
import { DocCard } from "@/components/site/doc-primitives";
import { RepoLink } from "@/components/site/repo-link";
import { InstallWithAgent } from "@/components/site/install-with-agent";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { PageHeader } from "@/components/site/page-header";
import { site } from "@/lib/content/site";

export const metadata = { title: "Installation" };

const FRAMEWORKS = [
  {
    title: "Next.js + React",
    badge: "default",
    body: "Full-app scaffold with Next.js 16, React 19, Tailwind 4, Convex and shadcn/ui. Existing full-app templates target this path.",
  },
  {
    title: "SvelteKit + Svelte",
    badge: "native",
    body: "SvelteKit 2 + Svelte 5 Runes, Tailwind 4, convex-svelte and adapter-node. Add any of the 66 canonical active slices with --framework sveltekit.",
  },
] as const;

export default function InstallationPage() {
  const prompt = buildAgentPrompt({});
  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Get Started"
        title="Installation"
        description="Choose a renderer and a package manager. The CLI keeps the two decisions independent."
      />

      <section className="space-y-3">
        <SectionHead icon={<Box className="size-4" />} title="1. Choose the framework" />
        <div className="grid gap-3 md:grid-cols-2">
          {FRAMEWORKS.map((item) => (
            <DocCard key={item.title} className="p-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">{item.title}</h2>
                <Badge variant="secondary">{item.badge}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
            </DocCard>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Framework parity is at the slice layer. Full-app templates are still Next.js-specific; SvelteKit projects start from the base scaffold and compose Svelte-ready slices.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHead icon={<Package className="size-4" />} title="2. Choose npm or Bun" />
        <div className="grid gap-3 lg:grid-cols-2">
          <InstallCard title="Next.js / React" npm={`npx rahman-resources@latest init my-app --framework react-next --package-manager npm\ncd my-app\nnpm run dev`} bun={`bunx rahman-resources@latest init my-app --framework react-next --package-manager bun\ncd my-app\nbun run dev`} />
          <InstallCard title="SvelteKit / Svelte 5" npm={`npx rahman-resources@latest init my-app --framework sveltekit --package-manager npm\ncd my-app\nnpm run check\nnpm run dev`} bun={`bunx rahman-resources@latest init my-app --framework sveltekit --package-manager bun\ncd my-app\nbun run check\nbun run dev`} />
        </div>
        <p className="text-sm text-muted-foreground">
          Existing projects are auto-detected from <code className="rounded bg-muted px-1">packageManager</code>, <code className="rounded bg-muted px-1">rr.json</code>, or lockfiles including modern <code className="rounded bg-muted px-1">bun.lock</code>.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHead icon={<Terminal className="size-4" />} title="3. Add slices" />
        <CodeBlock code={`# Next.js default\nnpx rahman-resources@latest add appshell\n\n# SvelteKit\nnpx rahman-resources@latest add appshell --framework sveltekit\n\n# Same Svelte install through Bun\nbunx rahman-resources@latest add appshell --framework sveltekit --package-manager bun`} language="bash" filename="terminal" />
        <p className="text-sm text-muted-foreground">
          Browse <Link href="/slices" className="underline">Slices</Link> for the exact Next/Svelte dependency matrix, or use the <Link href="/build" className="underline">Bundle Builder</Link> to emit commands.
        </p>
      </section>

      <section className="space-y-3">
        <SectionHead icon={<Sparkles className="size-4" />} title="With AI agent" />
        <CodeBlock code={prompt} language="markdown" filename="agent-prompt.md" />
        <div className="flex flex-wrap items-center gap-2">
          <InstallWithAgent prompt={prompt} />
          <a href={`${site.url}/llms.txt`} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">View llms.txt →</a>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHead icon={<Terminal className="size-4" />} title="Contributors" />
        <CodeBlock code={`git clone ${site.repo} resources\ncd resources\n\n# npm\nnpm install --legacy-peer-deps --include=dev\nnpm run dev\n\n# or Bun\nbun install\nbun run dev`} language="bash" filename="terminal" />
        <RepoLink>Open repo</RepoLink>
        <p className="text-xs text-muted-foreground">Fresh app scaffolds support npm and Bun directly. The rr repository keeps its committed npm lockfile as the release lock for CI reproducibility.</p>
      </section>
    </div>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="flex items-center gap-2"><span className="text-muted-foreground">{icon}</span><h2 className="text-lg font-semibold">{title}</h2></div>;
}

function InstallCard({ title, npm, bun }: { title: string; npm: string; bun: string }) {
  return (
    <DocCard className="min-w-0 p-3">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="space-y-3">
        <div><Badge variant="outline" className="mb-1.5">npm</Badge><CodeBlock code={npm} language="bash" filename="npm.sh" /></div>
        <div><Badge variant="outline" className="mb-1.5">Bun</Badge><CodeBlock code={bun} language="bash" filename="bun.sh" /></div>
      </div>
    </DocCard>
  );
}
