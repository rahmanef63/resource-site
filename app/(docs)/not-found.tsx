import Link from "next/link";
import { Compass, Home, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-primary/10">
        <Compass className="size-7 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        That slice, layout, or page doesn&apos;t exist — it may have been renamed,
        merged, or never shipped. The catalog is the source of truth.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/slices">
            <Layers className="size-4" /> Browse slices
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">
            <Home className="size-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
