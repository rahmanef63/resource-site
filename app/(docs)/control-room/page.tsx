import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { CodeBlock } from "@/components/site/code-block";

export const metadata = {
  title: "VPS Control Room — install guide",
  description:
    "End-to-end install guide for VPS Control Room v2.0 — mobile-first PWA dashboard for driving a single VPS. Three paths: AI-assisted, one-line, manual.",
};

const REPO = "https://github.com/rahmanef63/control-room";
const NPM = "https://www.npmjs.com/package/rahman-cr";

export default function ControlRoomPage() {
  return (
    <article className="max-w-3xl space-y-12">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Install guide</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">VPS Control Room</h1>
        <p className="mt-3 text-muted-foreground">
          A mobile-first PWA dashboard for driving a single VPS through a web
          browser. Multi-pane terminals (up to 24 concurrent ptys), AI-agent
          launchers, host telemetry, and shell-allowlist actions — all behind
          one shared secret on a Tailscale-only domain.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <ExtLink href={REPO}>GitHub</ExtLink>
          <ExtLink href={NPM}>npm: rahman-cr</ExtLink>
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL.md`}>Full roadmap</ExtLink>
          <ExtLink href={`${REPO}/blob/main/docs/INSTALL.id.md`}>🇮🇩 Bahasa Indonesia</ExtLink>
        </div>
      </header>

      <PathMatrix />

      <Section
        eyebrow="Phase 0"
        title="Local prereqs (your laptop)"
        body={
          <>
            <p className="text-muted-foreground">
              Run on <strong>your laptop</strong>, not the VPS.
            </p>
            <CodeBlock code={`npx rahman-cr doctor`} language="bash" filename="terminal" />
            <p className="text-sm text-muted-foreground">
              Confirms Node 18+, <code className="rounded bg-muted px-1 py-0.5">ssh</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5">git</code>, and{" "}
              <code className="rounded bg-muted px-1 py-0.5">openssl</code> are all in PATH.
            </p>
            <p className="text-sm text-muted-foreground">
              Also have ready: an SSH key (
              <code className="rounded bg-muted px-1 py-0.5">~/.ssh/id_ed25519.pub</code>) and a
              password manager — you&apos;ll need to store two 32-char secrets at the end.
            </p>
            <CodeBlock
              code={`# generate an SSH key if you don't have one yet
ssh-keygen -t ed25519 -C "your-email"`}
              language="bash"
              filename="terminal"
            />
          </>
        }
      />

      <Section
        eyebrow="Phase 1"
        title="VPS provisioning"
        body={
          <>
            <p className="text-muted-foreground">
              Bring your own VPS. Tested providers: Hostinger, DigitalOcean, Vultr, Hetzner.
              Minimum Ubuntu 22.04, 1 GB RAM, 5 GB disk, 1 vCPU. Recommended Ubuntu 24.04 LTS,
              2 GB+ RAM.
            </p>
            <p className="text-sm text-muted-foreground">
              After provisioning, confirm you have the public IPv4 and can SSH in.
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <ExtLink href="https://www.hostinger.com/vps-hosting">Hostinger VPS</ExtLink>
              <ExtLink href="https://www.digitalocean.com/">DigitalOcean</ExtLink>
              <ExtLink href="https://www.vultr.com/">Vultr</ExtLink>
              <ExtLink href="https://www.hetzner.com/cloud">Hetzner</ExtLink>
            </div>
          </>
        }
      />

      <Section
        eyebrow="Phase 2"
        title="Push SSH key, kill password auth"
        body={
          <>
            <p className="text-muted-foreground">
              Get rid of password auth before doing anything else.
            </p>
            <CodeBlock
              code={`# from your laptop
ssh-copy-id user@<vps-ip>
ssh user@<vps-ip> 'echo ok'   # should print: ok (no password prompt)`}
              language="bash"
              filename="terminal (laptop)"
            />
            <p className="text-sm text-muted-foreground">
              Recommended: disable password auth on the VPS afterward.
            </p>
            <CodeBlock
              code={`# on the VPS
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd`}
              language="bash"
              filename="terminal (VPS)"
            />
          </>
        }
      />

      <Section
        eyebrow="Phase 3"
        title="Tailscale on the VPS"
        body={
          <>
            <p className="text-muted-foreground">
              The dashboard is designed for{" "}
              <strong>Tailscale-only access</strong>. The reverse proxy binds to the Tailscale
              interface; the public IP never sees the dashboard.
            </p>

            <h3 className="text-base font-semibold">3.1 Generate a Tailscale auth key</h3>
            <p className="text-sm text-muted-foreground">
              Open the keys admin page and click <strong>Generate auth key</strong>:
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <ExtLink href="https://login.tailscale.com/admin/settings/keys">
                Tailscale → Settings → Keys
              </ExtLink>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Reusable: <strong>No</strong></li>
              <li>Ephemeral: <strong>No</strong></li>
              <li>Pre-authorized: <strong>Yes</strong></li>
              <li>
                Tags: <code className="rounded bg-muted px-1 py-0.5">tag:server</code>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              Copy the <code className="rounded bg-muted px-1 py-0.5">tskey-auth-…</code> string —
              you&apos;ll paste it in the next step.
            </p>

            <h3 className="text-base font-semibold">3.2 Install Tailscale on the VPS</h3>
            <CodeBlock
              code={`ssh user@<vps-ip>
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --authkey=tskey-auth-XXXX --hostname=control-room
tailscale ip -4    # → 100.x.y.z
exit`}
              language="bash"
              filename="terminal (VPS)"
            />

            <h3 className="text-base font-semibold">3.3 Note your tailnet hostname</h3>
            <p className="text-sm text-muted-foreground">
              Your dashboard URL will be{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                control-room.&lt;tailnet&gt;.ts.net
              </code>
              . Find your tailnet name at:
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <ExtLink href="https://login.tailscale.com/admin/dns">
                Tailscale → DNS
              </ExtLink>
            </div>
          </>
        }
      />

      <Section
        eyebrow="Phase 4 (optional)"
        title="Custom DNS"
        body={
          <>
            <p className="text-muted-foreground">
              Skip this phase if you&apos;re happy using{" "}
              <code className="rounded bg-muted px-1 py-0.5">.ts.net</code>. Otherwise, create an
              A record pointing your custom subdomain at the Tailscale 100.x IP.
            </p>

            <h3 className="text-base font-semibold">4.1 Manual via your DNS provider</h3>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Type</th>
                    <th className="px-3 py-2 text-left font-medium">Name</th>
                    <th className="px-3 py-2 text-left font-medium">Value</th>
                    <th className="px-3 py-2 text-left font-medium">TTL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="px-3 py-2 font-mono">A</td>
                    <td className="px-3 py-2 font-mono">control</td>
                    <td className="px-3 py-2 font-mono">100.x.y.z</td>
                    <td className="px-3 py-2 font-mono">300</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-base font-semibold">4.2 Hostinger API (one curl)</h3>
            <p className="text-sm text-muted-foreground">
              Generate a token at{" "}
              <ExtLink href="https://developers.hostinger.com/">developers.hostinger.com</ExtLink>{" "}
              first.
            </p>
            <CodeBlock
              code={`# replace YOUR_TOKEN, yourdomain.com, and 100.x.y.z
curl -X POST https://developers.hostinger.com/api/dns/v1/zones/yourdomain.com/records \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"type":"A","name":"control","content":"100.x.y.z","ttl":300}'`}
              language="bash"
              filename="terminal"
            />

            <h3 className="text-base font-semibold">4.3 Verify</h3>
            <CodeBlock
              code={`dig +short control.yourdomain.com    # → 100.x.y.z`}
              language="bash"
              filename="terminal"
            />

            <p className="text-sm text-amber-700 dark:text-amber-400">
              ⚠️ <strong>Do NOT</strong> set the A record to your public IP. That defeats the
              threat model — Traefik binds to Tailscale only, so a public record just leaks the
              VPS IP.
            </p>
          </>
        }
      />

      <Section
        eyebrow="Phase 5"
        title="Pick an install path"
        body={
          <>
            <p className="text-muted-foreground">
              Three paths, same end state. Run from your laptop.
            </p>

            <h3 className="text-base font-semibold">A. AI-assisted</h3>
            <p className="text-sm text-muted-foreground">
              The CLI prints a structured prompt + copies it to your clipboard. Paste into
              Claude / Codex / Gemini. The AI triggers the{" "}
              <code className="rounded bg-muted px-1 py-0.5">/sc-all</code> skill if available
              and walks the remaining phases.
            </p>
            <CodeBlock
              code={`npx rahman-cr ai claude     # or: codex | gemini`}
              language="bash"
              filename="terminal"
            />

            <h3 className="text-base font-semibold">B. One-line (non-interactive)</h3>
            <p className="text-sm text-muted-foreground">
              SSHs in, installs Node 22 + Tailscale (optional), clones the repo, generates two
              32-char secrets, writes <code className="rounded bg-muted px-1 py-0.5">.env.local</code>{" "}
              (chmod 600), runs <code className="rounded bg-muted px-1 py-0.5">install-systemd.sh</code>{" "}
              and <code className="rounded bg-muted px-1 py-0.5">deploy.sh main</code>, then
              verifies. Login secret prints once at the end — save it.
            </p>
            <CodeBlock
              code={`# already on tailnet
npx rahman-cr install \\
  --vps user@<ip> \\
  --domain control-room.<tailnet>.ts.net

# fresh VPS not on tailnet yet
npx rahman-cr install \\
  --vps user@<ip> \\
  --domain control-room.<tailnet>.ts.net \\
  --tailscale-key tskey-auth-XXXX`}
              language="bash"
              filename="terminal"
            />

            <h3 className="text-base font-semibold">C. Manual</h3>
            <p className="text-sm text-muted-foreground">
              Walk every step yourself. Good for learning the architecture.
            </p>
            <CodeBlock
              code={`ssh user@<vps-ip>
mkdir -p ~/projects && cd ~/projects
git clone https://github.com/rahmanef63/control-room.git vps-control-room
cd vps-control-room

cp .env.example .env.local
$EDITOR .env.local    # set CONTROL_ROOM_SECRET, _SESSION_SECRET, NEXT_PUBLIC_APP_HOST, _APP_URL
chmod 600 .env.local

npm --prefix frontend install
npm --prefix agent    install
npm --prefix cli      install

sudo bash scripts/install-systemd.sh
bash scripts/deploy.sh main`}
              language="bash"
              filename="terminal (VPS)"
            />
            <p className="text-sm text-muted-foreground">
              Generate the two secrets locally with{" "}
              <code className="rounded bg-muted px-1 py-0.5">openssl rand -hex 32</code> (twice
              — they must be different).
            </p>
          </>
        }
      />

      <Section
        eyebrow="Phase 6"
        title="Verify"
        body={
          <>
            <h3 className="text-base font-semibold">6.1 systemd services</h3>
            <CodeBlock
              code={`ssh user@<vps-ip> 'systemctl is-active vps-control-room-agent vps-control-room-frontend'
# expect:
#   active
#   active`}
              language="bash"
              filename="terminal"
            />

            <h3 className="text-base font-semibold">6.2 Health endpoint</h3>
            <CodeBlock
              code={`ssh user@<vps-ip> 'curl -s http://127.0.0.1:4001/health'
# expect: {"ok":true,...}`}
              language="bash"
              filename="terminal"
            />

            <h3 className="text-base font-semibold">6.3 Browser login</h3>
            <p className="text-sm text-muted-foreground">
              Open <code className="rounded bg-muted px-1 py-0.5">https://control-room.&lt;tailnet&gt;.ts.net</code>
              {" "}(or your custom domain). Paste{" "}
              <code className="rounded bg-muted px-1 py-0.5">CONTROL_ROOM_SECRET</code> from your
              password manager. Spawn a terminal, type <code className="rounded bg-muted px-1 py-0.5">whoami</code>,
              expect your VPS user.
            </p>

            <h3 className="text-base font-semibold">6.4 Install as a PWA</h3>
            <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
              <li>
                <strong>iOS Safari</strong>: Share → <strong>Add to Home Screen</strong>
              </li>
              <li>
                <strong>Android Chrome</strong>: ⋮ → <strong>Install app</strong>
              </li>
            </ul>
          </>
        }
      />

      <Section
        eyebrow="Reference"
        title="API endpoints (AI / automation)"
        body={
          <>
            <p className="text-muted-foreground">
              The AI prompt embeds this catalog. Listed here for direct reference.
            </p>

            <h3 className="text-base font-semibold">Tailscale</h3>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>
                Docs:{" "}
                <ExtLink href="https://tailscale.com/api">tailscale.com/api</ExtLink>
              </li>
              <li>
                Auth: <code className="rounded bg-muted px-1 py-0.5">Bearer ${"{TAILSCALE_API_KEY}"}</code>
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                /api/v2/tailnet/-/keys — create auth key
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">GET</code>{" "}
                /api/v2/tailnet/-/devices — list devices
              </li>
            </ul>

            <h3 className="text-base font-semibold">Hostinger</h3>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>
                Docs:{" "}
                <ExtLink href="https://developers.hostinger.com/">developers.hostinger.com</ExtLink>
              </li>
              <li>
                Auth: <code className="rounded bg-muted px-1 py-0.5">Bearer ${"{HOSTINGER_API_TOKEN}"}</code>
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">GET</code>{" "}
                /api/vps/v1/virtual-machines — list VPS
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                /api/dns/v1/zones/{"{domain}"}/records — create DNS record
              </li>
            </ul>

            <h3 className="text-base font-semibold">Dokploy (optional)</h3>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>
                Auth header:{" "}
                <code className="rounded bg-muted px-1 py-0.5">x-api-key: ${"{DOKPLOY_API_KEY}"}</code>
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                {"${DOKPLOY_API_URL}"}/api/application.create
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                {"${DOKPLOY_API_URL}"}/api/application.deploy
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                {"${DOKPLOY_API_URL}"}/api/domain.create
              </li>
            </ul>

            <h3 className="text-base font-semibold">GitHub</h3>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>
                Docs:{" "}
                <ExtLink href="https://docs.github.com/rest">docs.github.com/rest</ExtLink>
              </li>
              <li>
                Generate a PAT:{" "}
                <ExtLink href="https://github.com/settings/tokens">github.com/settings/tokens</ExtLink>
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                https://api.github.com/user/repos — create repo
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">POST</code>{" "}
                /repos/{"{owner}"}/{"{repo}"}/keys — create deploy key
              </li>
            </ul>
          </>
        }
      />

      <Section
        eyebrow="Operations"
        title="Day-2: update, rollback, rotate"
        body={
          <>
            <h3 className="text-base font-semibold">Deploy an update</h3>
            <CodeBlock
              code={`ssh user@<vps-ip>
cd ~/projects/vps-control-room
git pull origin main
bash scripts/deploy.sh main`}
              language="bash"
              filename="terminal (VPS)"
            />

            <h3 className="text-base font-semibold">Rollback (one-shot)</h3>
            <CodeBlock
              code={`cd ~/projects/vps-control-room/frontend
mv .next .next-broken
mv .next-previous .next
sudo systemctl restart vps-control-room-frontend`}
              language="bash"
              filename="terminal (VPS)"
            />

            <h3 className="text-base font-semibold">Rotate secrets</h3>
            <CodeBlock
              code={`# on the VPS
NEW=$(openssl rand -hex 32)
NEW_SESSION=$(openssl rand -hex 32)
sed -i "s/^CONTROL_ROOM_SECRET=.*/CONTROL_ROOM_SECRET=$NEW/" .env.local
sed -i "s/^CONTROL_ROOM_SESSION_SECRET=.*/CONTROL_ROOM_SESSION_SECRET=$NEW_SESSION/" .env.local
sudo systemctl restart vps-control-room-agent vps-control-room-frontend
echo "new login: $NEW"
echo "(save in password manager, then clear scrollback)"`}
              language="bash"
              filename="terminal (VPS)"
            />
          </>
        }
      />

      <Section
        eyebrow="Skill"
        title="/sc-all anchor"
        body={
          <>
            <p className="text-muted-foreground">
              The AI prompt auto-loads the{" "}
              <code className="rounded bg-muted px-1 py-0.5">sc-all</code> skill if you have it
              installed at <code className="rounded bg-muted px-1 py-0.5">~/.claude/skills/sc-all/</code>{" "}
              (or the equivalent for Codex / Gemini). <code className="rounded bg-muted px-1 py-0.5">/sc-all</code>{" "}
              orchestrates:
            </p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
              <li>GitHub repo ensure (private fork) + push</li>
              <li>Dokploy project + application creation</li>
              <li>Self-hosted Convex deploy (skipped — Control Room is terminal-only)</li>
              <li>DNS record creation</li>
              <li>Deploy poll until done</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              For Control Room, <code className="rounded bg-muted px-1 py-0.5">/sc-all</code>{" "}
              skips Convex but reuses the GitHub + Dokploy + DNS phases. The{" "}
              <code className="rounded bg-muted px-1 py-0.5">rahman-cr install</code> one-liner
              also reuses this sequencing.
            </p>
          </>
        }
      />

      <Section
        eyebrow="Troubleshoot"
        title="Common symptoms"
        body={
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Symptom</th>
                  <th className="px-3 py-2 text-left font-medium">Likely cause</th>
                  <th className="px-3 py-2 text-left font-medium">Fix</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["ssh: connection refused", "VPS firewall blocking port 22", "Open port 22 in provider firewall"],
                  ["tailscale up hangs", "Auth key expired or wrong tags", "Regenerate at admin.tailscale.com/settings/keys"],
                  ["dig returns nothing", "DNS not propagated", "Wait 5 min, try dig +trace"],
                  ["Login page says invalid", "Secret mismatch", "Re-check .env.local on the VPS"],
                  ["White dashboard after deploy", "Build failed silently", "journalctl -u vps-control-room-frontend"],
                  ["systemctl shows failed", "Wrong WorkingDirectory", "Re-run scripts/install-systemd.sh from repo root"],
                ].map((row) => (
                  <tr key={row[0]} className="border-t">
                    {row.map((cell, i) => (
                      <td key={i} className="px-3 py-2 align-top">
                        {i === 2 ? <code className="rounded bg-muted px-1 py-0.5 text-xs">{cell}</code> : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }
      />

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

function Section({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="space-y-3">{body}</div>
    </section>
  );
}

function PathMatrix() {
  const paths = [
    {
      icon: "🤖",
      label: "AI-assisted",
      command: "npx rahman-cr ai claude",
      time: "~20 min",
      best: "Walk through every step with Claude / Codex / Gemini",
    },
    {
      icon: "⚡",
      label: "One-line",
      command: "npx rahman-cr install --vps … --domain …",
      time: "~10 min",
      best: "All values ready, want minimum prompts",
    },
    {
      icon: "🛠️",
      label: "Manual",
      command: "See Phase 5 → C below",
      time: "~30 min",
      best: "Want to read each step before running it",
    },
  ];
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Three install paths</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {paths.map((p) => (
          <div key={p.label} className="rounded-lg border bg-card p-4">
            <p className="text-2xl">{p.icon}</p>
            <p className="mt-2 font-semibold">{p.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.time}</p>
            <code className="mt-3 block break-all rounded bg-muted px-2 py-1 font-mono text-[11px]">
              {p.command}
            </code>
            <p className="mt-3 text-xs text-muted-foreground">{p.best}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
    >
      {children}
      <ExternalLink className="size-3" />
    </Link>
  );
}
