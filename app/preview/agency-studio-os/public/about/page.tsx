import type { Metadata } from "next";
import { AboutPage } from "@/components/templates/agency-studio/slices/about/AboutPage";

export const metadata: Metadata = { title: "About", description: "Studio principals, values, team." };

export default function Page() {
  return <AboutPage />;
}
