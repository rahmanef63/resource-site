import type { Metadata } from "next";
import { ProcessPage } from "@/components/templates/agency-studio/slices/process/ProcessPage";

export const metadata: Metadata = {
  title: "Process",
  description: "Empat fase studio engagement — discovery, design sprint, build, launch.",
};

export default function Page() {
  return <ProcessPage />;
}
