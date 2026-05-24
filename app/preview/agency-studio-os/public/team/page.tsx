import type { Metadata } from "next";
import { TeamPage } from "@/components/templates/agency-studio/slices/team/TeamPage";

export const metadata: Metadata = {
  title: "Team",
  description: "Tim studio atelier.studio — principal, lead, dan partner.",
};

export default function Page() {
  return <TeamPage />;
}
