import type { Metadata } from "next";
import { JournalListPage } from "@/components/templates/agency-studio/slices/journal/JournalListPage";

export const metadata: Metadata = {
  title: "Journal",
  description: "Tulisan studio + case-study dari atelier.studio.",
};

export default function Page() {
  return <JournalListPage />;
}
