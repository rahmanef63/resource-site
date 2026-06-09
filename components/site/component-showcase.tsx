import { buildBestPracticesPrompt } from "@/lib/content/best-practices-prompt";
import { StartOptions } from "./start-options";

export function ComponentShowcase() {
  const prompt = buildBestPracticesPrompt();
  return (
    <section className="border-y py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Pick how you start.
          </h2>
          <p className="mt-2 text-muted-foreground">
            From zero, from an existing project or PRD, or composed visually — every
            path lands on the same rr conventions.
          </p>
        </div>

        <div className="max-w-3xl">
          <StartOptions prompt={prompt} />
        </div>
      </div>
    </section>
  );
}
