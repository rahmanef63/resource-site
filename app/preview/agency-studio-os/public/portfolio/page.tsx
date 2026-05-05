import type { Metadata } from "next";
import { PortfolioListPage } from "@/components/templates/agency-studio/slices/portfolio/PortfolioListPage";

export const metadata: Metadata = { title: "Work", description: "Selected client engagements — brand, identity, system, web." };

export default function Page() {
  return <PortfolioListPage />;
}
