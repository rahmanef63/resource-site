import { buildBestPracticesPrompt } from "@/lib/content/best-practices-prompt";
import { buildAgentPrompt } from "@/lib/agent-prompt";
import { StartOptions } from "./start-options";

export function GetStarted() {
  const bestPracticePrompt = buildBestPracticesPrompt();
  const agentPrompt = buildAgentPrompt({ projectName: "<your-project-name>" });

  return (
    <section id="install" className="border-t py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pick how you start.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Roll your own, hand it to an agent, bring an existing project, or compose it
            visually — every path lands on the same rr conventions.
          </p>
        </div>

        <StartOptions agentPrompt={agentPrompt} bestPracticePrompt={bestPracticePrompt} />
      </div>
    </section>
  );
}
