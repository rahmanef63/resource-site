import { AppShell } from "@notion/app/AppShell";
import { PageEditor } from "@notion/slices/editor/PageEditor";

const PageView = () => (
  <AppShell>
    <PageEditor />
  </AppShell>
);

export default PageView;
