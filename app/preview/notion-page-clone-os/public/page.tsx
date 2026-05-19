import { Dashboard } from "@/components/templates/notion-page-clone/slices/notion-app/Dashboard";

/** Public surface = full Notion-clone dashboard. Opens to the welcome
 *  doc by default; sidebar navigates to /d/[id] (docs) or /db/[id]
 *  (databases). Marketing landing content moved into a doc inside the
 *  workspace so the template *is* a Notion clone, not a marketing site
 *  about one. */
export default function Page() {
  return <Dashboard activeKind="doc" activeId="doc-welcome" />;
}
