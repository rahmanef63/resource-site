import { CodeBlock } from "./code-block";
import { InstallWithAgent } from "./install-with-agent";
import { RepoLink } from "./repo-link";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { site } from "@/lib/content/site";

export function InstallSection() {
  const cli = `# Scaffold fresh Next 16 + React 19 + Tailwind 4 + Convex + shadcn app
# Cross-platform — works on macOS, Linux, Windows (PowerShell + WSL).
npx rahman-resources@latest init my-app

# Pre-bake every shadcn primitive (recommended if you'll customize beyond
# the template's default subset):
npx rahman-resources@latest init my-app --with-shadcn-all

# Pre-load a full-app template (public + admin route trees):
npx rahman-resources@latest init my-app --template personal-brand-os

# Then:
cd my-app
cp .env.example .env.local      # fill NEXT_PUBLIC_CONVEX_URL
npx convex dev --once           # generates convex/_generated
npm run dev                     # http://localhost:3000`;

  const agentPrompt = buildAgentPrompt({
    projectName: "<your-project-name>",
  });

  return (
    <section className="border-b py-12 sm:py-16 md:py-20" id="install">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
            Two ways to install
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">
            Roll your own, or hand it to an agent.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-12 md:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-3">
            <h3 className="text-lg font-semibold">Manual</h3>
            <p className="text-sm text-muted-foreground">
              Copy from the repo. Adjust imports. Ship.
            </p>
            <CodeBlock code={cli} language="bash" filename="terminal" />
            <div className="flex flex-wrap gap-2">
              <RepoLink>Open repo</RepoLink>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3">
            <h3 className="text-lg font-semibold">With AI agent</h3>
            <p className="text-sm text-muted-foreground">
              Hand the prompt to Claude Code, Cursor, or any agent. Auto knowledge-base
              fetch.
            </p>
            <CodeBlock
              code={agentPrompt.split("\n").slice(0, 12).join("\n") + "\n…"}
              language="markdown"
              filename="agent-prompt.md"
            />
            <div className="flex flex-wrap gap-2">
              <InstallWithAgent prompt={agentPrompt} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
