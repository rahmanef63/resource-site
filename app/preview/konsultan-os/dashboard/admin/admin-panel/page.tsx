import { AdminPanelOverview } from "@/components/templates/_shared/admin-panel/AdminPanelOverview";
import { ADMIN_PANEL_BASE } from "@/components/templates/konsultan/shared/nav-config";

export default function Page() {
  return <AdminPanelOverview adminBase={ADMIN_PANEL_BASE} />;
}
