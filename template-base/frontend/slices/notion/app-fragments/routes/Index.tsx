import { AppShell } from "@notion/app/AppShell";
import { Dashboard } from "@notion/slices/dashboard/views/Dashboard";

const Index = () => (
  <AppShell>
    <Dashboard />
  </AppShell>
);

export default Index;
