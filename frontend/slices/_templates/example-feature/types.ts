// Slice-internal types. Keep narrow; never re-export Convex `Doc<>` from
// here — let consumers reach for it via `@convex/_generated/dataModel`.

export type ExampleItem = {
  id: string;
  title: string;
  createdAt: number;
};
