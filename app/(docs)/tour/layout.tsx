// /tour inherits the DocsShell (sidebar + width control + global chrome) from
// the parent app/(docs)/layout.tsx. This pass-through layout adds no shell of
// its own — it exists only to give the tour route segment a stable boundary
// for future per-Act metadata/loading without forfeiting the inherited chrome.
export default function TourLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
