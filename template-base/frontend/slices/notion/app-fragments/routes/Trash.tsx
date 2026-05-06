import { AppShell } from "@notion/app/AppShell";
import { TrashView } from "@notion/slices/trash/views/TrashView";

const Trash = () => (
  <AppShell>
    <TrashView />
  </AppShell>
);

export default Trash;
