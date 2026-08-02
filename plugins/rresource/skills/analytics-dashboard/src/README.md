# analytics-dashboard

recharts wrapper + Convex aggregation. Default → demo localStorage data. Opt-in → real Convex events.

## Install
```bash
pnpm add recharts
```

## Use (demo data)
```tsx
const data = useAnalyticsDataLocal("home", 30);
<AnalyticsDashboard
  data={data}
  series={[{ key: "signups", label: "Signups", color: "#7c3aed" }, { key: "events", label: "Events", color: "#10b981" }]}
/>
```

## Use (Convex)
1. Copy `convex/analytics.ts` to consumer's `convex/` (assumes an `events` table — adjust naming).
2. `const series = useQuery(api.analytics.seriesByDay, { kind: "signup", days: 30 }) ?? [];`
3. Pass to `<AnalyticsDashboard data={series} series={[{ key: "count", label: "Signups" }]} />`.
