import { PageHeader } from "@/components/site/page-header";
import { ExtLink, PathMatrix, LocalInstall } from "./page-shared";
import { Phase0, Phase1, Phase2 } from "./page-phases-prep";
import { Phase3, Phase4 } from "./page-phases-net";
import { Phase5, Phase6 } from "./page-phases-install";
import { ApiReference, Operations, ScAllAnchor, Troubleshoot } from "./page-reference";

export const metadata = {
  title: "VPS Control Room — install guide",
  description:
    "Install guide for VPS Control Room v2.0 — mobile-first PWA dashboard for driving a single VPS. Run it locally on any OS in one command, or deploy to a VPS (AI-assisted, one-line, manual).",
};

const REPO = "https://github.com/rahmanef63/control-room";
const NPM = "https://www.npmjs.com/package/rahman-cr";

export default function ControlRoomPage() {
  return (
    <article className="space-y-8">
      <header>
        <PageHeader
          eyebrow="Install guide"
          title="VPS Control Room"
          description="A mobile-first PWA dashboard for driving a single VPS through a web
          browser. Multi-pane terminals (up to 24 concurrent ptys), AI-agent
          launchers, host telemetry, and shell-allowlist actions — all behind
          one shared secret on a Tailscale-only domain."
        />
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <ExtLink href={REPO}>GitHub</ExtLink>
          <ExtLink href={NPM}>npm: rahman-cr</ExtLink>
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL-LOCAL.md`}>Local install</ExtLink>
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL.md`}>Full roadmap</ExtLink>
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL.id.md`}>🇮🇩 Bahasa Indonesia</ExtLink>
        </div>
      </header>

      <LocalInstall />

      <PathMatrix />

      <Phase0 />
      <Phase1 />
      <Phase2 />
      <Phase3 />
      <Phase4 />
      <Phase5 />
      <Phase6 />

      <ApiReference />
      <Operations />
      <ScAllAnchor />
      <Troubleshoot />

      <footer className="border-t pt-8 text-sm text-muted-foreground">
        <p>
          Need more depth? Read the full{" "}
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL.md`}>INSTALL roadmap</ExtLink>,{" "}
          <ExtLink href={`${REPO}/blob/main/docs/ONBOARDING.md`}>ONBOARDING walkthrough</ExtLink>,{" "}
          <ExtLink href={`${REPO}/blob/main/SECURITY.md`}>SECURITY threat model</ExtLink>, or{" "}
          <ExtLink href={`${REPO}/blob/main/CONTRIBUTING.md`}>CONTRIBUTING guide</ExtLink>.
        </p>
      </footer>
    </article>
  );
}
