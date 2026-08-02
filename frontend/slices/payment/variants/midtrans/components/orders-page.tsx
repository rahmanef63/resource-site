"use client";

// Orders history stub — wire to `api.payment.queries.listMine` in your app.

export default function OrdersPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-semibold">Your orders</h1>
      <p className="text-sm text-muted-foreground">
        Stub — replace with a Convex `useQuery(api.payment.queries.listMine)` table.
      </p>
    </main>
  );
}
