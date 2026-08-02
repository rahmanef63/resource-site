import { ResourcesAdmin } from "@/features/resources-launcher-admin";

// Live preview: the curated icon-launcher CRUD on the in-memory mock store.
// Real backend: configureResources({ mode:"live", list, upsert, remove, canManage }).

export default function ResourcesLauncherAdminPreview() {
  return (
    <div className="h-dvh w-full">
      <ResourcesAdmin />
    </div>
  );
}
