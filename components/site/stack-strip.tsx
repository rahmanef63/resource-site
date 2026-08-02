import { stack } from "@/lib/content/sections";
import { Badge } from "@/components/ui/badge";

export function StackStrip() {
  return (
    <section className="border-b py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Stack</h2>
          <p className="mt-3 text-muted-foreground">
            Everything you'd pick if you were starting today.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {stack.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:-translate-y-0.5"
            >
              <Badge variant="outline" className="rounded-full px-3 py-1.5 text-sm">
                {s.name}
              </Badge>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
