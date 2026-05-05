import { ProjectEditor } from "@/components/templates/agency-studio/slices/admin/projects/ProjectEditor";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectEditor id={id} />;
}
