// Slice's primary entry. Shared chrome lifts in Phase 1
// (components/shared/layout/dashboard). Until then, this is a plain page —
// the slice is still self-contained and copy-paste portable; consumers wrap
// it with whatever shell they already have.

import { ExampleButton } from "./components/example-button";

export default function ExampleFeaturePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Example Feature</h1>
      <p className="text-muted-foreground">
        Reference slice. Replace this body with your real feature once you
        copy the folder.
      </p>
      <ExampleButton />
    </main>
  );
}
