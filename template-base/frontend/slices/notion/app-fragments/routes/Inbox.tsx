import { AppShell } from "@notion/app/AppShell";
import { InboxPage } from "@notion/slices/inbox";

const Inbox = () => (
  <AppShell>
    <InboxPage />
  </AppShell>
);

export default Inbox;
