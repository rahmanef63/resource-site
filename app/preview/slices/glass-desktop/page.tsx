import { GlassDesktop } from "@/features/glass-desktop";

// Full-bleed preview of the Lucent Desktop slice (the workspace IS the product).
// ?gallery=1 swaps in the widget gallery (QA / visual-review surface).
export default async function GlassDesktopPreview({
  searchParams,
}: {
  searchParams: Promise<{ gallery?: string }>;
}) {
  const sp = await searchParams;
  return <GlassDesktop gallery={sp?.gallery === "1"} />;
}
