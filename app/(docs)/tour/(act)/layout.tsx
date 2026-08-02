import { UseWideLayout } from "@/components/site/use-wide-layout";

// Shared chrome for every Act page (P1–P3). The `(act)` route group gives the
// Act pages their own boundary so this width control does NOT leak onto the
// /tour index. A layout under a static (non-param) group can't read which Act
// it wraps, so the Act title/blurb + prev/next nav are rendered by each page
// via <ActHeader/> — this layout owns only the shared shell (wide layout to
// match the /tour index).
export default function ActLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <UseWideLayout />
      {children}
    </div>
  );
}
