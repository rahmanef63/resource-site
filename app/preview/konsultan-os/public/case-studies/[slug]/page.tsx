import { CaseStudyDetailPage } from "@/components/templates/konsultan/slices/case-studies/CaseStudyDetailPage";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CaseStudyDetailPage slug={slug} />;
}
